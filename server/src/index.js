require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");
const createApp = require("./app");
const config = require("./config");
const { connectDB } = require("./config/database");
const { initializeSocket } = require("./socket");

/**
 * Main server entry point
 * Sets up Express, Socket.io, and connects to MongoDB
 */
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB(config.mongodbUri);

    // Create Express app
    const app = createApp();

    // Create HTTP server
    const server = http.createServer(app);

    // Initialize Socket.io
    const io = new Server(server, {
      cors: config.socketCors,
      // Connection settings
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    // Set up Socket.io event handlers
    initializeSocket(io);

    // Make io accessible to routes (for emitting events from REST API)
    app.set("io", io);

    // Start server
    server.listen(config.port, () => {
      console.log(`


  Real-Time Task Board Server                                                                        
  Environment: ${config.nodeEnv.padEnd(40)}║
  Port: ${String(config.port).padEnd(47)}║
  API: http://localhost:${config.port}${config.api.prefix.padEnd(26)}║
  WebSocket: ws://localhost:${config.port}${"".padEnd(25)}
                                                          

      `);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);

      server.close(() => {
        console.log("HTTP server closed");
      });

      // Close all Socket.io connections
      io.close(() => {
        console.log("Socket.io server closed");
      });

      // Close MongoDB connection
      const { disconnectDB } = require("./config/database");
      await disconnectDB();

      process.exit(0);
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Start the server
startServer();
