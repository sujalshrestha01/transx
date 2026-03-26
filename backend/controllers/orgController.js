import Organization from '../models/Organization.js';

// @route  POST /api/org/create
export const createOrganization = async (req, res) => {
  try {
    const { name } = req.body;

    const org = await Organization.create({
      name,
      admin: req.user._id,
      members: [{ user: req.user._id, role: 'admin' }]
    });

    res.status(201).json({
      message: 'Organization created successfully',
      organization: {
        id: org._id,
        name: org.name,
        joinCode: org.joinCode
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  POST /api/org/join
export const joinOrganization = async (req, res) => {
  try {
    const { joinCode } = req.body;

    const org = await Organization.findOne({ joinCode });
    if (!org) {
      return res.status(404).json({ message: 'Invalid join code' });
    }

    const alreadyMember = org.members.some(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (alreadyMember) {
      return res.status(400).json({ message: 'Already a member' });
    }

    // New members get 'member' role by default
    org.members.push({ user: req.user._id, role: 'member' });
    await org.save();

    res.status(200).json({
      message: `Joined "${org.name}" successfully`,
      organization: { id: org._id, name: org.name }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  GET /api/org/my
export const getMyOrganizations = async (req, res) => {
  try {
    const orgs = await Organization.find({
      'members.user': req.user._id
    })
      .populate('admin', 'name email')
      .populate('members.user', 'name email');

    res.status(200).json({ organizations: orgs });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  GET /api/org/:orgId/members
export const getOrgMembers = async (req, res) => {
  try {
    const org = await Organization.findById(req.params.orgId)
      .populate('members.user', 'name email');

    if (!org) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    const isMember = org.members.some(
      (m) => m.user._id.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json({ members: org.members });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  PUT /api/org/:orgId/role
export const updateMemberRole = async (req, res) => {
  try {
    const { userId, role } = req.body;

    if (!['member', 'uploader', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const org = await Organization.findById(req.params.orgId);
    if (!org) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Only admin can change roles
    if (org.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only admin can change roles' });
    }

    // Cannot change own role
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot change your own role' });
    }

    const memberIndex = org.members.findIndex(
      (m) => m.user.toString() === userId
    );

    if (memberIndex === -1) {
      return res.status(404).json({ message: 'Member not found' });
    }

    org.members[memberIndex].role = role;

    // If promoted to admin, update org admin field too
    if (role === 'admin') {
      org.admin = userId;
    }

    await org.save();

    res.status(200).json({ message: `Role updated to "${role}" successfully` });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  DELETE /api/org/:orgId/remove/:userId
export const removeMember = async (req, res) => {
  try {
    const org = await Organization.findById(req.params.orgId);

    if (!org) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    if (org.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only admin can remove members' });
    }

    if (req.params.userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Admin cannot remove themselves' });
    }

    org.members = org.members.filter(
      (m) => m.user.toString() !== req.params.userId
    );
    await org.save();

    res.status(200).json({ message: 'Member removed successfully' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/org/:orgId/upload-access
export const toggleUploadAccess = async (req, res) => {
  try {
    const org = await Organization.findById(req.params.orgId);
    if (!org) return res.status(404).json({ message: 'Organization not found' });

    if (org.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only admin can change this setting' });
    }

    org.allowAllUploads = req.body.allowAllUploads;
    await org.save();

    res.status(200).json({
      message: `Upload access ${req.body.allowAllUploads ? 'enabled' : 'disabled'} for all members`,
      allowAllUploads: org.allowAllUploads
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/org/:orgId/bulk-role
export const bulkUpdateRole = async (req, res) => {
  try {
    const { userIds, role } = req.body;

    if (!['member', 'uploader', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const org = await Organization.findById(req.params.orgId);
    if (!org) return res.status(404).json({ message: 'Organization not found' });

    if (org.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only admin can change roles' });
    }

    org.members = org.members.map((m) => {
      // Don't change admin's own role
      if (m.user.toString() === req.user._id.toString()) return m;
      if (userIds.includes(m.user.toString())) {
        m.role = role;
      }
      return m;
    });

    await org.save();

    res.status(200).json({ message: `Roles updated successfully` });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};