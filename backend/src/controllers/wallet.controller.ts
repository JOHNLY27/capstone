import { Response, NextFunction } from 'express';
import { prisma } from '../utils/db.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export const getWalletDetails = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const transactions = await prisma.walletTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: {
        walletBalance: req.user?.walletBalance,
        transactions,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const topUpWallet = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { amount, method } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const topUpAmount = Number(amount);
    if (!topUpAmount || topUpAmount <= 0) {
      res.status(400).json({ success: false, error: 'Please enter a valid top-up amount greater than 0.' });
      return;
    }

    const paymentMethod = method || 'MOCK_GCASH';
    const referenceCode = `TUP-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Safely update balance and add transaction log inside a DB transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update user wallet balance
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          walletBalance: { increment: topUpAmount },
        },
      });

      // 2. Create Transaction log
      const transaction = await tx.walletTransaction.create({
        data: {
          userId,
          type: 'TOPUP',
          amount: topUpAmount,
          status: 'SUCCESS',
          referenceCode,
          description: `Loaded funds using ${paymentMethod.toUpperCase()}`,
        },
      });

      return { user: updatedUser, transaction };
    });

    res.status(200).json({
      success: true,
      data: {
        walletBalance: result.user.walletBalance,
        transaction: result.transaction,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const withdrawWallet = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { amount, method } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const withdrawAmount = Number(amount);
    if (!withdrawAmount || withdrawAmount <= 0) {
      res.status(400).json({ success: false, error: 'Please enter a valid withdrawal amount greater than 0.' });
      return;
    }

    const currentBalance = Number(req.user?.walletBalance || 0);
    if (currentBalance < withdrawAmount) {
      res.status(400).json({ success: false, error: `Insufficient wallet balance. You only have ₱${currentBalance.toFixed(2)} available.` });
      return;
    }

    const payoutMethod = method || 'MOCK_GCASH';
    const referenceCode = `WDW-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update user wallet balance (decrement)
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          walletBalance: { decrement: withdrawAmount },
        },
      });

      // 2. Create Transaction log
      const transaction = await tx.walletTransaction.create({
        data: {
          userId,
          type: 'DEBIT',
          amount: withdrawAmount,
          status: 'PENDING',
          referenceCode,
          description: `Withdrew funds using ${payoutMethod.toUpperCase()} (Pending Approval)`,
        },
      });

      return { user: updatedUser, transaction };
    });

    res.status(200).json({
      success: true,
      data: {
        walletBalance: result.user.walletBalance,
        transaction: result.transaction,
      },
    });
  } catch (err) {
    next(err);
  }
};

