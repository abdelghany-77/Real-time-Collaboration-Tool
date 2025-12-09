const { listService } = require("../services");
const { asyncHandler } = require("../utils");

/**
 * List Controller
 * Handles HTTP requests for list (column) operations
 */

/**
 * @desc    Create a new list in a board
 * @route   POST /api/v1/boards/:boardId/lists
 * @access  Private
 */
const createList = asyncHandler(async (req, res) => {
  const list = await listService.create({
    ...req.body,
    board: req.params.boardId,
  });

  res.status(201).json({
    success: true,
    data: list,
  });
});

/**
 * @desc    Get all lists for a board
 * @route   GET /api/v1/boards/:boardId/lists
 * @access  Private
 */
const getLists = asyncHandler(async (req, res) => {
  const lists = await listService.getByBoard(req.params.boardId);

  res.status(200).json({
    success: true,
    count: lists.length,
    data: lists,
  });
});

/**
 * @desc    Get a single list
 * @route   GET /api/v1/lists/:id
 * @access  Private
 */
const getList = asyncHandler(async (req, res) => {
  const list = await listService.getById(req.params.id);

  res.status(200).json({
    success: true,
    data: list,
  });
});

/**
 * @desc    Update a list
 * @route   PUT /api/v1/lists/:id
 * @access  Private
 */
const updateList = asyncHandler(async (req, res) => {
  const list = await listService.update(req.params.id, req.body);

  res.status(200).json({
    success: true,
    data: list,
  });
});

/**
 * @desc    Reorder a list (change its position)
 * @route   PATCH /api/v1/lists/:id/reorder
 * @body    { prevPosition: number|null, nextPosition: number|null }
 * @access  Private
 */
const reorderList = asyncHandler(async (req, res) => {
  const { prevPosition, nextPosition } = req.body;

  const list = await listService.reorder(
    req.params.id,
    prevPosition,
    nextPosition
  );

  res.status(200).json({
    success: true,
    data: list,
  });
});

/**
 * @desc    Archive a list
 * @route   PATCH /api/v1/lists/:id/archive
 * @access  Private
 */
const archiveList = asyncHandler(async (req, res) => {
  const list = await listService.archive(req.params.id);

  res.status(200).json({
    success: true,
    data: list,
  });
});

/**
 * @desc    Delete a list permanently
 * @route   DELETE /api/v1/lists/:id
 * @access  Private
 */
const deleteList = asyncHandler(async (req, res) => {
  await listService.delete(req.params.id);

  res.status(200).json({
    success: true,
    data: null,
    message: "List deleted successfully",
  });
});

module.exports = {
  createList,
  getLists,
  getList,
  updateList,
  reorderList,
  archiveList,
  deleteList,
};
