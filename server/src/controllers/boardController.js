const { boardService } = require("../services");
const { asyncHandler } = require("../utils");

/**
 * Board Controller
 * Handles HTTP requests for board operations
 */

/**
 * @desc    Create a new board
 * @route   POST /api/v1/boards
 * @access  Private (when auth is implemented)
 */
const createBoard = asyncHandler(async (req, res) => {
  const board = await boardService.create(req.body);

  res.status(201).json({
    success: true,
    data: board,
  });
});

/**
 * @desc    Get all boards
 * @route   GET /api/v1/boards
 * @access  Private
 */
const getBoards = asyncHandler(async (req, res) => {
  const boards = await boardService.getAll();

  res.status(200).json({
    success: true,
    count: boards.length,
    data: boards,
  });
});

/**
 * @desc    Get a single board with all lists and cards
 * @route   GET /api/v1/boards/:id
 * @access  Private
 */
const getBoard = asyncHandler(async (req, res) => {
  const board = await boardService.getById(req.params.id);

  res.status(200).json({
    success: true,
    data: board,
  });
});

/**
 * @desc    Update a board
 * @route   PUT /api/v1/boards/:id
 * @access  Private
 */
const updateBoard = asyncHandler(async (req, res) => {
  const board = await boardService.update(req.params.id, req.body);

  res.status(200).json({
    success: true,
    data: board,
  });
});

/**
 * @desc    Archive a board
 * @route   PATCH /api/v1/boards/:id/archive
 * @access  Private
 */
const archiveBoard = asyncHandler(async (req, res) => {
  const board = await boardService.archive(req.params.id);

  res.status(200).json({
    success: true,
    data: board,
  });
});

/**
 * @desc    Delete a board permanently
 * @route   DELETE /api/v1/boards/:id
 * @access  Private
 */
const deleteBoard = asyncHandler(async (req, res) => {
  await boardService.delete(req.params.id);

  res.status(200).json({
    success: true,
    data: null,
    message: "Board deleted successfully",
  });
});

module.exports = {
  createBoard,
  getBoards,
  getBoard,
  updateBoard,
  archiveBoard,
  deleteBoard,
};
