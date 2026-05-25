// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";
import crypto from "crypto";
import { uploadToB2, downloadFromB2, deleteFromB2 } from "../utils/b2Storage.js";
import File from "../models/File.js";
import Organization from "../models/Organization.js";
import { encryptFile, decryptFile } from "../utils/encryption.js";
import { logActivity } from "../utils/activityLogger.js";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const uploadDir = path.join(__dirname, "..", "uploads");

// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir);
// }

// Helper — get member's role in org
const getMemberRole = (org, userId) => {
  const member = org.members.find((m) => {
    const memberId = m.user._id ? m.user._id.toString() : m.user.toString();
    return memberId === userId.toString();
  });
  return member ? member.role : null;
};

// @route  POST /api/files/upload/:orgId
export const uploadFile = async (req, res) => {
  try {
    const org = await Organization.findById(req.params.orgId);
    if (!org)
      return res.status(404).json({ message: "Organization not found" });

    const role = getMemberRole(org, req.user._id);

    // Allow upload if: admin/uploader role OR org allows all uploads
    if (
      !role ||
      (!["admin", "uploader"].includes(role) && !org.allowAllUploads)
    ) {
      return res.status(403).json({
        message:
          "You do not have permission to upload files. Contact your admin.",
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file provided" });
    }

    let sharedWithCategories = [];
    let allowedUsers = [];

    if (req.body.sharedWithCategories) {
      try {
        sharedWithCategories = JSON.parse(req.body.sharedWithCategories);
      } catch {
        sharedWithCategories = [];
      }
    }

    if (req.body.allowedUsers) {
      try {
        allowedUsers = JSON.parse(req.body.allowedUsers);
      } catch {
        allowedUsers = [];
      }
    }

    if (!allowedUsers.includes(req.user._id.toString())) {
      allowedUsers.push(req.user._id.toString());
    }

    const encryptedBuffer = encryptFile(req.file.buffer);
    const storedName = crypto.randomBytes(16).toString("hex") + ".enc";
    // const filePath = path.join(uploadDir, storedName);
    // fs.writeFileSync(filePath, encryptedBuffer);
    await uploadToB2(encryptedBuffer, storedName, "application/octet-stream");

    const file = await File.create({
      originalName: req.file.originalname,
      storedName,
      mimeType: req.file.mimetype,
      size: req.file.size,
      organization: org._id,
      uploadedBy: req.user._id,
      sharedWithCategories,
      allowedUsers,
    });

    // Update notification fields on the org
    const allowedUserIds = allowedUsers.map((id) => id.toString());

    const memberIds = org.members.map((m) =>
      m.user._id ? m.user._id.toString() : m.user.toString(),
    );

    for (const memberId of memberIds) {
      // Only notify if they have access AND they're not the uploader
      if (
        memberId !== req.user._id.toString() &&
        allowedUserIds.includes(memberId)
      ) {
        const current = org.unreadCounts.get(memberId) || 0;
        org.unreadCounts.set(memberId, current + 1);
      }
    }
    org.lastFileUploadedAt = new Date();
    await org.save();

    // Log upload activity
    await logActivity(org._id, "upload", req.user._id, {
      fileName: req.file.originalname,
    });

    res.status(201).json({
      message: "File uploaded successfully",
      file: {
        id: file._id,
        name: file.originalName,
        size: file.size,
        uploadedBy: req.user.name,
        uploadedAt: file.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  GET /api/files/org/:orgId
export const getFilesByOrg = async (req, res) => {
  try {
    const org = await Organization.findById(req.params.orgId);
    if (!org)
      return res.status(404).json({ message: "Organization not found" });

    const role = getMemberRole(org, req.user._id);
    if (!role) return res.status(403).json({ message: "Access denied" });

    if (role === "admin") {
      // Admin sees ALL files
      const files = await File.find({
        organization: org._id,
        isDeleted: { $ne: true },
      })
        .populate("uploadedBy", "name email")
        .populate("sharedWithCategories", "name")
        .populate("allowedUsers", "name email")
        .select(
          "originalName mimeType size uploadedBy sharedWithCategories allowedUsers createdAt isRecovered",
        );
      return res.status(200).json({ files });
    }

    // Find categories this user belongs to
    const Category = (await import("../models/Category.js")).default;
    const userCategories = await Category.find({
      organization: org._id,
      members: req.user._id,
    });

    const categoryIds = userCategories.map((c) => c._id);

    // Files accessible if:
    // 1. User is in allowedUsers directly
    // 2. User belongs to a category the file is shared with
    const files = await File.find({
      organization: org._id,
      isDeleted: { $ne: true },
      $or: [
        { allowedUsers: req.user._id },
        { sharedWithCategories: { $in: categoryIds } },
      ],
    })
      .populate("uploadedBy", "name email")
      .populate("sharedWithCategories", "name")
      .populate("allowedUsers", "name email")
      .select(
        "originalName mimeType size uploadedBy sharedWithCategories allowedUsers createdAt isRecovered",
      );
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
    if (!file) return res.status(404).json({ message: "File not found" });
    if (file.isDeleted)
      return res.status(404).json({ message: "File is in trash" }); //trash check right after finding the file
    const org = await Organization.findById(file.organization);
    const role = getMemberRole(org, req.user._id);

    // Admin always has access
    if (role === "admin") {
      // const filePath = path.join(uploadDir, file.storedName);
      // if (!fs.existsSync(filePath)) {
      //   return res.status(404).json({ message: "File not found on server" });
      // }
      // const decryptedBuffer = decryptFile(fs.readFileSync(filePath));
      const encryptedBuffer = await downloadFromB2(file.storedName);
const decryptedBuffer = decryptFile(encryptedBuffer);
      file.accessLog.push({ user: req.user._id });
      await file.save();
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${file.originalName}"`,
      );
      res.setHeader("Content-Type", file.mimeType);
      return res.send(decryptedBuffer);
    }

    // Check direct access
    const hasDirectAccess = file.allowedUsers.some(
      (u) => u.toString() === req.user._id.toString(),
    );

    // Check category access
    const Category = (await import("../models/Category.js")).default;
    const userCategories = await Category.find({
      organization: org._id,
      members: req.user._id,
    });
    const categoryIds = userCategories.map((c) => c._id.toString());
    const hasCategoryAccess = file.sharedWithCategories.some((c) =>
      categoryIds.includes(c.toString()),
    );

    if (!hasDirectAccess && !hasCategoryAccess) {
      return res
        .status(403)
        .json({ message: "You do not have access to this file" });
    }

    // const filePath = path.join(uploadDir, file.storedName);
    // if (!fs.existsSync(filePath)) {
    //   return res.status(404).json({ message: "File not found on server" });
    // }

    // const encryptedBuffer = fs.readFileSync(filePath);
    const encryptedBuffer = await downloadFromB2(file.storedName);
    const decryptedBuffer = decryptFile(encryptedBuffer);

    file.accessLog.push({ user: req.user._id });
    await file.save();

    // Log download activity
    await logActivity(file.organization, "download", req.user._id, {
      fileName: file.originalName,
    });

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${file.originalName}"`,
    );
    res.setHeader("Content-Type", file.mimeType);
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
    if (!file) return res.status(404).json({ message: "File not found" });

    const org = await Organization.findById(file.organization);
    const role = getMemberRole(org, req.user._id);

    const canManage =
      role === "admin" ||
      file.uploadedBy.toString() === req.user._id.toString();

    if (!canManage) {
      return res
        .status(403)
        .json({ message: "Only admin or uploader can grant access" });
    }

    const targetRole = getMemberRole(org, userId);
    if (!targetRole) {
      return res
        .status(400)
        .json({ message: "User is not a member of this organization" });
    }

    if (file.allowedUsers.some((u) => u.toString() === userId)) {
      return res.status(400).json({ message: "User already has access" });
    }

    file.allowedUsers.push(userId);
    await file.save();

    res.status(200).json({ message: "Access granted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  DELETE /api/files/access/:fileId
export const revokeAccess = async (req, res) => {
  try {
    const { userId } = req.body;
    const file = await File.findById(req.params.fileId);
    if (!file) return res.status(404).json({ message: "File not found" });

    const org = await Organization.findById(file.organization);
    const role = getMemberRole(org, req.user._id);

    const canManage =
      role === "admin" ||
      file.uploadedBy.toString() === req.user._id.toString();

    if (!canManage) {
      return res
        .status(403)
        .json({ message: "Only admin or uploader can revoke access" });
    }

    if (userId === file.uploadedBy.toString()) {
      return res
        .status(400)
        .json({ message: "Cannot revoke uploader's own access" });
    }

    file.allowedUsers = file.allowedUsers.filter(
      (u) => u.toString() !== userId.toString(),
    );
    await file.save();

    res.status(200).json({ message: "Access revoked successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  DELETE /api/files/delete/:fileId
export const deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId);
    if (!file) return res.status(404).json({ message: "File not found" });

    const org = await Organization.findById(file.organization);
    const role = getMemberRole(org, req.user._id);

    const canDelete =
      role === "admin" ||
      file.uploadedBy.toString() === req.user._id.toString();

    if (!canDelete) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this file" });
    }

    // Soft delete — don't remove from disk yet
    file.isDeleted = true;
    file.deletedAt = new Date();
    file.deletedBy = req.user._id;
    await file.save();

    // Keep only last 10 files in trash per org
    const trashedFiles = await File.find({
      organization: file.organization,
      isDeleted: true,
    }).sort({ deletedAt: -1 });

    if (trashedFiles.length > 10) {
      const toDelete = trashedFiles.slice(10);
      for (const f of toDelete) {
        // const filePath = path.join(uploadDir, f.storedName);
        // if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
         try { await deleteFromB2(f.storedName); } catch (_) {}
        await f.deleteOne();
      }
    }

    await logActivity(file.organization, "delete", req.user._id, {
      fileName: file.originalName,
    });

    res.status(200).json({ message: "File moved to trash" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  GET /api/files/logs/:fileId
export const getAccessLogs = async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId).populate(
      "accessLog.user",
      "name email",
    );

    if (!file) return res.status(404).json({ message: "File not found" });

    const org = await Organization.findById(file.organization);
    const role = getMemberRole(org, req.user._id);

    if (role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admin can view access logs" });
    }

    res.status(200).json({ accessLog: file.accessLog });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/files/access/:fileId
export const updateFileAccess = async (req, res) => {
  try {
    const { sharedWithCategories, allowedUsers } = req.body;

    const file = await File.findById(req.params.fileId);
    if (!file) return res.status(404).json({ message: "File not found" });

    const org = await Organization.findById(file.organization);
    const role = getMemberRole(org, req.user._id);

    const canManage =
      role === "admin" ||
      file.uploadedBy.toString() === req.user._id.toString();

    if (!canManage) {
      return res
        .status(403)
        .json({ message: "Only admin or uploader can edit access" });
    }

    // Uploader must always keep access
    const uploaderId = file.uploadedBy.toString();
    if (!allowedUsers.includes(uploaderId)) {
      allowedUsers.push(uploaderId);
    }

    file.sharedWithCategories = sharedWithCategories;
    file.allowedUsers = allowedUsers;
    await file.save();

    res.status(200).json({ message: "Access updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/files/recent/:orgId
export const getRecentDownloads = async (req, res) => {
  try {
    const org = await Organization.findById(req.params.orgId);
    if (!org)
      return res.status(404).json({ message: "Organization not found" });

    const role = getMemberRole(org, req.user._id);
    if (!role) return res.status(403).json({ message: "Access denied" });

    // Find files this user has downloaded (in accessLog)
    const files = await File.find({
      organization: req.params.orgId,
      "accessLog.user": req.user._id,
    })
      .populate("uploadedBy", "name email")
      .select("originalName mimeType size uploadedBy accessLog createdAt");

    // Sort by most recent access and take top 10
    const withLastAccess = files.map((file) => {
      const userLogs = file.accessLog
        .filter((log) => log.user.toString() === req.user._id.toString())
        .sort((a, b) => new Date(b.accessedAt) - new Date(a.accessedAt));
      return {
        _id: file._id,
        originalName: file.originalName,
        mimeType: file.mimeType,
        size: file.size,
        uploadedBy: file.uploadedBy,
        lastDownloadedAt: userLogs[0]?.accessedAt,
      };
    });

    const sorted = withLastAccess
      .sort(
        (a, b) => new Date(b.lastDownloadedAt) - new Date(a.lastDownloadedAt),
      )
      .slice(0, 10);

    res.status(200).json({ files: sorted });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/files/activity/:orgId
export const getActivityLog = async (req, res) => {
  try {
    const org = await Organization.findById(req.params.orgId).populate(
      "activityLog.user",
      "name email",
    );

    if (!org)
      return res.status(404).json({ message: "Organization not found" });

    const role = getMemberRole(org, req.user._id);
    if (role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admin can view activity log" });
    }

    // Sort by most recent
    const activity = [...org.activityLog]
      .sort((a, b) => new Date(b.at) - new Date(a.at))
      .slice(0, 100);

    res.status(200).json({ activity });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/files/trash/:orgId
export const getTrash = async (req, res) => {
  try {
    const org = await Organization.findById(req.params.orgId);
    if (!org)
      return res.status(404).json({ message: "Organization not found" });

    const role = getMemberRole(org, req.user._id);
    if (role !== "admin") {
      return res.status(403).json({ message: "Only admin can view trash" });
    }

    const files = await File.find({
      organization: req.params.orgId,
      isDeleted: true,
    })
      .populate("uploadedBy", "name email")
      .populate("deletedBy", "name email")
      .sort({ deletedAt: -1 })
      .select(
        "originalName mimeType size uploadedBy deletedBy deletedAt createdAt",
      );

    const filesWithDays = files.map((file) => {
      const deletedAt = new Date(file.deletedAt);
      const expiresAt = new Date(
        deletedAt.getTime() + 30 * 24 * 60 * 60 * 1000,
      );
      const daysRemaining = Math.ceil(
        (expiresAt - new Date()) / (1000 * 60 * 60 * 24),
      );
      return {
        ...file.toObject(),
        daysRemaining: Math.max(0, daysRemaining),
        expiresAt,
      };
    });

    res.status(200).json({ files: filesWithDays });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/files/restore/:fileId
export const restoreFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId);
    if (!file) return res.status(404).json({ message: "File not found" });

    const org = await Organization.findById(file.organization);
    const role = getMemberRole(org, req.user._id);

    if (role !== "admin") {
      return res.status(403).json({ message: "Only admin can restore files" });
    }

    if (!file.isDeleted) {
      return res.status(400).json({ message: "File is not in trash" });
    }

    // Restore — allowedUsers and sharedWithCategories untouched
    file.isDeleted = false;
    file.deletedAt = null;
    file.deletedBy = null;
    file.isRecovered = true;
    file.recoveredAt = new Date();
    file.recoveredBy = req.user._id;
    await file.save();

    await logActivity(file.organization, "restore", req.user._id, {
      fileName: file.originalName,
    });

    res.status(200).json({ message: "File restored successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route DELETE /api/files/permanent/:fileId
export const permanentDelete = async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId);
    if (!file) return res.status(404).json({ message: "File not found" });

    const org = await Organization.findById(file.organization);
    const role = getMemberRole(org, req.user._id);

    if (role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admin can permanently delete files" });
    }

    // const filePath = path.join(uploadDir, file.storedName);
    // if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    try { await deleteFromB2(file.storedName); } catch (_) {}
    await file.deleteOne();

    res.status(200).json({ message: "File permanently deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
