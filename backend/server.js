import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import questionRoutes from './routes/questionRoutes.js';
import executeRoutes from './routes/executeRoutes.js';
import submissionRoutes from './routes/submissionRoutes.js';
import adminUserRoutes from './routes/adminUserRoutes.js';
import { seedDatabase } from './utils/seedData.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/javadsa';

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/execute', executeRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/admin/users', adminUserRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'SonuTechHub Java DSA Platform',
    timestamp: new Date().toISOString(),
    javaVersion: 'Java 24',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'connecting'
  });
});

// In Production: Serve frontend static build files
const frontendDistPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDistPath));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'API endpoint not found' });
  }
  res.sendFile(path.join(frontendDistPath, 'index.html'), (err) => {
    if (err) {
      res.send('SonuTechHub Java DSA Platform API is running. (Frontend dist not built yet)');
    }
  });
});

// Connect to MongoDB
console.log('Connecting to MongoDB at:', MONGO_URI);

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB successfully!');
    await seedDatabase();
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
  });

app.listen(PORT, () => {
  console.log(`🚀 SonuTechHub Server running on http://localhost:${PORT}`);
});
