import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { prisma } from '../utils/db.js';

let io: SocketIOServer | null = null;

export const initializeSocket = (server: HTTPServer): SocketIOServer => {
  io = new SocketIOServer(server, {
    cors: {
      origin: '*', // Allow connections from Expo apps
      methods: ['GET', 'POST'],
    },
  });

  console.log('⚡ Socket.io Server initialized successfully');

  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Join room for a specific order (customer and rider join this room to chat/track)
    socket.on('join_order_channel', ({ orderId }: { orderId: string }) => {
      const room = `order_${orderId}`;
      socket.join(room);
      console.log(`👥 Socket ${socket.id} joined room ${room}`);
    });

    // Update and broadcast Rider Location
    socket.on('update_rider_location', async (data: {
      orderId: string;
      riderId: string;
      latitude: number;
      longitude: number;
      bearing?: number;
    }) => {
      const { orderId, riderId, latitude, longitude, bearing } = data;
      if (!riderId || !latitude || !longitude) return;

      try {
        // 1. Persist the location in PostgreSQL
        await prisma.riderLocation.upsert({
          where: { riderId },
          update: {
            latitude,
            longitude,
            bearing: bearing || null,
            updatedAt: new Date(),
          },
          create: {
            riderId,
            latitude,
            longitude,
            bearing: bearing || null,
          },
        });

        // 2. Broadcast coordinates to the customer in the order channel room
        if (io && orderId) {
          const room = `order_${orderId}`;
          io.to(room).emit('rider_location_updated', {
            riderId,
            latitude,
            longitude,
            bearing: bearing || null,
            updatedAt: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.error('❌ Failed to update rider location in database:', err);
      }
    });

    // Send chat message in real time
    socket.on('send_chat_message', async (data: {
      orderId: string;
      senderId: string;
      receiverId: string;
      message: string;
    }) => {
      const { orderId, senderId, receiverId, message } = data;
      if (!orderId || !senderId || !receiverId || !message) return;

      try {
        // 1. Persist message in PostgreSQL
        const chatMessage = await prisma.chatMessage.create({
          data: {
            orderId,
            senderId,
            receiverId,
            message,
          },
        });

        // 2. Broadcast message back to the order channel room
        if (io) {
          const room = `order_${orderId}`;
          io.to(room).emit('chat_message_received', chatMessage);
        }
      } catch (err) {
        console.error('❌ Failed to save chat message in database:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIOInstance = (): SocketIOServer | null => {
  return io;
};
