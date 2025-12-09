const { Board, List, Card } = require("../models");
const { NotFoundError, BadRequestError } = require("../utils/errors");

/**
 * Board Service
 * Handles all business logic related to boards
 */
class BoardService {
  /**
   * Create a new board
   * @param {Object} data - Board data
   * @returns {Promise<Board>}
   */
  async create(data) {
    const board = await Board.create(data);
    return board;
  }

  /**
   * Get all boards (optionally filter by owner)
   * @param {Object} filter - Query filter
   * @returns {Promise<Board[]>}
   */
  async getAll(filter = {}) {
    const boards = await Board.find({ ...filter, isArchived: false })
      .sort({ updatedAt: -1 })
      .select("-__v");
    return boards;
  }

  /**
   * Get a single board by ID with all lists and cards
   * @param {string} boardId - Board ID
   * @returns {Promise<Object>}
   */
  async getById(boardId) {
    const board = await Board.findById(boardId);

    if (!board) {
      throw new NotFoundError("Board not found");
    }

    // Get all lists for this board, sorted by position
    const lists = await List.find({ board: boardId, isArchived: false })
      .sort({ position: 1 })
      .lean();

    // Get all cards for this board, sorted by position
    const cards = await Card.find({ board: boardId, isArchived: false })
      .sort({ position: 1 })
      .lean();

    // Group cards by list
    const cardsByList = cards.reduce((acc, card) => {
      const listId = card.list.toString();
      if (!acc[listId]) acc[listId] = [];
      acc[listId].push(card);
      return acc;
    }, {});

    // Attach cards to their lists
    const listsWithCards = lists.map((list) => ({
      ...list,
      cards: cardsByList[list._id.toString()] || [],
    }));

    return {
      ...board.toObject(),
      lists: listsWithCards,
    };
  }

  /**
   * Update a board
   * @param {string} boardId - Board ID
   * @param {Object} data - Update data
   * @returns {Promise<Board>}
   */
  async update(boardId, data) {
    const board = await Board.findByIdAndUpdate(
      boardId,
      { ...data },
      { new: true, runValidators: true }
    );

    if (!board) {
      throw new NotFoundError("Board not found");
    }

    return board;
  }

  /**
   * Archive (soft delete) a board
   * @param {string} boardId - Board ID
   * @returns {Promise<Board>}
   */
  async archive(boardId) {
    const board = await Board.findByIdAndUpdate(
      boardId,
      { isArchived: true },
      { new: true }
    );

    if (!board) {
      throw new NotFoundError("Board not found");
    }

    return board;
  }

  /**
   * Delete a board permanently (and all its lists/cards)
   * @param {string} boardId - Board ID
   */
  async delete(boardId) {
    const board = await Board.findById(boardId);

    if (!board) {
      throw new NotFoundError("Board not found");
    }

    // Delete all cards in this board
    await Card.deleteMany({ board: boardId });

    // Delete all lists in this board
    await List.deleteMany({ board: boardId });

    // Delete the board
    await Board.findByIdAndDelete(boardId);
  }
}

module.exports = new BoardService();
