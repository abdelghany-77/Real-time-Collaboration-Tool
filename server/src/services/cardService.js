const { Card, List } = require("../models");
const { NotFoundError, BadRequestError } = require("../utils/errors");

/**
 * Card Service
 * Handles all business logic related to cards
 *
 * This service contains the core reordering algorithm for drag & drop operations.
 */
class CardService {
  /**
   * Create a new card in a list
   * @param {Object} data - Card data
   * @returns {Promise<Card>}
   */
  async create(data) {
    const { list, title, description, board } = data;

    // Verify the list exists
    const listDoc = await List.findById(list);
    if (!listDoc) {
      throw new NotFoundError("List not found");
    }

    // Get the next position for the new card
    const position = await Card.getNextPosition(list);

    const card = await Card.create({
      title,
      description,
      list,
      board: board || listDoc.board,
      position,
    });

    return card;
  }

  /**
   * Get all cards for a list
   * @param {string} listId - List ID
   * @returns {Promise<Card[]>}
   */
  async getByList(listId) {
    const cards = await Card.find({ list: listId, isArchived: false })
      .sort({ position: 1 })
      .lean();

    return cards;
  }

  /**
   * Get a single card by ID
   * @param {string} cardId - Card ID
   * @returns {Promise<Card>}
   */
  async getById(cardId) {
    const card = await Card.findById(cardId);

    if (!card) {
      throw new NotFoundError("Card not found");
    }

    return card;
  }

  /**
   * Update a card
   * @param {string} cardId - Card ID
   * @param {Object} data - Update data
   * @returns {Promise<Card>}
   */
  async update(cardId, data) {
    // Don't allow changing list, board, or position through regular update
    const { list, board, position, ...updateData } = data;

    const card = await Card.findByIdAndUpdate(cardId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!card) {
      throw new NotFoundError("Card not found");
    }

    return card;
  }

  /**
   * CARD REORDERING ALGORITHM
   * =========================
   * This is the core algorithm for drag & drop functionality.
   *
   * Handles two scenarios:
   * 1. Moving within the same list (reorder)
   * 2. Moving to a different list (move + reorder)
   *
   * @param {string} cardId - ID of the card being moved
   * @param {string} targetListId - ID of the destination list
   * @param {number|null} prevCardPosition - Position of card BEFORE the drop position
   * @param {number|null} nextCardPosition - Position of card AFTER the drop position
   * @returns {Promise<Card>}
   *
   * EXAMPLE SCENARIOS:
   *
   * Scenario 1: Move card to beginning of list
   * - prevCardPosition = null
   * - nextCardPosition = position of first card
   * - Result: newPosition = nextCardPosition / 2
   *
   * Scenario 2: Move card to end of list
   * - prevCardPosition = position of last card
   * - nextCardPosition = null
   * - Result: newPosition = prevCardPosition + 65535
   *
   * Scenario 3: Move card between two cards
   * - prevCardPosition = position of card above
   * - nextCardPosition = position of card below
   * - Result: newPosition = (prevCardPosition + nextCardPosition) / 2
   */
  async moveCard(cardId, targetListId, prevCardPosition, nextCardPosition) {
    // Find the card to move
    const card = await Card.findById(cardId);
    if (!card) {
      throw new NotFoundError("Card not found");
    }

    // Verify target list exists
    const targetList = await List.findById(targetListId);
    if (!targetList) {
      throw new NotFoundError("Target list not found");
    }

    // Calculate the new position using fractional indexing
    const newPosition = Card.calculatePosition(
      prevCardPosition,
      nextCardPosition
    );

    // Update the card with new list and position
    const updatedCard = await Card.findByIdAndUpdate(
      cardId,
      {
        list: targetListId,
        board: targetList.board, // Ensure board reference is correct
        position: newPosition,
      },
      { new: true }
    );

    return updatedCard;
  }

  /**
   * Batch reorder cards (used for complex drag operations or rebalancing)
   * @param {Array<{cardId: string, position: number}>} updates - Array of card updates
   * @returns {Promise<void>}
   */
  async batchReorder(updates) {
    const bulkOps = updates.map(({ cardId, position, listId }) => ({
      updateOne: {
        filter: { _id: cardId },
        update: { position, ...(listId && { list: listId }) },
      },
    }));

    await Card.bulkWrite(bulkOps);
  }

  /**
   * Rebalance card positions in a list
   * Useful when positions become too granular after many moves
   * @param {string} listId - List ID
   */
  async rebalanceList(listId) {
    await Card.rebalanceList(listId);
  }

  /**
   * Archive (soft delete) a card
   * @param {string} cardId - Card ID
   * @returns {Promise<Card>}
   */
  async archive(cardId) {
    const card = await Card.findByIdAndUpdate(
      cardId,
      { isArchived: true },
      { new: true }
    );

    if (!card) {
      throw new NotFoundError("Card not found");
    }

    return card;
  }

  /**
   * Delete a card permanently
   * @param {string} cardId - Card ID
   */
  async delete(cardId) {
    const card = await Card.findByIdAndDelete(cardId);

    if (!card) {
      throw new NotFoundError("Card not found");
    }
  }

  /**
   * Add a checklist item to a card
   * @param {string} cardId - Card ID
   * @param {Object} item - Checklist item
   * @returns {Promise<Card>}
   */
  async addChecklistItem(cardId, item) {
    const card = await Card.findByIdAndUpdate(
      cardId,
      { $push: { checklist: item } },
      { new: true, runValidators: true }
    );

    if (!card) {
      throw new NotFoundError("Card not found");
    }

    return card;
  }

  /**
   * Toggle checklist item completion
   * @param {string} cardId - Card ID
   * @param {string} itemId - Checklist item ID
   * @returns {Promise<Card>}
   */
  async toggleChecklistItem(cardId, itemId) {
    const card = await Card.findById(cardId);

    if (!card) {
      throw new NotFoundError("Card not found");
    }

    const item = card.checklist.id(itemId);
    if (!item) {
      throw new NotFoundError("Checklist item not found");
    }

    item.isCompleted = !item.isCompleted;
    await card.save();

    return card;
  }
}

module.exports = new CardService();
