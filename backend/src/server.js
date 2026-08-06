import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import topicsRoutes from './routes/topics.js';
import lessonsRoutes from './routes/lessons.js';
import farmRoutes from './routes/farm.js';
import productionRoutes from './routes/production.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/topics', topicsRoutes);
app.use('/api/lessons', lessonsRoutes);
app.use('/api/farm', farmRoutes);
app.use('/api/production', productionRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MathKids API is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
