import { Response, NextFunction } from 'express';
import { prisma } from '../utils/db.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export const getAddresses = async (
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

    const addresses = await prisma.savedAddress.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      addresses,
    });
  } catch (err) {
    next(err);
  }
};

export const createAddress = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { label, address, details, isDefault } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    if (!label || !address) {
      res.status(400).json({ success: false, error: 'Label and address text are required.' });
      return;
    }

    // If this is set to default, reset all other addresses for this user
    if (isDefault) {
      await prisma.savedAddress.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    // If it is the user's first address, make it default automatically
    const existingCount = await prisma.savedAddress.count({ where: { userId } });
    const makeDefault = isDefault || existingCount === 0;

    const newAddress = await prisma.savedAddress.create({
      data: {
        userId,
        label: label.trim(),
        address: address.trim(),
        details: details ? details.trim() : null,
        isDefault: makeDefault,
      },
    });

    res.status(201).json({
      success: true,
      address: newAddress,
    });
  } catch (err) {
    next(err);
  }
};

export const updateAddress = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { label, address, details, isDefault } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const existingAddress = await prisma.savedAddress.findUnique({
      where: { id },
    });

    if (!existingAddress || existingAddress.userId !== userId) {
      res.status(404).json({ success: false, error: 'Address not found.' });
      return;
    }

    if (isDefault && !existingAddress.isDefault) {
      await prisma.savedAddress.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const updatedAddress = await prisma.savedAddress.update({
      where: { id },
      data: {
        label: label !== undefined ? label.trim() : undefined,
        address: address !== undefined ? address.trim() : undefined,
        details: details !== undefined ? (details ? details.trim() : null) : undefined,
        isDefault: isDefault !== undefined ? isDefault : undefined,
      },
    });

    res.status(200).json({
      success: true,
      address: updatedAddress,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteAddress = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const existingAddress = await prisma.savedAddress.findUnique({
      where: { id },
    });

    if (!existingAddress || existingAddress.userId !== userId) {
      res.status(404).json({ success: false, error: 'Address not found.' });
      return;
    }

    await prisma.savedAddress.delete({
      where: { id },
    });

    // If we deleted the default address, make the most recent address default
    if (existingAddress.isDefault) {
      const remainingAddress = await prisma.savedAddress.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      if (remainingAddress) {
        await prisma.savedAddress.update({
          where: { id: remainingAddress.id },
          data: { isDefault: true },
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Address deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};

export const setDefaultAddress = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const existingAddress = await prisma.savedAddress.findUnique({
      where: { id },
    });

    if (!existingAddress || existingAddress.userId !== userId) {
      res.status(404).json({ success: false, error: 'Address not found.' });
      return;
    }

    await prisma.$transaction([
      prisma.savedAddress.updateMany({
        where: { userId },
        data: { isDefault: false },
      }),
      prisma.savedAddress.update({
        where: { id },
        data: { isDefault: true },
      }),
    ]);

    res.status(200).json({
      success: true,
      message: 'Address set as default successfully.',
    });
  } catch (err) {
    next(err);
  }
};
