import { Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { prisma } from '../utils/db.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { getIOInstance } from '../services/socket.service.js';
import { sendPushNotification } from '../services/notification.service.js';

// Dynamic delivery fee calculator based on system-settings.json rates
const calculateDeliveryFee = (distanceKm: number, type: string, details?: any): number => {
  let baseFee = 50.00;
  let perKmFee = 10.00;

  try {
    const settingsFile = path.join(process.cwd(), 'system-settings.json');
    if (fs.existsSync(settingsFile)) {
      const fileData = fs.readFileSync(settingsFile, 'utf8');
      const settings = JSON.parse(fileData);
      if (settings && settings.fares) {
        let fareKey = type;
        if (details?.rideService === true || details?.rideService === 'true') {
          fareKey = details.vehicleType || 'Motorcycle';
        }
        const rate = settings.fares[fareKey];
        if (rate) {
          baseFee = Number(rate.baseFee ?? rate.base ?? baseFee);
          perKmFee = Number(rate.perKmFee ?? rate.perKm ?? perKmFee);
        } else {
          // Key-specific fallback defaults if rate is not set
          if (fareKey === 'Bao-Bao') {
            baseFee = 60.00;
            perKmFee = 12.00;
          } else if (fareKey === '4-wheels') {
            baseFee = 100.00;
            perKmFee = 20.00;
          }
        }
      }
    }
  } catch (err) {
    console.error('Error reading dynamic fares from system-settings.json:', err);
  }

  return Number((baseFee + distanceKm * perKmFee).toFixed(2));
};

export const createOrder = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { type, pickupAddress, dropoffAddress, pickupCoords, dropoffCoords, estimatedDistance, price, details } = req.body;
    const customerId = req.user?.id;

    if (!customerId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    if (!type || !pickupAddress || !dropoffAddress || !pickupCoords || !dropoffCoords || estimatedDistance === undefined) {
      res.status(400).json({ success: false, error: 'Missing required order placement fields.' });
      return;
    }

    const deliveryFee = calculateDeliveryFee(estimatedDistance, type, details);
    const itemCost = price ? Number(price) : 0.00;
    const totalCost = deliveryFee + itemCost;
    const paymentMethod = details?.paymentMethod || req.body.paymentMethod || 'WALLET';

    // Check if customer has enough wallet balance (ONLY if payment method is WALLET)
    if (paymentMethod === 'WALLET') {
      const walletBalance = Number(req.user?.walletBalance || 0);
      if (walletBalance < totalCost) {
        res.status(400).json({
          success: false,
          error: `Insufficient wallet balance. Total cost is ₱${totalCost.toFixed(2)}, but you only have ₱${walletBalance.toFixed(2)}. Please top up your wallet or choose Cash on Delivery.`,
        });
        return;
      }
    }

    const order = await prisma.order.create({
      data: {
        type,
        customerId,
        pickupAddress,
        dropoffAddress,
        pickupCoords,
        dropoffCoords,
        estimatedDistance,
        price: itemCost,
        deliveryFee,
        details: {
          ...(details || {}),
          paymentMethod,
        },
        status: 'PENDING',
      },
      include: {
        customer: {
          select: { id: true, name: true, phone: true, avatar: true },
        },
      },
    });

    // Notify all active riders in real time via Socket.io
    const io = getIOInstance();
    if (io) {
      io.emit('new_order_available', order);
    }

    res.status(201).json({
      success: true,
      data: { order },
    });
  } catch (err) {
    next(err);
  }
};

export const getAvailableOrders = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orders = await prisma.order.findMany({
      where: { status: 'PENDING' },
      include: {
        customer: {
          select: { id: true, name: true, phone: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Filter so targeted direct bookings are only visible to the designated pilot
    const filteredOrders = orders.filter((order: any) => {
      const details = order.details as any;
      if (details?.targetedRiderId) {
        return details.targetedRiderId === req.user?.id;
      }
      return true;
    });

    res.status(200).json({
      success: true,
      data: { orders: filteredOrders },
    });
  } catch (err) {
    next(err);
  }
};

export const acceptOrder = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orderId } = req.body;
    const riderId = req.user?.id;

    if (!riderId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    // Weekly Platform Fee Dues Validation Check
    const rider = await prisma.user.findUnique({
      where: { id: riderId }
    });

    if (rider) {
      const currentSettings: any = rider.settings || {};
      let weeklyFeeStatus = currentSettings.weeklyFeeStatus || 'PAID';
      const feeDueDateStr = currentSettings.feeDueDate;
      if (feeDueDateStr) {
        const dueDate = new Date(feeDueDateStr);
        if (dueDate < new Date()) {
          weeklyFeeStatus = 'OVERDUE';
          const updatedSettings = {
            ...currentSettings,
            weeklyFeeStatus: 'OVERDUE',
          };
          await prisma.user.update({
            where: { id: riderId },
            data: { settings: updatedSettings },
          });
        }
      }

      if (weeklyFeeStatus === 'OVERDUE') {
        res.status(403).json({
          success: false,
          error: 'Your account is suspended due to outstanding ₱50.00 weekly platform dues. Please settle inside the Earnings tab.'
        });
        return;
      }
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found.' });
      return;
    }

    if (order.status !== 'PENDING') {
      res.status(400).json({ success: false, error: 'This order has already been taken by another rider.' });
      return;
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        riderId,
        status: 'ACCEPTED',
      },
      include: {
        customer: { select: { id: true, name: true, phone: true, avatar: true } },
        rider: { select: { id: true, name: true, phone: true, avatar: true } },
      },
    });

    // Notify the customer in real time via Socket.io
    const io = getIOInstance();
    if (io) {
      io.to(`order_${orderId}`).emit('order_status_updated', updatedOrder);
      io.emit('order_claimed', { orderId }); // Inform other riders it is no longer available
    }

    // Trigger push notification to the customer
    sendPushNotification(
      updatedOrder.customerId,
      'Order Accepted! 🏍️',
      `Pilot ${updatedOrder.rider?.name || 'partner'} has accepted your ${updatedOrder.type.toLowerCase()} request.`,
      { orderId, type: 'order_status', status: 'ACCEPTED' }
    ).catch(err => console.error('Failed to send order accept push:', err));

    res.status(200).json({
      success: true,
      data: { order: updatedOrder },
    });
  } catch (err) {
    next(err);
  }
};

export const updateOrderStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orderId, status } = req.body;
    const riderId = req.user?.id;

    if (!riderId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: true },
    });

    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found.' });
      return;
    }

    if (order.riderId !== riderId) {
      res.status(403).json({ success: false, error: 'You are not assigned to this order.' });
      return;
    }

    // Special logic for completion of order: settle payments inside a database transaction
    if (status === 'COMPLETED' && order.status !== 'COMPLETED') {
      const deliveryFee = Number(order.deliveryFee);
      const priceCost = Number(order.price);
      const totalCharge = deliveryFee + priceCost;
      const orderDetails: any = order.details || {};
      const paymentMethod = orderDetails.paymentMethod || 'WALLET';

      if (paymentMethod === 'COD') {
        // Settle COD order: no database wallet balance changes, but write ledger logs for record-keeping
        await prisma.$transaction([
          // 1. Create wallet log for Customer (COD record)
          prisma.walletTransaction.create({
            data: {
              userId: order.customerId,
              orderId: order.id,
              type: 'DEBIT',
              amount: totalCharge,
              status: 'SUCCESS',
              referenceCode: `COD-CUST-${Date.now()}-${order.id.slice(0, 4)}`,
              description: `Cash on Delivery payment: ${order.type} (Fee: ₱${deliveryFee.toFixed(2)}, Items: ₱${priceCost.toFixed(2)}) - Physically settled`,
            },
          }),
          // 2. Create wallet log for Rider (COD record)
          prisma.walletTransaction.create({
            data: {
              userId: riderId,
              orderId: order.id,
              type: 'CREDIT',
              amount: deliveryFee,
              status: 'SUCCESS',
              referenceCode: `COD-RIDE-${Date.now()}-${order.id.slice(0, 4)}`,
              description: `Cash on Delivery collection: ${order.type} (Order ID: #${order.id.slice(0, 8)}) - Physically settled`,
            },
          }),
          // 3. Update Order status
          prisma.order.update({
            where: { id: orderId },
            data: { status: 'COMPLETED' },
          }),
        ]);
      } else {
        // Settle WALLET order
        await prisma.$transaction([
          // 1. Deduct customer balance
          prisma.user.update({
            where: { id: order.customerId },
            data: { walletBalance: { decrement: totalCharge } },
          }),
          // 2. Credit rider balance (earns the delivery fee)
          prisma.user.update({
            where: { id: riderId },
            data: { walletBalance: { increment: deliveryFee } },
          }),
          // 3. Create wallet log for Customer (Debit)
          prisma.walletTransaction.create({
            data: {
              userId: order.customerId,
              orderId: order.id,
              type: 'DEBIT',
              amount: totalCharge,
              status: 'SUCCESS',
              referenceCode: `DBT-${Date.now()}-${order.id.slice(0, 4)}`,
              description: `Payment for delivery service: ${order.type} (Fee: ₱${deliveryFee.toFixed(2)}, Items: ₱${priceCost.toFixed(2)})`,
            },
          }),
          // 4. Create wallet log for Rider (Credit)
          prisma.walletTransaction.create({
            data: {
              userId: riderId,
              orderId: order.id,
              type: 'CREDIT',
              amount: deliveryFee,
              status: 'SUCCESS',
              referenceCode: `CRD-${Date.now()}-${order.id.slice(0, 4)}`,
              description: `Earning from delivery: ${order.type} (Order ID: #${order.id.slice(0, 8)})`,
            },
          }),
          // 5. Update Order status
          prisma.order.update({
            where: { id: orderId },
            data: { status: 'COMPLETED' },
          }),
        ]);
      }

      const updatedOrder = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          customer: { select: { id: true, name: true, phone: true, avatar: true } },
          rider: { select: { id: true, name: true, phone: true, avatar: true } },
        },
      });

      // Notify customer via Socket.io
      const io = getIOInstance();
      if (io) {
        io.to(`order_${orderId}`).emit('order_status_updated', updatedOrder);
      }

      if (updatedOrder) {
        sendPushNotification(
          updatedOrder.customerId,
          'Order Completed! 🎉',
          `Your order #${orderId.slice(0, 8)} has been completed. Thank you for using our service!`,
          { orderId: updatedOrder.id, type: 'order_status', status: 'COMPLETED' }
        ).catch(err => console.error('Failed to send order completed push:', err));
      }

      res.status(200).json({
        success: true,
        data: { order: updatedOrder },
      });
      return;
    }

    // Standard state progression (e.g., to IN_TRANSIT or CANCELLED)
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        customer: { select: { id: true, name: true, phone: true, avatar: true } },
        rider: { select: { id: true, name: true, phone: true, avatar: true } },
      },
    });

    // Notify customer via WebSockets
    const io = getIOInstance();
    if (io) {
      io.to(`order_${orderId}`).emit('order_status_updated', updatedOrder);
    }

    let pushTitle = 'Order Update';
    let pushBody = `Your order status has been updated to ${status}.`;
    if (status === 'IN_TRANSIT') {
      pushTitle = 'Order in Transit! 🚚';
      pushBody = `Pilot ${updatedOrder.rider?.name || 'partner'} is now on the way to your destination.`;
    }
    sendPushNotification(
      updatedOrder.customerId,
      pushTitle,
      pushBody,
      { orderId, type: 'order_status', status }
    ).catch(err => console.error('Failed to send order update push:', err));

    res.status(200).json({
      success: true,
      data: { order: updatedOrder },
    });
  } catch (err) {
    next(err);
  }
};

export const getCustomerOrders = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const customerId = req.user?.id;
    const orders = await prisma.order.findMany({
      where: { customerId },
      include: {
        rider: { select: { id: true, name: true, phone: true, avatar: true } },
        chatMessages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: { orders },
    });
  } catch (err) {
    next(err);
  }
};

export const getRiderOrders = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const riderId = req.user?.id;
    const orders = await prisma.order.findMany({
      where: { riderId },
      include: {
        customer: { select: { id: true, name: true, phone: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: { orders },
    });
  } catch (err) {
    next(err);
  }
};

export const getOrderDetails = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, name: true, phone: true, avatar: true } },
        rider: {
          select: {
            id: true,
            name: true,
            phone: true,
            avatar: true,
            location: {
              select: {
                latitude: true,
                longitude: true,
                bearing: true,
                updatedAt: true,
              },
            },
          },
        },
        chatMessages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found.' });
      return;
    }

    if (order.customerId !== userId && order.riderId !== userId) {
      res.status(403).json({ success: false, error: 'Access denied.' });
      return;
    }

    res.status(200).json({
      success: true,
      data: { order },
    });
  } catch (err) {
    next(err);
  }
};

export const sendChatMessage = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id: orderId } = req.params;
    const { message } = req.body;
    const senderId = req.user?.id;

    if (!senderId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    if (!message || !message.trim()) {
      res.status(400).json({ success: false, error: 'Message cannot be empty.' });
      return;
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found.' });
      return;
    }

    // Determine receiver
    const receiverId = senderId === order.customerId ? order.riderId : order.customerId;
    if (!receiverId) {
      res.status(400).json({ success: false, error: 'No rider assigned to this order yet.' });
      return;
    }

    const chatMessage = await prisma.chatMessage.create({
      data: {
        orderId,
        senderId,
        receiverId,
        message: message.trim(),
      },
    });

    // Notify rooms via Socket.io if active
    const io = getIOInstance();
    if (io) {
      io.to(`order_${orderId}`).emit('chat_message_received', chatMessage);
    }

    const senderName = req.user?.name || 'Partner';
    sendPushNotification(
      receiverId,
      `New message from ${senderName} 💬`,
      message.trim(),
      { orderId, type: 'chat_message', senderId }
    ).catch(err => console.error('Failed to send chat message push:', err));

    res.status(201).json({
      success: true,
      data: { chatMessage },
    });
  } catch (err) {
    next(err);
  }
};

export const rateOrderRider = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params; // order id
    const { rating, comment } = req.body;
    const customerId = req.user?.id;

    if (!rating || rating < 1 || rating > 5) {
      res.status(400).json({ success: false, error: 'Please provide a valid rating between 1 and 5 stars.' });
      return;
    }

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found.' });
      return;
    }

    if (order.customerId !== customerId) {
      res.status(403).json({ success: false, error: 'You are not authorized to rate this order.' });
      return;
    }

    if (!order.riderId) {
      res.status(400).json({ success: false, error: 'This order does not have an assigned rider to rate.' });
      return;
    }

    // Update order with rated status and comments in its details JSON
    const currentDetails = (order.details as Record<string, any>) || {};
    const updatedDetails = {
      ...currentDetails,
      riderRating: Number(rating),
      riderReview: comment || '',
      isRated: true,
    };

    await prisma.$transaction(async (tx) => {
      // 1. Save ratings details in the order
      await tx.order.update({
        where: { id },
        data: {
          details: updatedDetails,
        },
      });

      // 2. Fetch all completed orders of this rider that have ratings inside their details JSON to compute the exact new rating average!
      const riderOrders = await tx.order.findMany({
        where: {
          riderId: order.riderId!,
          status: 'COMPLETED',
        },
      });

      let totalRating = Number(rating);
      let ratedCount = 1;

      riderOrders.forEach((o) => {
        const d = (o.details as Record<string, any>) || {};
        if (o.id !== id && d.isRated && d.riderRating) {
          totalRating += Number(d.riderRating);
          ratedCount += 1;
        }
      });

      const newRatingAverage = Number((totalRating / ratedCount).toFixed(2));

      // 3. Update the rider's profile rating and ratingsCount
      await tx.user.update({
        where: { id: order.riderId! },
        data: {
          rating: newRatingAverage,
          ratingsCount: { increment: 1 },
        },
      });
    });

    res.status(200).json({
      success: true,
      message: 'Thank you! Rider partner rating has been logged successfully.',
    });
  } catch (err) {
    next(err);
  }
};

export const cancelOrder = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id: orderId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found.' });
      return;
    }

    // Check if the user is the customer who placed this order
    if (order.customerId !== userId) {
      res.status(403).json({ success: false, error: 'You are not authorized to cancel this order.' });
      return;
    }

    // Check if the order is in a state that can be cancelled
    if (order.status !== 'PENDING' && order.status !== 'ACCEPTED') {
      res.status(400).json({
        success: false,
        error: `This order cannot be cancelled because its current status is ${order.status}.`,
      });
      return;
    }

    // Update order status to CANCELLED
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' },
      include: {
        customer: { select: { id: true, name: true, phone: true, avatar: true } },
        rider: { select: { id: true, name: true, phone: true, avatar: true } },
      },
    });

    // Notify rooms via Socket.io if active
    const io = getIOInstance();
    if (io) {
      io.to(`order_${orderId}`).emit('order_status_updated', updatedOrder);
      io.emit('order_cancelled', { orderId });
    }

    if (updatedOrder.riderId) {
      sendPushNotification(
        updatedOrder.riderId,
        'Order Cancelled 🚫',
        `Order #${orderId.slice(0, 8)} has been cancelled by the customer.`,
        { orderId, type: 'order_status', status: 'CANCELLED' }
      ).catch(err => console.error('Failed to send order cancel push:', err));
    }

    res.status(200).json({
      success: true,
      message: 'Order has been successfully cancelled.',
      data: { order: updatedOrder },
    });
  } catch (err) {
    next(err);
  }
};


