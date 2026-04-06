import cron from 'node-cron';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import File from '../models/File.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '..', 'uploads');

export const startCleanupJob = () => {
  // Runs every day at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('🧹 Running trash cleanup job...');
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const expiredFiles = await File.find({
        isDeleted: true,
        deletedAt: { $lte: thirtyDaysAgo }
      });

      console.log(`🗑️ Found ${expiredFiles.length} expired files`);

      for (const file of expiredFiles) {
        const filePath = path.join(uploadDir, file.storedName);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        await file.deleteOne();
      }

      console.log('✅ Trash cleanup complete');
    } catch (err) {
      console.error('❌ Cleanup job error:', err.message);
    }
  });

  console.log('⏰ Trash cleanup job scheduled (runs daily at midnight)');
};