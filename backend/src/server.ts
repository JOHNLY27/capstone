import dotenv from 'dotenv';
import { createServer } from 'http';
import app from './app.js';
import { initializeSocket } from './services/socket.service.js';
import { prisma } from './utils/db.js';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

// Create HTTP Server wrapping our Express app
const server = createServer(app);

// Bind Socket.io WebSockets engine to HTTP server
initializeSocket(server);

// Start listening
server.listen(PORT, () => {
  console.log(`🚀 Capstone Backend Server is running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`🔗 REST API & WebSocket endpoints available at http://localhost:${PORT}`);
});

// Handle graceful shutdowns
const handleGracefulShutdown = async (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
  
  // Close HTTP server
  server.close(() => {
    console.log('🚪 HTTP server closed.');
  });

  // Disconnect database client
  try {
    await prisma.$disconnect();
    console.log('🔌 Database connection closed cleanly.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error closing database connection:', err);
    process.exit(1);
  }
};

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));
