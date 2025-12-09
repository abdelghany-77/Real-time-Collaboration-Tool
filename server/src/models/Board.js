import { Schema, model } from "mongoose";

/**
 * Board Schema
 *
 * A board is the top-level container that holds multiple lists.
 * Example: "Sprint 23" board, "Personal Tasks" board
 */
const boardSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Board title is required"],
      trim: true,
      maxlength: [100, "Board title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    // Background color or image for the board
    background: {
      type: String,
      default: "#0079bf", // Default Trello blue
    },
    // Owner of the board
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      // Required when you implement authentication
      // required: true,
    },
    // Collaborators who can view/edit the board
    members: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        role: {
          type: String,
          enum: ["admin", "member", "viewer"],
          default: "member",
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Soft delete support
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual to get all lists belonging to this board
boardSchema.virtual("lists", {
  ref: "List",
  localField: "_id",
  foreignField: "board",
});

// Index for faster queries
boardSchema.index({ owner: 1, isArchived: 1 });
boardSchema.index({ "members.user": 1 });

const Board = model("Board", boardSchema);

export default Board;
