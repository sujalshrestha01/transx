import express from 'express';
import {
  uploadFile,
  getFilesByOrg,
  downloadFile,
  deleteFile,
  getAccessLogs,
  grantAccess,
  revokeAccess,
  updateFileAccess,
  getRecentDownloads,
  getActivityLog,
  getTrash,
  restoreFile,
  permanentDelete
} from '../controllers/fileController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/upload/:orgId', protect, upload.single('file'), uploadFile);
router.get('/download/:fileId', protect, downloadFile);
router.get('/logs/:fileId', protect, getAccessLogs);
router.get('/recent/:orgId', protect, getRecentDownloads);
router.get('/activity/:orgId', protect, getActivityLog);
router.post('/access/:fileId', protect, grantAccess);
router.put('/access/:fileId', protect, updateFileAccess);
router.delete('/access/:fileId', protect, revokeAccess);
router.delete('/delete/:fileId', protect, deleteFile);
router.get('/org/:orgId', protect, getFilesByOrg);
// --- TRASH ROUTES ---
router.get('/trash/:orgId', protect, getTrash);
router.put('/restore/:fileId', protect, restoreFile);
router.delete('/permanent/:fileId', protect, permanentDelete);

export default router;