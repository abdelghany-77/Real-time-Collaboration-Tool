const { boardService, cardService, listService } = require("../services");

/**
 * Socket.io Event Handler
 *
 * This module sets up all WebSocket event handlers for real-time collaboration.
 *
 * ARCHITECTURE OVERVIEW:
 * =====================
 *
 * 1. ROOMS: Each board has its own "room" in Socket.io
 *    - When a user opens a board, they join that room
 *    - All updates to the board are broadcast to the room
 *    - Users leave the room when they close the board
 *
 * 2. EVENT FLOW:
 *    User Action -> REST API (persistence) -> Socket Event (broadcast)
 *
 *    OR for optimistic updates:
 *    User Action -> Socket Event (immediate broadcast) -> REST API (background persistence)
 *
 * 3. EVENTS:
 *    - joinBoard: User joins a board room
 *    - leaveBoard: User leaves a board room
 *    - cardMoved: Card was moved/reordered
 *    - cardCreated: New card was created
 *    - cardUpdated: Card was updated
 *    - cardDeleted: Card was deleted
 *    - listCreated: New list was created
 *    - listUpdated: List was updated
 *    - listDeleted: List was deleted
 *    - listReordered: List position changed
 *    - boardUpdated: Board settings changed
 */

/**
 * Initialize Socket.io event handlers
 * @param {Server} io - Socket.io server instance
 */
const initializeSocket = (io) => {
  // Track active users per board (for presence feature)
  const boardUsers = new Map(); // boardId -> Set of {socketId, user}

  io.on("connection", (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);

    /**
     * JOIN BOARD
     * User joins a specific board room to receive updates
     *
     * @event joinBoard
     * @param {string} boardId - ID of the board to join
     * @param {Object} user - User information (optional, for presence)
     */
    socket.on("joinBoard", async ({ boardId, user }) => {
      try {
        // Leave any previously joined boards
        const rooms = Array.from(socket.rooms);
        rooms.forEach((room) => {
          if (room !== socket.id && room.startsWith("board:")) {
            socket.leave(room);
            // Remove from tracking
            const prevBoardId = room.replace("board:", "");
            if (boardUsers.has(prevBoardId)) {
              boardUsers.get(prevBoardId).delete(socket.id);
            }
          }
        });

        // Join the new board room
        const roomName = `board:${boardId}`;
        socket.join(roomName);

        // Track user presence
        if (!boardUsers.has(boardId)) {
          boardUsers.set(boardId, new Map());
        }
        boardUsers.get(boardId).set(socket.id, { socketId: socket.id, user });

        // Get current board data
        const board = await boardService.getById(boardId);

        // Send board data to the joining user
        socket.emit("boardData", {
          board,
          activeUsers: Array.from(boardUsers.get(boardId).values()),
        });

        // Notify others that a user joined
        socket.to(roomName).emit("userJoined", {
          user,
          activeUsers: Array.from(boardUsers.get(boardId).values()),
        });

        console.log(`👤 User ${socket.id} joined board ${boardId}`);
      } catch (error) {
        console.error("Error joining board:", error);
        socket.emit("error", { message: "Failed to join board" });
      }
    });

    /**
     * LEAVE BOARD
     * User explicitly leaves a board room
     *
     * @event leaveBoard
     * @param {string} boardId - ID of the board to leave
     */
    socket.on("leaveBoard", ({ boardId }) => {
      const roomName = `board:${boardId}`;
      socket.leave(roomName);

      // Remove from tracking
      if (boardUsers.has(boardId)) {
        boardUsers.get(boardId).delete(socket.id);

        // Notify others that user left
        socket.to(roomName).emit("userLeft", {
          socketId: socket.id,
          activeUsers: Array.from(boardUsers.get(boardId).values()),
        });
      }

      console.log(`👤 User ${socket.id} left board ${boardId}`);
    });

    /**
     * CARD MOVED
     * Broadcast when a card is moved/reordered (drag & drop)
     * This is called AFTER the REST API updates the database
     *
     * @event cardMoved
     * @param {Object} data - { boardId, cardId, sourceListId, targetListId, newPosition, card }
     */
    socket.on(
      "cardMoved",
      ({ boardId, cardId, sourceListId, targetListId, newPosition, card }) => {
        const roomName = `board:${boardId}`;

        // Broadcast to all OTHER users in the room
        socket.to(roomName).emit("cardMoved", {
          cardId,
          sourceListId,
          targetListId,
          newPosition,
          card,
        });

        console.log(`📦 Card ${cardId} moved in board ${boardId}`);
      }
    );

    /**
     * CARD CREATED
     * Broadcast when a new card is created
     *
     * @event cardCreated
     * @param {Object} data - { boardId, listId, card }
     */
    socket.on("cardCreated", ({ boardId, listId, card }) => {
      const roomName = `board:${boardId}`;

      socket.to(roomName).emit("cardCreated", {
        listId,
        card,
      });

      console.log(`📦 Card created in board ${boardId}`);
    });

    /**
     * CARD UPDATED
     * Broadcast when a card is updated
     *
     * @event cardUpdated
     * @param {Object} data - { boardId, cardId, updates }
     */
    socket.on("cardUpdated", ({ boardId, cardId, updates }) => {
      const roomName = `board:${boardId}`;

      socket.to(roomName).emit("cardUpdated", {
        cardId,
        updates,
      });

      console.log(`📦 Card ${cardId} updated in board ${boardId}`);
    });

    /**
     * CARD DELETED
     * Broadcast when a card is deleted/archived
     *
     * @event cardDeleted
     * @param {Object} data - { boardId, cardId, listId }
     */
    socket.on("cardDeleted", ({ boardId, cardId, listId }) => {
      const roomName = `board:${boardId}`;

      socket.to(roomName).emit("cardDeleted", {
        cardId,
        listId,
      });

      console.log(`📦 Card ${cardId} deleted in board ${boardId}`);
    });

    /**
     * LIST CREATED
     * Broadcast when a new list is created
     *
     * @event listCreated
     * @param {Object} data - { boardId, list }
     */
    socket.on("listCreated", ({ boardId, list }) => {
      const roomName = `board:${boardId}`;

      socket.to(roomName).emit("listCreated", {
        list,
      });

      console.log(`📋 List created in board ${boardId}`);
    });

    /**
     * LIST UPDATED
     * Broadcast when a list is updated
     *
     * @event listUpdated
     * @param {Object} data - { boardId, listId, updates }
     */
    socket.on("listUpdated", ({ boardId, listId, updates }) => {
      const roomName = `board:${boardId}`;

      socket.to(roomName).emit("listUpdated", {
        listId,
        updates,
      });

      console.log(`📋 List ${listId} updated in board ${boardId}`);
    });

    /**
     * LIST REORDERED
     * Broadcast when a list position changes
     *
     * @event listReordered
     * @param {Object} data - { boardId, listId, newPosition }
     */
    socket.on("listReordered", ({ boardId, listId, newPosition }) => {
      const roomName = `board:${boardId}`;

      socket.to(roomName).emit("listReordered", {
        listId,
        newPosition,
      });

      console.log(`📋 List ${listId} reordered in board ${boardId}`);
    });

    /**
     * LIST DELETED
     * Broadcast when a list is deleted/archived
     *
     * @event listDeleted
     * @param {Object} data - { boardId, listId }
     */
    socket.on("listDeleted", ({ boardId, listId }) => {
      const roomName = `board:${boardId}`;

      socket.to(roomName).emit("listDeleted", {
        listId,
      });

      console.log(`📋 List ${listId} deleted in board ${boardId}`);
    });

    /**
     * BOARD UPDATED
     * Broadcast when board settings change
     *
     * @event boardUpdated
     * @param {Object} data - { boardId, updates }
     */
    socket.on("boardUpdated", ({ boardId, updates }) => {
      const roomName = `board:${boardId}`;

      socket.to(roomName).emit("boardUpdated", {
        updates,
      });

      console.log(`📌 Board ${boardId} updated`);
    });

    /**
     * CURSOR POSITION (Optional: for collaborative cursor feature)
     * Broadcast user's cursor position on the board
     *
     * @event cursorMove
     * @param {Object} data - { boardId, position: { x, y } }
     */
    socket.on("cursorMove", ({ boardId, position }) => {
      const roomName = `board:${boardId}`;

      socket.to(roomName).emit("cursorMove", {
        socketId: socket.id,
        position,
      });
    });

    /**
     * HANDLE DISCONNECTION
     * Clean up when user disconnects
     */
    socket.on("disconnect", () => {
      console.log(`🔌 User disconnected: ${socket.id}`);

      // Remove user from all board rooms they were tracking
      boardUsers.forEach((users, boardId) => {
        if (users.has(socket.id)) {
          users.delete(socket.id);

          // Notify others in that board
          socket.to(`board:${boardId}`).emit("userLeft", {
            socketId: socket.id,
            activeUsers: Array.from(users.values()),
          });
        }
      });
    });
  });

  return io;
};

module.exports = { initializeSocket };
