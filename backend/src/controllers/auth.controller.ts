import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/db.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

const signToken = (id: string, role: string): string => {
  const secret = process.env.JWT_SECRET || 'supabase-capstone-secret-jwt-key-2026';
  return jwt.sign({ id, role }, secret, {
    expiresIn: '30d',
  });
};

export const registerCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
      res.status(400).json({ success: false, error: 'Please provide all required fields.' });
      return;
    }

    // Check if email or phone already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        error: 'A user with this email or phone number already exists.',
      });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        role: 'CUSTOMER',
        isVerified: true, // Customers verified automatically
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        walletBalance: true,
        avatar: true,
        rating: true,
        isVerified: true,
        createdAt: true,
      },
    });

    const token = signToken(user.id, user.role);

    res.status(201).json({
      success: true,
      token,
      data: { user },
    });
  } catch (err) {
    next(err);
  }
};

export const registerRider = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, phone, licenseNumber, plateNumber, vehicleModel, licenseImage, clearanceImage } = req.body;

    if (!name || !email || !password || !phone || !licenseNumber || !plateNumber || !vehicleModel) {
      res.status(400).json({
        success: false,
        error: 'Please provide all user profile and vehicle registration fields.',
      });
      return;
    }

    // Check if email or phone already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        error: 'A user with this email or phone number already exists.',
      });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Transaction to create rider and associated documents
    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          phone,
          passwordHash,
          role: 'RIDER',
          isVerified: false, // Riders require document approval
        },
      });

      const documents = await tx.riderDocument.create({
        data: {
          userId: newUser.id,
          licenseNumber,
          plateNumber,
          vehicleModel,
          licenseImage: licenseImage || null,
          clearanceImage: clearanceImage || null,
          status: 'PENDING',
        },
      });

      return { user: newUser, documents };
    });

    const token = signToken(result.user.id, result.user.role);

    // Omit passwordHash in response
    const { passwordHash: _, ...userWithoutPassword } = result.user;

    res.status(201).json({
      success: true,
      token,
      data: {
        user: userWithoutPassword,
        documents: result.documents,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      res.status(400).json({
        success: false,
        error: 'Please provide email, password, and role (CUSTOMER or RIDER).',
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.role !== role) {
      res.status(401).json({
        success: false,
        error: 'Incorrect email or role configuration.',
      });
      return;
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordCorrect) {
      res.status(401).json({
        success: false,
        error: 'Incorrect password.',
      });
      return;
    }

    // Check if Rider has been approved by the administrator
    if (user.role === 'RIDER' && !user.isVerified) {
      res.status(403).json({
        success: false,
        error: 'Your rider account is still pending administrative review. Please wait for document approval.',
      });
      return;
    }

    const token = signToken(user.id, user.role);

    const { passwordHash: _, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      token,
      data: { user: userWithoutPassword },
    });
  } catch (err) {
    next(err);
  }
};

export const getProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;

    let documents = null;
    if (user?.role === 'RIDER') {
      documents = await prisma.riderDocument.findMany({
        where: { userId: user.id },
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user,
        documents,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, phone, avatar } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    // Check phone availability if updated
    if (phone && phone !== req.user?.phone) {
      const existingPhone = await prisma.user.findUnique({
        where: { phone },
      });
      if (existingPhone) {
        res.status(400).json({ success: false, error: 'Phone number already in use.' });
        return;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name || undefined,
        phone: phone || undefined,
        avatar: avatar || undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        walletBalance: true,
        avatar: true,
        rating: true,
        isVerified: true,
      },
    });

    res.status(200).json({
      success: true,
      data: { user: updatedUser },
    });
  } catch (err) {
    next(err);
  }
};

export const getSettings = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.id },
      select: { settings: true },
    });
    
    res.status(200).json({
      success: true,
      settings: user?.settings || {
        pushNotifications: true,
        smsAlerts: false,
        emailPromos: true,
        orderUpdates: true,
        chatMessages: true,
        dataSharing: true,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const updateSettings = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { settings } = req.body;
    const updatedUser = await prisma.user.update({
      where: { id: req.user?.id },
      data: { settings },
    });
    
    res.status(200).json({
      success: true,
      settings: updatedUser.settings,
    });
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).json({ success: false, error: 'Both current password and new password are required.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user?.id },
    });

    if (!user) {
      res.status(404).json({ success: false, error: 'User not found.' });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ success: false, error: 'Current password does not match our records.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    res.status(200).json({ success: true, message: 'Password updated successfully.' });
  } catch (err) {
    next(err);
  }
};

export const deleteAccount = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await prisma.user.delete({
      where: { id: req.user?.id },
    });
    res.status(200).json({ success: true, message: 'Account deleted permanently.' });
  } catch (err) {
    next(err);
  }
};

