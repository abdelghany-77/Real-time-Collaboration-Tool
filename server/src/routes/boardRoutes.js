const express = require("express");
const router = express.Router();
const {
  createBoard,
  getBoards,
  getBoard,
  updateBoard,
  archiveBoard,
  deleteBoard,
} = require("../controllers/boardController");

// Import list routes for nested routing
const listRoutes = require("./listRoutes");

/**
 * Board Routes
 *
 * GET    /api/v1/boards          - Get all boards
 * POST   /api/v1/boards          - Create a new board
 * GET    /api/v1/boards/:id      - Get a single board with lists and cards
 * PUT    /api/v1/boards/:id      - Update a board
 * PATCH  /api/v1/boards/:id/archive - Archive a board
 * DELETE /api/v1/boards/:id      - Delete a board permanently
 */

router.route("/").get(getBoards).post(createBoard);

router.route("/:id").get(getBoard).put(updateBoard).delete(deleteBoard);

router.patch("/:id/archive", archiveBoard);

// Nested routes: /api/v1/boards/:boardId/lists
router.use("/:boardId/lists", listRoutes);

module.exports = router;
