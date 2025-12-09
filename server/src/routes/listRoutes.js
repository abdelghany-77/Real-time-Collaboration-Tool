const express = require("express");
const router = express.Router({ mergeParams: true }); // Enable access to parent params (boardId)
const {
  createList,
  getLists,
  getList,
  updateList,
  reorderList,
  archiveList,
  deleteList,
} = require("../controllers/listController");

// Import card routes for nested routing
const cardRoutes = require("./cardRoutes");

/**
 * List Routes
 *
 * Nested under boards: /api/v1/boards/:boardId/lists
 * GET    /api/v1/boards/:boardId/lists     - Get all lists for a board
 * POST   /api/v1/boards/:boardId/lists     - Create a new list in a board
 *
 * Direct routes: /api/v1/lists
 * GET    /api/v1/lists/:id          - Get a single list
 * PUT    /api/v1/lists/:id          - Update a list
 * PATCH  /api/v1/lists/:id/reorder  - Reorder a list
 * PATCH  /api/v1/lists/:id/archive  - Archive a list
 * DELETE /api/v1/lists/:id          - Delete a list permanently
 */

// Routes that need boardId from params (nested under /boards/:boardId/lists)
router.route("/").get(getLists).post(createList);

// Direct list routes (used when mounted at /api/v1/lists)
router.route("/:id").get(getList).put(updateList).delete(deleteList);

router.patch("/:id/reorder", reorderList);
router.patch("/:id/archive", archiveList);

// Nested routes: /api/v1/lists/:listId/cards
router.use("/:listId/cards", cardRoutes);

module.exports = router;
