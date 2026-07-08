import express from 'express';
import authRoutes from './routes/auth.js';
import articleRoutes from './routes/articles.js';
import { performNewsSync } from './services/newsSync.js';

const app = express();

// Simple zero-dependency CORS configuration
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Middleware to parse incoming request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register API routers
app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);

// Manual news sync trigger (for dev/testing)
app.post('/api/admin/sync-now', async (req, res) => {
  res.json({ message: 'News sync started in background...' });
  performNewsSync().catch(err => console.error('[ManualSync] Error:', err.message));
});

// Basic health/status route
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Haldwani Times Backend Server is running successfully!',
    timestamp: new Date().toISOString()
  });
});

export default app;
