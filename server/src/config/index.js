require("dotenv").config();

/**
 * Application configuration
 * All environment variables and constants should be accessed through this module
 */
module.exports = {
  // Server configuration
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",

  // Database configuration
  mongodbUri: process.env.MONGODB_URI || "mongodb://localhost:27017/taskboard",

  // CORS configuration
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",

  // Socket.io configuration
  socketCors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  },

  // API configuration
  api: {
    prefix: "/api/v1",
  },
};
