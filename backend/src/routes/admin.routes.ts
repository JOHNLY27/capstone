import { Router } from 'express';
import {
  getDashboardStats,
  getUsers,
  getRiderDocuments,
  verifyRiderDocument,
  getPendingWithdrawals,
  verifyWithdrawal,
  updateSystemSettings,
} from '../controllers/admin.controller.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = Router();

// Protect all routes: Must be authenticated and have Rile = ADMIN
router.use(authenticate);
router.use(authorizeRoles('ADMIN'));

router.get('/stats', getDashboardStats);
router.get('/users', getUsers);
router.get('/documents', getRiderDocuments);
router.put('/documents/:id/verify', verifyRiderDocument);
router.get('/withdrawals', getPendingWithdrawals);
router.put('/withdrawals/:id/verify', verifyWithdrawal);
router.put('/settings', updateSystemSettings);

export { router as adminRouter };
