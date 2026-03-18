import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import orgRoutes from './routes/orgRoutes.js';
import fileRoutes from './routes/fileRoutes.js';

dotenv.config();
connectDB();

const app = express();

app.use(express.json());

// // Temporary debug middleware
// app.use((req, res, next) => {
//   console.log(`➡️  ${req.method} ${req.url}`);
//   next();
// });

app.use('/api/auth', authRoutes);
app.use('/api/org', orgRoutes);
app.use('/api/files', fileRoutes);

app.get('/', (req, res) => {
  res.send('TransX API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});