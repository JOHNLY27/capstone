import { Router } from 'express';
import {
  registerCustomer,
  registerRider,
  login,
  getProfile,
  updateProfile,
  getSettings,
  updateSettings,
  changePassword,
  deleteAccount,
  getWeeklyFeeStatus,
  settleWeeklyFee,
  getSystemSettings,
} from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// Public Routes
router.post('/register/customer', registerCustomer);
router.post('/register/rider', registerRider);
router.post('/login', login);

// Private Routes
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.get('/settings', authenticate, getSettings);
router.put('/settings', authenticate, updateSettings);
router.post('/change-password', authenticate, changePassword);
router.delete('/delete-account', authenticate, deleteAccount);
router.get('/weekly-fee-status', authenticate, getWeeklyFeeStatus);
router.post('/settle-weekly-fee', authenticate, settleWeeklyFee);
router.get('/system-settings', authenticate, getSystemSettings);

export { router as authRouter };
