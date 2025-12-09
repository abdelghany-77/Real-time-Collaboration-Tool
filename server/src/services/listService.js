const { List, Card } = require("../models");
const { NotFoundError, BadRequestError } = require("../utils/errors");

/**
 * List Service
 * Handles all business logic related to lists (columns)
 */
class ListService {
  /**
   * Create a new list in a board
   * @param {Object} data - List data including boardId
   * @returns {Promise<List>}
   */
  async create(data) {
    const { board, title } = data;

    // Get the next position for the new list
    const position = await List.getNextPosition(board);

    const list = await List.create({
      title,
      board,
      position,
    });

    return list;
  }

  /**
   * Get all lists for a board
   * @param {string} boardId - Board ID
   * @returns {Promise<List[]>}
   */
  async getByBoard(boardId) {
    const lists = await List.find({ board: boardId, isArchived: false })
      .sort({ position: 1 })
      .lean();

    return lists;
  }

  /**
   * Get a single list by ID
   * @param {string} listId - List ID
   * @returns {Promise<List>}
   */
  async getById(listId) {
    const list = await List.findById(listId);

    if (!list) {
      throw new NotFoundError("List not found");
    }

    return list;
  }

  /**
   * Update a list
   * @param {string} listId - List ID
   * @param {Object} data - Update data
   * @returns {Promise<List>}
   */
  async update(listId, data) {
    // Don't allow changing board or position through regular update
    const { board, position, ...updateData } = data;

    const list = await List.findByIdAndUpdate(listId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!list) {
      throw new NotFoundError("List not found");
    }

    return list;
  }

  /**
   * Reorder a list within the board
   * @param {string} listId - List ID to move
   * @param {number|null} prevPosition - Position of list before target position
   * @param {number|null} nextPosition - Position of list after target position
   * @returns {Promise<List>}
   */
  async reorder(listId, prevPosition, nextPosition) {
    const newPosition = List.calculatePosition(prevPosition, nextPosition);

    const list = await List.findByIdAndUpdate(
      listId,
      { position: newPosition },
      { new: true }
    );

    if (!list) {
      throw new NotFoundError("List not found");
    }

    return list;
  }

  /**
   * Archive (soft delete) a list and its cards
   * @param {string} listId - List ID
   * @returns {Promise<List>}
   */
  async archive(listId) {
    const list = await List.findByIdAndUpdate(
      listId,
      { isArchived: true },
      { new: true }
    );

    if (!list) {
      throw new NotFoundError("List not found");
    }

    // Archive all cards in this list
    await Card.updateMany({ list: listId }, { isArchived: true });

    return list;
  }

  /**
   * Delete a list permanently
   * @param {string} listId - List ID
   */
  async delete(listId) {
    const list = await List.findById(listId);

    if (!list) {
      throw new NotFoundError("List not found");
    }

    // Delete all cards in this list
    await Card.deleteMany({ list: listId });

    // Delete the list
    await List.findByIdAndDelete(listId);
  }
}

module.exports = new ListService();
