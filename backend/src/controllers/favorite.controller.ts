import { Response, NextFunction } from 'express';
import { prisma } from '../utils/db.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

/**
 * Toggles a rider as a favorite for the logged-in customer.
 * POST /api/favorites/toggle
 */
export const toggleFavoriteRider = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const customerId = req.user?.id;
    const { riderId } = req.body;

    if (!customerId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    if (!riderId) {
      res.status(400).json({ success: false, error: 'Rider ID is required.' });
      return;
    }

    // 1. Verify that the target rider exists and is a RIDER
    const targetRider = await prisma.user.findFirst({
      where: { id: riderId, role: 'RIDER' },
    });

    if (!targetRider) {
      res.status(404).json({ success: false, error: 'Target rider could not be located.' });
      return;
    }

    // 2. Check if already favorited
    const existing = await prisma.favoriteRider.findUnique({
      where: {
        customerId_riderId: {
          customerId,
          riderId,
        },
      },
    });

    if (existing) {
      // Unfavorite
      await prisma.favoriteRider.delete({
        where: {
          customerId_riderId: {
            customerId,
            riderId,
          },
        },
      });
      res.status(200).json({
        success: true,
        isFavorite: false,
        message: 'Successfully removed rider from favorites.',
      });
    } else {
      // Favorite
      await prisma.favoriteRider.create({
        data: {
          customerId,
          riderId,
        },
      });
      res.status(201).json({
        success: true,
        isFavorite: true,
        message: 'Successfully added rider to favorites.',
      });
    }
  } catch (err) {
    next(err);
  }
};

/**
 * Fetches the logged-in customer's favorite riders list.
 * GET /api/favorites
 */
export const getFavoriteRiders = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const customerId = req.user?.id;

    if (!customerId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const favorites = await prisma.favoriteRider.findMany({
      where: { customerId },
      include: {
        rider: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
            rating: true,
            ratingsCount: true,
            isVerified: true,
            riderDocuments: {
              select: {
                vehicleModel: true,
                plateNumber: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      favorites,
    });
  } catch (err) {
    next(err);
  }
};
