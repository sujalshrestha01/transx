import express from 'express';
import {
  createOrganization,
  joinOrganization,
  getMyOrganizations,
  updateOrganization,
  deleteOrganization  ,
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
router.get('/:orgId/members', protect, getOrgMembers);
router.put('/:orgId/role', protect, updateMemberRole);
router.put('/:orgId/bulk-role', protect, bulkUpdateRole);
router.put('/:orgId/upload-access', protect, toggleUploadAccess);
router.delete('/:orgId/remove/:userId', protect, removeMember);
router.put('/:orgId', protect, updateOrganization);
router.delete('/:orgId', protect, deleteOrganization);

export default router;