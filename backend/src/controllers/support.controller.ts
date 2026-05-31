import { Response, NextFunction } from 'express';
import { prisma } from '../utils/db.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

// Helper to get or create a system Admin account if none exists
const getAdminUser = async () => {
  let admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (!admin) {
    // If no admin exists in DB yet, search or create one to avoid crashes
    admin = await prisma.user.findFirst({
      where: { email: { startsWith: 'admin' } }
    });

    if (!admin) {
      // Create a default system admin account
      admin = await prisma.user.create({
        data: {
          name: 'FetchMeUp Support Admin',
          email: 'admin@fetchmeup.com',
          passwordHash: '$2a$10$sysadminhashplaceholderpwd12345', // simulated hash
          phone: '09000000000',
          role: 'ADMIN',
          isVerified: true,
        }
      });
    }
  }

  return admin;
};

export const getSupportMessages = async (
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

    const admin = await getAdminUser();

    // Fetch messages where (sender is user and receiver is admin) OR (sender is admin and receiver is user)
    const messages = await prisma.supportMessage.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: admin.id },
          { senderId: admin.id, receiverId: userId },
        ],
      },
      orderBy: { createdAt: 'asc' },
    });

    res.status(200).json({
      success: true,
      messages,
      adminInfo: {
        id: admin.id,
        name: admin.name,
        avatar: admin.avatar,
      }
    });
  } catch (err) {
    next(err);
  }
};

export const sendSupportMessage = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const senderId = req.user?.id;
    const { message, customerId } = req.body; // customerId is used if Admin is sending the reply

    if (!senderId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    if (!message || !message.trim()) {
      res.status(400).json({ success: false, error: 'Message cannot be empty.' });
      return;
    }

    const senderRole = req.user?.role;
    let receiverId = '';

    if (senderRole === 'ADMIN') {
      if (!customerId) {
        res.status(400).json({ success: false, error: 'Target customerId is required when admin is replying.' });
        return;
      }
      receiverId = customerId;
    } else {
      const admin = await getAdminUser();
      receiverId = admin.id;
    }

    const supportMsg = await prisma.supportMessage.create({
      data: {
        senderId,
        receiverId,
        message: message.trim(),
      },
    });

    res.status(201).json({
      success: true,
      message: supportMsg,
    });
  } catch (err) {
    next(err);
  }
};

export const getAdminThreads = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userRole = req.user?.role;
    if (userRole !== 'ADMIN') {
      res.status(403).json({ success: false, error: 'Forbidden. Admin access required.' });
      return;
    }

    const admin = await getAdminUser();

    // Query support messages involving the admin
    const messages = await prisma.supportMessage.findMany({
      where: {
        OR: [
          { senderId: admin.id },
          { receiverId: admin.id },
        ],
      },
      include: {
        sender: { select: { id: true, name: true, email: true, phone: true, avatar: true } },
        receiver: { select: { id: true, name: true, email: true, phone: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Group messages by customer
    const threadsMap = new Map<string, any>();

    for (const msg of messages) {
      // The other user is the customer
      const customer = msg.senderId === admin.id ? msg.receiver : msg.sender;
      if (!customer || customer.id === admin.id) continue;

      if (!threadsMap.has(customer.id)) {
        threadsMap.set(customer.id, {
          customerId: customer.id,
          customerName: customer.name,
          customerPhone: customer.phone,
          customerAvatar: customer.avatar,
          lastMessage: msg.message,
          lastMessageAt: msg.createdAt,
        });
      }
    }

    res.status(200).json({
      success: true,
      threads: Array.from(threadsMap.values()),
    });
  } catch (err) {
    next(err);
  }
};

export const getAdminThreadDetails = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userRole = req.user?.role;
    const { customerId } = req.params;

    if (userRole !== 'ADMIN') {
      res.status(403).json({ success: false, error: 'Forbidden. Admin access required.' });
      return;
    }

    const admin = await getAdminUser();

    const messages = await prisma.supportMessage.findMany({
      where: {
        OR: [
          { senderId: customerId, receiverId: admin.id },
          { senderId: admin.id, receiverId: customerId },
        ],
      },
      orderBy: { createdAt: 'asc' },
    });

    const customer = await prisma.user.findUnique({
      where: { id: customerId },
      select: { id: true, name: true, phone: true, avatar: true },
    });

    res.status(200).json({
      success: true,
      messages,
      customer,
    });
  } catch (err) {
    next(err);
  }
};
