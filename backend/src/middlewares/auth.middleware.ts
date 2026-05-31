import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/db.js';
import { User } from '@prisma/client';

export interface AuthenticatedRequest extends Request {
  user?: Omit<User, 'passwordHash'>;
}

interface DecodedToken {
  id: string;
  role: string;
  iat: number;
  exp: number;
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.',
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    const jwtSecret = process.env.JWT_SECRET || 'supabase-capstone-secret-jwt-key-2026';

    const decoded = jwt.verify(token, jwtSecret) as DecodedToken;

    // Verify user still exists in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        walletBalance: true,
        avatar: true,
        rating: true,
        ratingsCount: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'User belonging to this token no longer exists.',
      });
      return;
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (err: any) {
    if (err.name === 'JsonWebTokenError') {
      res.status(401).json({
        success: false,
        error: 'Invalid token. Please log in again.',
      });
    } else if (err.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        error: 'Your token has expired. Please log in again.',
      });
    } else {
      next(err);
    }
  }
};

// Role authorization helpers
export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: 'You do not have permission to perform this action.',
      });
      return;
    }
    next();
  };
};
