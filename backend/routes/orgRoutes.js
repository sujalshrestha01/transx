import express from 'express';
import {
  createOrganization,
  joinOrganization,
  getMyOrganizations,
   markOrgAsRead,
  updateOrganization,
  deleteOrganization  ,
  leaveOrganization,
  getOrgMembers,
  updateMemberRole,
  removeMember,
  toggleUploadAccess,
  bulkUpdateRole
} from '../controllers/orgController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create', protect, createOrganization);
router.post('/join', protect, joinOrganization);
router.get('/my', protect, getMyOrganizations);
router.post('/:orgId/read', protect, markOrgAsRead);
router.get('/:orgId/members', protect, getOrgMembers);
router.put('/:orgId/role', protect, updateMemberRole);
router.put('/:orgId/bulk-role', protect, bulkUpdateRole);
router.put('/:orgId/upload-access', protect, toggleUploadAccess);
router.delete('/:orgId/remove/:userId', protect, removeMember);
router.put('/:orgId', protect, updateOrganization);
router.delete('/:orgId/leave', protect, leaveOrganization);
router.delete('/:orgId', protect, deleteOrganization);

export default router;