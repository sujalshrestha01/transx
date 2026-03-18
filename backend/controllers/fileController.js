import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import File from '../models/File.js';
import Organization from '../models/Organization.js';
import { encryptFile, decryptFile } from '../utils/encryption.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Helper — get member's role in org
const getMemberRole = (org, userId) => {
  const member = org.members.find(
    (m) => m.user.toString() === userId.toString()
  );
  return member ? member.role : null;
};

// @route  POST /api/files/upload/:orgId
export const uploadFile = async (req, res) => {
  try {
    const org = await Organization.findById(req.params.orgId);
    if (!org) return res.status(404).json({ message: 'Organization not found' });

    const role = getMemberRole(org, req.user._id);
    if (!role || !['admin', 'uploader'].includes(role)) {
      return res.status(403).json({
        message: 'You do not have permission to upload files.'
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    // Parse categories and individual users from form data
    let sharedWithCategories = [];
    let allowedUsers = [];

    if (req.body.sharedWithCategories) {
      try { sharedWithCategories = JSON.parse(req.body.sharedWithCategories); }
      catch { sharedWithCategories = []; }
    }

    if (req.body.allowedUsers) {
      try { allowedUsers = JSON.parse(req.body.allowedUsers); }
      catch { allowedUsers = []; }
    }

    // Uploader always has access
    if (!allowedUsers.includes(req.user._id.toString())) {
      allowedUsers.push(req.user._id.toString());
    }

    const encryptedBuffer = encryptFile(req.file.buffer);
    const storedName = crypto.randomBytes(16).toString('hex') + '.enc';
    const filePath = path.join(uploadDir, storedName);
    fs.writeFileSync(filePath, encryptedBuffer);

    const file = await File.create({
      originalName: req.file.originalname,
      storedName,
      mimeType: req.file.mimetype,
      size: req.file.size,
      organization: org._id,
      uploadedBy: req.user._id,
      sharedWithCategories,
      allowedUsers
    });

    res.status(201).json({
      message: 'File uploaded successfully',
      file: {
        id: file._id,
        name: file.originalName,
        size: file.size,
        uploadedBy: req.user.name,
        uploadedAt: file.createdAt
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  GET /api/files/org/:orgId
export const getFilesByOrg = async (req, res) => {
  try {
    const org = await Organization.findById(req.params.orgId);
    if (!org) return res.status(404).json({ message: 'Organization not found' });

    const role = getMemberRole(org, req.user._id);
    if (!role) return res.status(403).json({ message: 'Access denied' });

    if (role === 'admin') {
      // Admin sees ALL files
      const files = await File.find({ organization: org._id })
        .populate('uploadedBy', 'name email')
        .populate('sharedWithCategories', 'name')
        .populate('allowedUsers', 'name email')
        .select('originalName mimeType size uploadedBy sharedWithCategories allowedUsers createdAt');
      return res.status(200).json({ files });
    }

    // Find categories this user belongs to
    const Category = (await import('../models/Category.js')).default;
    const userCategories = await Category.find({
      organization: org._id,
      members: req.user._id
    });

    const categoryIds = userCategories.map(c => c._id);

    // Files accessible if:
    // 1. User is in allowedUsers directly
    // 2. User belongs to a category the file is shared with
    const files = await File.find({
      organization: org._id,
      $or: [
        { allowedUsers: req.user._id },
        { sharedWithCategories: { $in: categoryIds } }
      ]
    })
      .populate('uploadedBy', 'name email')
      .select('originalName mimeType size uploadedBy createdAt');

    res.status(200).json({ files });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  GET /api/files/download/:fileId
// @route GET /api/files/download/:fileId
export const downloadFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId);
    if (!file) return res.status(404).json({ message: 'File not found' });

    const org = await Organization.findById(file.organization);
    const role = getMemberRole(org, req.user._id);

    // Admin always has access
    if (role === 'admin') {
      const filePath = path.join(uploadDir, file.storedName);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'File not found on server' });
      }
      const decryptedBuffer = decryptFile(fs.readFileSync(filePath));
      file.accessLog.push({ user: req.user._id });
      await file.save();
      res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
      res.setHeader('Content-Type', file.mimeType);
      return res.send(decryptedBuffer);
    }

    // Check direct access
    const hasDirectAccess = file.allowedUsers.some(
      (u) => u.toString() === req.user._id.toString()
    );

    // Check category access
    const Category = (await import('../models/Category.js')).default;
    const userCategories = await Category.find({
      organization: org._id,
      members: req.user._id
    });
    const categoryIds = userCategories.map(c => c._id.toString());
    const hasCategoryAccess = file.sharedWithCategories.some(
      (c) => categoryIds.includes(c.toString())
    );

    if (!hasDirectAccess && !hasCategoryAccess) {
      return res.status(403).json({ message: 'You do not have access to this file' });
    }

    const filePath = path.join(uploadDir, file.storedName);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    const encryptedBuffer = fs.readFileSync(filePath);
    const decryptedBuffer = decryptFile(encryptedBuffer);

    file.accessLog.push({ user: req.user._id });
    await file.save();

    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    res.setHeader('Content-Type', file.mimeType);
    res.send(decryptedBuffer);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  POST /api/files/access/:fileId
export const grantAccess = async (req, res) => {
  try {
    const { userId } = req.body;
    const file = await File.findById(req.params.fileId);
    if (!file) return res.status(404).json({ message: 'File not found' });

    const org = await Organization.findById(file.organization);
    const role = getMemberRole(org, req.user._id);

    const canManage =
      role === 'admin' ||
      file.uploadedBy.toString() === req.user._id.toString();

    if (!canManage) {
      return res.status(403).json({ message: 'Only admin or uploader can grant access' });
    }

    const targetRole = getMemberRole(org, userId);
    if (!targetRole) {
      return res.status(400).json({ message: 'User is not a member of this organization' });
    }

    if (file.allowedUsers.some((u) => u.toString() === userId)) {
      return res.status(400).json({ message: 'User already has access' });
    }

    file.allowedUsers.push(userId);
    await file.save();

    res.status(200).json({ message: 'Access granted successfully' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  DELETE /api/files/access/:fileId
export const revokeAccess = async (req, res) => {
  try {
    const { userId } = req.body;
    const file = await File.findById(req.params.fileId);
    if (!file) return res.status(404).json({ message: 'File not found' });

    const org = await Organization.findById(file.organization);
    const role = getMemberRole(org, req.user._id);

    const canManage =
      role === 'admin' ||
      file.uploadedBy.toString() === req.user._id.toString();

    if (!canManage) {
      return res.status(403).json({ message: 'Only admin or uploader can revoke access' });
    }

    if (userId === file.uploadedBy.toString()) {
      return res.status(400).json({ message: "Cannot revoke uploader's own access" });
    }

    file.allowedUsers = file.allowedUsers.filter(
      (u) => u.toString() !== userId.toString()
    );
    await file.save();

    res.status(200).json({ message: 'Access revoked successfully' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  DELETE /api/files/delete/:fileId
export const deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId);
    if (!file) return res.status(404).json({ message: 'File not found' });

    const org = await Organization.findById(file.organization);
    const role = getMemberRole(org, req.user._id);

    const canDelete =
      role === 'admin' ||
      file.uploadedBy.toString() === req.user._id.toString();

    if (!canDelete) {
      return res.status(403).json({ message: 'Not authorized to delete this file' });
    }

    const filePath = path.join(uploadDir, file.storedName);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await file.deleteOne();

    res.status(200).json({ message: 'File deleted successfully' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  GET /api/files/logs/:fileId
export const getAccessLogs = async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId)
      .populate('accessLog.user', 'name email');

    if (!file) return res.status(404).json({ message: 'File not found' });

    const org = await Organization.findById(file.organization);
    const role = getMemberRole(org, req.user._id);

    if (role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can view access logs' });
    }

    res.status(200).json({ accessLog: file.accessLog });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};