import { io, Socket } from 'socket.io-client';
import { API_URL } from '../constants/api';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(API_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });
    console.log('🔌 [SocketService] Initialized connection to:', API_URL);
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('🔌 [SocketService] Connection closed');
  }
};
