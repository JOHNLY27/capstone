import { Router } from 'express';
import {
  getSupportMessages,
  sendSupportMessage,
  getAdminThreads,
  getAdminThreadDetails
} from '../controllers/support.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

// Customer endpoints
router.get('/messages', getSupportMessages);
router.post('/messages', sendSupportMessage);

// Admin support dashboard endpoints
router.get('/admin/threads', getAdminThreads);
router.get('/admin/threads/:customerId', getAdminThreadDetails);

export { router as supportRouter };
