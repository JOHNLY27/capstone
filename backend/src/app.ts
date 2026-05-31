import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

// Route imports
import { authRouter } from './routes/auth.routes.js';
import { orderRouter } from './routes/order.routes.js';
import { walletRouter } from './routes/wallet.routes.js';
import { adminRouter } from './routes/admin.routes.js';
import { favoriteRouter } from './routes/favorite.routes.js';
import { addressRouter } from './routes/address.routes.js';
import { supportRouter } from './routes/support.routes.js';

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Basic Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    service: 'capstone-delivery-api',
  });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/orders', orderRouter);
app.use('/api/wallet', walletRouter);
app.use('/api/admin', adminRouter);
app.use('/api/favorites', favoriteRouter);
app.use('/api/addresses', addressRouter);
app.use('/api/support', supportRouter);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Error:', err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    success: false,
    error: message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

export default app;
