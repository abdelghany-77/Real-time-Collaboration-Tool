const { cardService } = require("../services");
const { asyncHandler } = require("../utils");

/**
 * Card Controller
 * Handles HTTP requests for card operations
 */

/**
 * @desc    Create a new card in a list
 * @route   POST /api/v1/lists/:listId/cards
 * @access  Private
 */
const createCard = asyncHandler(async (req, res) => {
  const card = await cardService.create({
    ...req.body,
    list: req.params.listId,
  });

  res.status(201).json({
    success: true,
    data: card,
  });
});

/**
 * @desc    Get all cards for a list
 * @route   GET /api/v1/lists/:listId/cards
 * @access  Private
 */
const getCards = asyncHandler(async (req, res) => {
  const cards = await cardService.getByList(req.params.listId);

  res.status(200).json({
    success: true,
    count: cards.length,
    data: cards,
  });
});

/**
 * @desc    Get a single card
 * @route   GET /api/v1/cards/:id
 * @access  Private
 */
const getCard = asyncHandler(async (req, res) => {
  const card = await cardService.getById(req.params.id);

  res.status(200).json({
    success: true,
    data: card,
  });
});

/**
 * @desc    Update a card
 * @route   PUT /api/v1/cards/:id
 * @access  Private
 */
const updateCard = asyncHandler(async (req, res) => {
  const card = await cardService.update(req.params.id, req.body);

  res.status(200).json({
    success: true,
    data: card,
  });
});

/**
 * @desc    Move/reorder a card (drag & drop)
 * @route   PATCH /api/v1/cards/:id/move
 * @body    {
 *            targetListId: string,      // Destination list
 *            prevCardPosition: number,  // Position of card above drop point (null if first)
 *            nextCardPosition: number   // Position of card below drop point (null if last)
 *          }
 * @access  Private
 *
 * This is the primary endpoint for handling drag & drop operations.
 * The frontend sends the positions of adjacent cards, and we calculate
 * the new position using fractional indexing.
 */
const moveCard = asyncHandler(async (req, res) => {
  const { targetListId, prevCardPosition, nextCardPosition } = req.body;

  const card = await cardService.moveCard(
    req.params.id,
    targetListId,
    prevCardPosition,
    nextCardPosition
  );

  res.status(200).json({
    success: true,
    data: card,
  });
});

/**
 * @desc    Archive a card
 * @route   PATCH /api/v1/cards/:id/archive
 * @access  Private
 */
const archiveCard = asyncHandler(async (req, res) => {
  const card = await cardService.archive(req.params.id);

  res.status(200).json({
    success: true,
    data: card,
  });
});

/**
 * @desc    Delete a card permanently
 * @route   DELETE /api/v1/cards/:id
 * @access  Private
 */
const deleteCard = asyncHandler(async (req, res) => {
  await cardService.delete(req.params.id);

  res.status(200).json({
    success: true,
    data: null,
    message: "Card deleted successfully",
  });
});

/**
 * @desc    Add checklist item to a card
 * @route   POST /api/v1/cards/:id/checklist
 * @body    { title: string }
 * @access  Private
 */
const addChecklistItem = asyncHandler(async (req, res) => {
  const card = await cardService.addChecklistItem(req.params.id, req.body);

  res.status(200).json({
    success: true,
    data: card,
  });
});

/**
 * @desc    Toggle checklist item completion
 * @route   PATCH /api/v1/cards/:cardId/checklist/:itemId/toggle
 * @access  Private
 */
const toggleChecklistItem = asyncHandler(async (req, res) => {
  const card = await cardService.toggleChecklistItem(
    req.params.cardId,
    req.params.itemId
  );

  res.status(200).json({
    success: true,
    data: card,
  });
});

module.exports = {
  createCard,
  getCards,
  getCard,
  updateCard,
  moveCard,
  archiveCard,
  deleteCard,
  addChecklistItem,
  toggleChecklistItem,
};
