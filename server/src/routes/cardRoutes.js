const express = require("express");
const router = express.Router({ mergeParams: true }); // Enable access to parent params (listId)
const {
  createCard,
  getCards,
  getCard,
  updateCard,
  moveCard,
  archiveCard,
  deleteCard,
  addChecklistItem,
  toggleChecklistItem,
} = require("../controllers/cardController");

/**
 * Card Routes
 *
 * Nested under lists: /api/v1/lists/:listId/cards
 * GET    /api/v1/lists/:listId/cards     - Get all cards for a list
 * POST   /api/v1/lists/:listId/cards     - Create a new card in a list
 *
 * Direct routes: /api/v1/cards
 * GET    /api/v1/cards/:id          - Get a single card
 * PUT    /api/v1/cards/:id          - Update a card
 * PATCH  /api/v1/cards/:id/move     - Move/reorder a card (drag & drop)
 * PATCH  /api/v1/cards/:id/archive  - Archive a card
 * DELETE /api/v1/cards/:id          - Delete a card permanently
 *
 * Checklist routes:
 * POST   /api/v1/cards/:id/checklist              - Add checklist item
 * PATCH  /api/v1/cards/:cardId/checklist/:itemId/toggle - Toggle checklist item
 */

// Routes that need listId from params (nested under /lists/:listId/cards)
router.route("/").get(getCards).post(createCard);

// Direct card routes (used when mounted at /api/v1/cards)
router.route("/:id").get(getCard).put(updateCard).delete(deleteCard);

router.patch("/:id/move", moveCard);
router.patch("/:id/archive", archiveCard);

// Checklist routes
router.post("/:id/checklist", addChecklistItem);
router.patch("/:cardId/checklist/:itemId/toggle", toggleChecklistItem);

module.exports = router;
