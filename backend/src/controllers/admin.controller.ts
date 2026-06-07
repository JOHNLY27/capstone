import { Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { prisma } from '../utils/db.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export const getDashboardStats = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const totalCustomers = await prisma.user.count({ where: { role: 'CUSTOMER' } });
    const totalRiders = await prisma.user.count({ where: { role: 'RIDER' } });
    const pendingApprovals = await prisma.riderDocument.count({ where: { status: 'PENDING' } });
    const pendingWithdrawalsCount = await prisma.walletTransaction.count({
      where: { type: 'DEBIT', status: 'PENDING' }
    });
    const totalOrders = await prisma.order.count();

    // Calculate total transactions volume
    const completedOrders = await prisma.order.findMany({
      where: { status: 'COMPLETED' },
      select: { price: true, deliveryFee: true },
    });

    const totalVolume = completedOrders.reduce((acc, order) => {
      return acc + Number(order.price) + Number(order.deliveryFee);
    }, 0);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalCustomers,
          totalRiders,
          pendingApprovals,
          pendingWithdrawals: pendingWithdrawalsCount,
          totalOrders,
          totalVolume: Number(totalVolume.toFixed(2)),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getUsers = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const roleQuery = req.query.role as string;

    let whereClause = {};
    if (roleQuery === 'CUSTOMER' || roleQuery === 'RIDER' || roleQuery === 'ADMIN') {
      whereClause = { role: roleQuery };
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        walletBalance: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: { users },
    });
  } catch (err) {
    next(err);
  }
};

export const getRiderDocuments = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const documents = await prisma.riderDocument.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            isVerified: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: { documents },
    });
  } catch (err) {
    next(err);
  }
};

export const verifyRiderDocument = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'APPROVED' or 'REJECTED'

    if (status !== 'APPROVED' && status !== 'REJECTED') {
      res.status(400).json({ success: false, error: 'Invalid status update. Choose APPROVED or REJECTED.' });
      return;
    }

    const document = await prisma.riderDocument.findUnique({
      where: { id },
    });

    if (!document) {
      res.status(404).json({ success: false, error: 'Verification document not found.' });
      return;
    }

    // Process approval/rejection inside a database transaction to ensure safety
    const updatedDocument = await prisma.$transaction(async (tx) => {
      const doc = await tx.riderDocument.update({
        where: { id },
        data: { status },
      });

      // Update associated rider account verification
      await tx.user.update({
        where: { id: document.userId },
        data: {
          isVerified: status === 'APPROVED',
        },
      });

      return doc;
    });

    res.status(200).json({
      success: true,
      data: { document: updatedDocument },
    });
  } catch (err) {
    next(err);
  }
};

export const getPendingWithdrawals = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const withdrawals = await prisma.walletTransaction.findMany({
      where: {
        type: 'DEBIT',
        status: 'PENDING',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: { withdrawals },
    });
  } catch (err) {
    next(err);
  }
};

export const verifyWithdrawal = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'APPROVED' or 'REJECTED'

    if (status !== 'APPROVED' && status !== 'REJECTED') {
      res.status(400).json({ success: false, error: 'Invalid status. Choose APPROVED or REJECTED.' });
      return;
    }

    const txRecord = await prisma.walletTransaction.findUnique({
      where: { id },
    });

    if (!txRecord) {
      res.status(404).json({ success: false, error: 'Withdrawal transaction not found.' });
      return;
    }

    if (txRecord.status !== 'PENDING') {
      res.status(400).json({ success: false, error: 'This transaction is already processed.' });
      return;
    }

    const updatedTx = await prisma.$transaction(async (tx) => {
      if (status === 'APPROVED') {
        // Mark as SUCCESS
        const updated = await tx.walletTransaction.update({
          where: { id },
          data: {
            status: 'SUCCESS',
            description: txRecord.description.replace(' (Pending Approval)', ' - Approved by Admin'),
          },
        });

        // If it's a rider weekly dues payment, extend their subscription:
        if (txRecord.description.startsWith('Rider Weekly Platform Fee')) {
          const rider = await tx.user.findUnique({ where: { id: txRecord.userId } });
          if (rider) {
            const currentSettings: any = rider.settings || {};
            const originalDueDateStr = currentSettings.feeDueDate;
            let baseDate = new Date();
            if (originalDueDateStr) {
              const origDate = new Date(originalDueDateStr);
              if (origDate > new Date()) {
                baseDate = origDate;
              }
            }
            const newDueDate = new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000); // add 7 days

            const updatedSettings = {
              ...currentSettings,
              weeklyFeeStatus: 'PAID',
              feeDueDate: newDueDate.toISOString(),
              lastSettleRef: txRecord.referenceCode,
            };

            await tx.user.update({
              where: { id: txRecord.userId },
              data: { settings: updatedSettings },
            });
          }
        }

        return updated;
      } else {
        // Mark as FAILED
        // Refund digital wallet balance ONLY for traditional wallet withdrawals (not platform dues)
        if (!txRecord.description.startsWith('Rider Weekly Platform Fee')) {
          const amount = Number(txRecord.amount);

          await tx.user.update({
            where: { id: txRecord.userId },
            data: {
              walletBalance: { increment: amount },
            },
          });
        } else {
          // If rider Platform fee was rejected, reset their status to OVERDUE
          const rider = await tx.user.findUnique({ where: { id: txRecord.userId } });
          if (rider) {
            const currentSettings: any = rider.settings || {};
            const updatedSettings = {
              ...currentSettings,
              weeklyFeeStatus: 'OVERDUE',
            };
            await tx.user.update({
              where: { id: txRecord.userId },
              data: { settings: updatedSettings },
            });
          }
        }

        return await tx.walletTransaction.update({
          where: { id },
          data: {
            status: 'FAILED',
            description: txRecord.description.replace(' (Pending Approval)', ' - Rejected by Admin'),
          },
        });
      }
    });

    res.status(200).json({
      success: true,
      data: { transaction: updatedTx },
    });
  } catch (err) {
    next(err);
  }
};

export const updateSystemSettings = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { gcashNumber, gcashQrCode, fares } = req.body;

    const settingsFile = path.join(process.cwd(), 'system-settings.json');
    let existingSettings: any = {};
    if (fs.existsSync(settingsFile)) {
      try {
        const fileData = fs.readFileSync(settingsFile, 'utf8');
        existingSettings = JSON.parse(fileData);
      } catch (e) {
        console.error('Error parsing settings file:', e);
      }
    }

    const mergedSettings = {
      ...existingSettings,
      ...(gcashNumber !== undefined ? { gcashNumber: gcashNumber.trim() } : {}),
      ...(gcashQrCode !== undefined ? { gcashQrCode: gcashQrCode || '' } : {}),
      ...(fares !== undefined ? { fares } : {}),
    };

    // Validation check: Make sure we got at least something valid
    if (gcashNumber === undefined && fares === undefined && gcashQrCode === undefined) {
      res.status(400).json({ success: false, error: 'No settings parameters provided.' });
      return;
    }

    fs.writeFileSync(settingsFile, JSON.stringify(mergedSettings, null, 2), 'utf8');

    res.status(200).json({
      success: true,
      message: 'System configuration settings updated successfully.',
      data: mergedSettings,
    });
  } catch (err) {
    next(err);
  }
};

