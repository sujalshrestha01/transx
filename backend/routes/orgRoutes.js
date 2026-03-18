import express from 'express';
import {
  createOrganization,
  joinOrganization,
  getMyOrganizations,
  getOrgMembers,
  updateMemberRole,
  removeMember
} from '../controllers/orgController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create', protect, createOrganization);
router.post('/join', protect, joinOrganization);
router.get('/my', protect, getMyOrganizations);
router.get('/:orgId/members', protect, getOrgMembers);
router.put('/:orgId/role', protect, updateMemberRole);
router.delete('/:orgId/remove/:userId', protect, removeMember);

export default router;