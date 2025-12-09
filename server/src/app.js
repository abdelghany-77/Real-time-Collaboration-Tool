const express = require("express");
const cors = require("cors");
const config = require("./config");
const { errorHandler } = require("./middleware");
const { boardRoutes, listRoutes, cardRoutes } = require("./routes");
const { NotFoundError } = require("./utils/errors");

/**
 * Create and configure Express application
 * @returns {Express} Configured Express app
 */
const createApp = () => {
  const app = express();

  // ===================
  // MIDDLEWARE
  // ===================

  // Enable CORS
  app.use(
    cors({
      origin: config.clientUrl,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    })
  );

  // Parse JSON bodies
  app.use(express.json({ limit: "10mb" }));

  // Parse URL-encoded bodies
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Request logging (development)
  if (config.nodeEnv === "development") {
    app.use((req, res, next) => {
      console.log(`${req.method} ${req.path}`);
      next();
    });
  }

  // ===================
  // HEALTH CHECK
  // ===================
  app.get("/health", (req, res) => {
    res.status(200).json({
      success: true,
      message: "Server is healthy",
      timestamp: new Date().toISOString(),
    });
  });

  // ===================
  // API ROUTES
  // ===================
  const apiPrefix = config.api.prefix;

  // Board routes: /api/v1/boards
  app.use(`${apiPrefix}/boards`, boardRoutes);

  // List routes: /api/v1/lists (direct access to lists)
  app.use(`${apiPrefix}/lists`, listRoutes);

  // Card routes: /api/v1/cards (direct access to cards)
  app.use(`${apiPrefix}/cards`, cardRoutes);

  // ===================
  // 404 HANDLER
  // ===================
  app.use((req, res, next) => {
    next(new NotFoundError(`Cannot ${req.method} ${req.path}`));
  });

  // ===================
  // ERROR HANDLER
  // ===================
  app.use(errorHandler);

  return app;
};

module.exports = createApp;
