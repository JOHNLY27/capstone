import { Router } from 'express';
import { getWalletDetails, topUpWallet, withdrawWallet } from '../controllers/wallet.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// All routes are protected by auth middleware
router.use(authenticate);

router.get('/', getWalletDetails);
router.post('/topup', topUpWallet);
router.post('/withdraw', withdrawWallet);

export { router as walletRouter };
