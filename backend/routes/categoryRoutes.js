import express from 'express';
import {
  createCategory,
  getCategoriesByOrg,
  updateCategory,
  deleteCategory,
  updateCategoryMembers
} from '../controllers/categoryController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create', protect, createCategory);
router.get('/org/:orgId', protect, getCategoriesByOrg);
router.put('/:categoryId', protect, updateCategory);
router.delete('/:categoryId', protect, deleteCategory);
router.put('/:categoryId/members', protect, updateCategoryMembers);

export default router;