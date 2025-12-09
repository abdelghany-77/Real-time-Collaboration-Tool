const mongoose = require("mongoose");

/**
 * List Schema (Column)
 *
 * A list represents a column on the board (e.g., "To Do", "In Progress", "Done").
 * Each list has a position field for ordering and belongs to one board.
 *
 * POSITION STRATEGY:
 * We use a floating-point position system for efficient reordering.
 * When inserting between two items, we calculate: (prevPosition + nextPosition) / 2
 * This avoids reindexing all items when moving/inserting.
 */
const listSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "List title is required"],
      trim: true,
      maxlength: [100, "List title cannot exceed 100 characters"],
    },
    // Reference to parent board
    board: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Board",
      required: [true, "List must belong to a board"],
      index: true,
    },
    /**
     * Position for ordering lists within a board.
     * Using floating-point allows insertion between any two positions
     * without updating other documents.
     *
     * Example: Lists at positions [1, 2, 3]
     * Insert between 1 and 2 -> new position = 1.5
     * Result: [1, 1.5, 2, 3]
     */
    position: {
      type: Number,
      required: true,
      default: 65535, // Start in the middle of a large range
    },
    // Soft delete - archived lists are hidden but not deleted
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual to get all cards belonging to this list
listSchema.virtual("cards", {
  ref: "Card",
  localField: "_id",
  foreignField: "list",
});

// Compound index for efficient queries: get all non-archived lists for a board, sorted by position
listSchema.index({ board: 1, isArchived: 1, position: 1 });

/**
 * Static method to get the next position for a new list in a board
 */
listSchema.statics.getNextPosition = async function (boardId) {
  const lastList = await this.findOne({ board: boardId, isArchived: false })
    .sort({ position: -1 })
    .select("position");

  return lastList ? lastList.position + 65535 : 65535;
};

/**
 * Static method to calculate position between two lists
 * @param {number|null} prevPosition - Position of the list before insertion point
 * @param {number|null} nextPosition - Position of the list after insertion point
 * @returns {number} - The calculated position
 */
listSchema.statics.calculatePosition = function (prevPosition, nextPosition) {
  // Inserting at the beginning
  if (prevPosition === null || prevPosition === undefined) {
    return nextPosition ? nextPosition / 2 : 65535;
  }
  // Inserting at the end
  if (nextPosition === null || nextPosition === undefined) {
    return prevPosition + 65535;
  }
  // Inserting between two lists
  return (prevPosition + nextPosition) / 2;
};

const List = mongoose.model("List", listSchema);

module.exports = List;
