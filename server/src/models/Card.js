const mongoose = require("mongoose");

/**
 * Card Schema
 *
 * A card is a task item that lives within a list.
 * Cards can be dragged between lists and reordered within a list.
 *
 * REORDERING ALGORITHM EXPLANATION:
 * ================================
 * We use a "fractional indexing" approach for positions:
 *
 * 1. Each card has a floating-point `position` field
 * 2. Cards are sorted by position (ascending) when displayed
 * 3. When moving a card between two others, we calculate:
 *    newPosition = (prevCardPosition + nextCardPosition) / 2
 *
 * EXAMPLE:
 * Cards: A(1.0), B(2.0), C(3.0)
 * Move C between A and B:
 *   - prevPosition = 1.0 (A)
 *   - nextPosition = 2.0 (B)
 *   - C's new position = (1.0 + 2.0) / 2 = 1.5
 * Result: A(1.0), C(1.5), B(2.0)
 *
 * BENEFITS:
 * - Only 1 document updated per move (the moved card)
 * - O(1) database operations
 * - No need to update positions of other cards
 *
 * EDGE CASE - Position Exhaustion:
 * After many moves, positions might get too close (e.g., 1.000000001).
 * Solution: Periodically "rebalance" by reassigning positions (1, 2, 3, ...)
 * This is rare and can be done as a background task.
 */
const cardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Card title is required"],
      trim: true,
      maxlength: [200, "Card title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    // Reference to parent list
    list: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "List",
      required: [true, "Card must belong to a list"],
      index: true,
    },
    // Reference to the board (denormalized for easier querying)
    board: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Board",
      required: [true, "Card must belong to a board"],
      index: true,
    },
    /**
     * Position for ordering within a list.
     * Uses large increments (65535) to allow many insertions between positions.
     */
    position: {
      type: Number,
      required: true,
      default: 65535,
    },
    // Card labels/tags for categorization
    labels: [
      {
        color: {
          type: String,
          enum: ["green", "yellow", "orange", "red", "purple", "blue"],
        },
        text: {
          type: String,
          maxlength: 50,
        },
      },
    ],
    // Due date for the task
    dueDate: {
      type: Date,
    },
    // Is the due date completed?
    isDueDateComplete: {
      type: Boolean,
      default: false,
    },
    // Assigned users
    assignees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // Cover image or color
    cover: {
      type: {
        type: String,
        enum: ["color", "image"],
      },
      value: String, // Color hex or image URL
    },
    // Checklist items
    checklist: [
      {
        title: {
          type: String,
          required: true,
          maxlength: 200,
        },
        isCompleted: {
          type: Boolean,
          default: false,
        },
      },
    ],
    // Soft delete
    isArchived: {
      type: Boolean,
      default: false,
    },
    // Created by user
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries: get all non-archived cards for a list, sorted by position
cardSchema.index({ list: 1, isArchived: 1, position: 1 });
cardSchema.index({ board: 1, isArchived: 1 });

/**
 * Static method to get the next position for a new card in a list
 */
cardSchema.statics.getNextPosition = async function (listId) {
  const lastCard = await this.findOne({ list: listId, isArchived: false })
    .sort({ position: -1 })
    .select("position");

  return lastCard ? lastCard.position + 65535 : 65535;
};

/**
 * Static method to calculate position between two cards
 * @param {number|null} prevPosition - Position of card before insertion point
 * @param {number|null} nextPosition - Position of card after insertion point
 * @returns {number} - The calculated position
 */
cardSchema.statics.calculatePosition = function (prevPosition, nextPosition) {
  // Inserting at the beginning of the list
  if (prevPosition === null || prevPosition === undefined) {
    return nextPosition ? nextPosition / 2 : 65535;
  }
  // Inserting at the end of the list
  if (nextPosition === null || nextPosition === undefined) {
    return prevPosition + 65535;
  }
  // Inserting between two cards
  return (prevPosition + nextPosition) / 2;
};

/**
 * Static method to rebalance card positions in a list
 * Call this when positions get too granular (optional optimization)
 */
cardSchema.statics.rebalanceList = async function (listId) {
  const cards = await this.find({ list: listId, isArchived: false })
    .sort({ position: 1 })
    .select("_id");

  const bulkOps = cards.map((card, index) => ({
    updateOne: {
      filter: { _id: card._id },
      update: { position: (index + 1) * 65535 },
    },
  }));

  if (bulkOps.length > 0) {
    await this.bulkWrite(bulkOps);
  }
};

const Card = mongoose.model("Card", cardSchema);

module.exports = Card;
