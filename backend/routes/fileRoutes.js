import express from 'express';
import {
  uploadFile,
  getFilesByOrg,
  downloadFile,
  deleteFile,
  getAccessLogs,
  grantAccess,
  revokeAccess
} from '../controllers/fileController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/upload/:orgId', protect, upload.single('file'), uploadFile);
router.get('/download/:fileId', protect, downloadFile);
router.get('/logs/:fileId', protect, getAccessLogs);
router.post('/access/:fileId', protect, grantAccess);
router.delete('/access/:fileId', protect, revokeAccess);
router.delete('/delete/:fileId', protect, deleteFile);
router.get('/org/:orgId', protect, getFilesByOrg);

export default router;