import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import authRoutes from './server/routes/authRoutes';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  // Konfigurasi CORS: Izinkan origin custom domain, GitHub Pages, production, dan localhost
  const allowedOrigins = [
    'https://culturz.my.id',
    'http://culturz.my.id',
    'https://sazilihafidz060107-sketch.github.io',
    'http://localhost:3000',
    'http://localhost:5173',
    process.env.FRONTEND_URL,
  ].filter(Boolean) as string[];

  app.use(cors({
    origin: (origin, callback) => {
      // Izinkan permintaan tanpa origin (misalnya tools API, curl, server-to-server)
      if (!origin) return callback(null, true);
      // Izinkan origin yang cocok dengan daftar allowedOrigins atau subdomain github.io / dev previews
      if (
        allowedOrigins.some((allowed) => origin.startsWith(allowed)) ||
        origin.endsWith('.github.io') ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1') ||
        origin.includes('run.app')
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Fallback permissive agar tidak memblokir pengujian frontend
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  }));

  // Tangani preflight OPTIONS secara eksplisit
  app.options('*', cors());

  app.use(express.json());

  // Mount API Authentication & User Routes
  app.use('/api', authRoutes);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      service: 'SIM Cinemind API',
      timestamp: new Date().toISOString()
    });
  });

  if (!isProduction) {
    // Mount Vite middleware in development
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CINEMIND] Server full-stack berjalan di http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[CINEMIND] Error starting server:', err);
});
