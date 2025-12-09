import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "../../services/api";

// Async thunks
export const fetchBoards = createAsyncThunk(
  "board/fetchBoards",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.getBoards();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch boards"
      );
    }
  }
);

export const fetchBoard = createAsyncThunk(
  "board/fetchBoard",
  async (boardId, { rejectWithValue }) => {
    try {
      const response = await api.getBoard(boardId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch board"
      );
    }
  }
);

export const createBoard = createAsyncThunk(
  "board/createBoard",
  async (boardData, { rejectWithValue }) => {
    try {
      const response = await api.createBoard(boardData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create board"
      );
    }
  }
);

export const createList = createAsyncThunk(
  "board/createList",
  async ({ boardId, title }, { rejectWithValue }) => {
    try {
      const response = await api.createList(boardId, { title });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create list"
      );
    }
  }
);

export const updateList = createAsyncThunk(
  "board/updateList",
  async ({ listId, title }, { rejectWithValue }) => {
    try {
      const response = await api.updateList(listId, { title });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update list"
      );
    }
  }
);

export const deleteList = createAsyncThunk(
  "board/deleteList",
  async (listId, { rejectWithValue }) => {
    try {
      await api.deleteList(listId);
      return listId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete list"
      );
    }
  }
);

export const createCard = createAsyncThunk(
  "board/createCard",
  async ({ listId, title, boardId }, { rejectWithValue }) => {
    try {
      const response = await api.createCard(listId, { title, board: boardId });
      return { listId, card: response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create card"
      );
    }
  }
);

export const updateCard = createAsyncThunk(
  "board/updateCard",
  async ({ cardId, updates }, { rejectWithValue }) => {
    try {
      const response = await api.updateCard(cardId, updates);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update card"
      );
    }
  }
);

export const deleteCard = createAsyncThunk(
  "board/deleteCard",
  async ({ cardId, listId }, { rejectWithValue }) => {
    try {
      await api.deleteCard(cardId);
      return { cardId, listId };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete card"
      );
    }
  }
);

export const moveCard = createAsyncThunk(
  "board/moveCard",
  async (
    { cardId, targetListId, prevCardPosition, nextCardPosition },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.moveCard(cardId, {
        targetListId,
        prevCardPosition,
        nextCardPosition,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to move card"
      );
    }
  }
);

const initialState = {
  boards: [],
  currentBoard: null,
  loading: false,
  error: null,
};

const boardSlice = createSlice({
  name: "board",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentBoard: (state) => {
      state.currentBoard = null;
    },
    // Optimistic updates for real-time sync
    optimisticMoveCard: (state, action) => {
      const { cardId, sourceListId, targetListId, newIndex } = action.payload;

      if (!state.currentBoard) return;

      const sourceList = state.currentBoard.lists.find(
        (l) => l._id === sourceListId
      );
      const targetList = state.currentBoard.lists.find(
        (l) => l._id === targetListId
      );

      if (!sourceList || !targetList) return;

      // Find and remove the card from source
      const cardIndex = sourceList.cards.findIndex((c) => c._id === cardId);
      if (cardIndex === -1) return;

      const [card] = sourceList.cards.splice(cardIndex, 1);

      // Update card's list reference
      card.list = targetListId;

      // Insert into target at the specified index
      targetList.cards.splice(newIndex, 0, card);
    },
    // Socket event handlers
    socketCardMoved: (state, action) => {
      const { cardId, sourceListId, targetListId, card } = action.payload;

      if (!state.currentBoard) return;

      const sourceList = state.currentBoard.lists.find(
        (l) => l._id === sourceListId
      );
      const targetList = state.currentBoard.lists.find(
        (l) => l._id === targetListId
      );

      if (sourceList) {
        sourceList.cards = sourceList.cards.filter((c) => c._id !== cardId);
      }

      if (targetList && card) {
        // Insert card maintaining position order
        targetList.cards.push(card);
        targetList.cards.sort((a, b) => a.position - b.position);
      }
    },
    socketCardCreated: (state, action) => {
      const { listId, card } = action.payload;

      if (!state.currentBoard) return;

      const list = state.currentBoard.lists.find((l) => l._id === listId);
      if (list && !list.cards.find((c) => c._id === card._id)) {
        list.cards.push(card);
        list.cards.sort((a, b) => a.position - b.position);
      }
    },
    socketCardUpdated: (state, action) => {
      const { cardId, updates } = action.payload;

      if (!state.currentBoard) return;

      for (const list of state.currentBoard.lists) {
        const card = list.cards.find((c) => c._id === cardId);
        if (card) {
          Object.assign(card, updates);
          break;
        }
      }
    },
    socketCardDeleted: (state, action) => {
      const { cardId, listId } = action.payload;

      if (!state.currentBoard) return;

      const list = state.currentBoard.lists.find((l) => l._id === listId);
      if (list) {
        list.cards = list.cards.filter((c) => c._id !== cardId);
      }
    },
    socketListCreated: (state, action) => {
      const { list } = action.payload;

      if (!state.currentBoard) return;

      if (!state.currentBoard.lists.find((l) => l._id === list._id)) {
        state.currentBoard.lists.push({ ...list, cards: [] });
        state.currentBoard.lists.sort((a, b) => a.position - b.position);
      }
    },
    socketListUpdated: (state, action) => {
      const { listId, updates } = action.payload;

      if (!state.currentBoard) return;

      const list = state.currentBoard.lists.find((l) => l._id === listId);
      if (list) {
        Object.assign(list, updates);
      }
    },
    socketListDeleted: (state, action) => {
      const { listId } = action.payload;

      if (!state.currentBoard) return;

      state.currentBoard.lists = state.currentBoard.lists.filter(
        (l) => l._id !== listId
      );
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch boards
      .addCase(fetchBoards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBoards.fulfilled, (state, action) => {
        state.loading = false;
        state.boards = action.payload;
      })
      .addCase(fetchBoards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch single board
      .addCase(fetchBoard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBoard.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBoard = action.payload;
      })
      .addCase(fetchBoard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create board
      .addCase(createBoard.fulfilled, (state, action) => {
        state.boards.push(action.payload);
      })
      // Create list
      .addCase(createList.fulfilled, (state, action) => {
        if (state.currentBoard) {
          state.currentBoard.lists.push({ ...action.payload, cards: [] });
        }
      })
      // Update list
      .addCase(updateList.fulfilled, (state, action) => {
        if (state.currentBoard) {
          const list = state.currentBoard.lists.find(
            (l) => l._id === action.payload._id
          );
          if (list) {
            Object.assign(list, action.payload);
          }
        }
      })
      // Delete list
      .addCase(deleteList.fulfilled, (state, action) => {
        if (state.currentBoard) {
          state.currentBoard.lists = state.currentBoard.lists.filter(
            (l) => l._id !== action.payload
          );
        }
      })
      // Create card
      .addCase(createCard.fulfilled, (state, action) => {
        if (state.currentBoard) {
          const list = state.currentBoard.lists.find(
            (l) => l._id === action.payload.listId
          );
          if (list) {
            list.cards.push(action.payload.card);
          }
        }
      })
      // Update card
      .addCase(updateCard.fulfilled, (state, action) => {
        if (state.currentBoard) {
          for (const list of state.currentBoard.lists) {
            const cardIndex = list.cards.findIndex(
              (c) => c._id === action.payload._id
            );
            if (cardIndex !== -1) {
              list.cards[cardIndex] = action.payload;
              break;
            }
          }
        }
      })
      // Delete card
      .addCase(deleteCard.fulfilled, (state, action) => {
        if (state.currentBoard) {
          const list = state.currentBoard.lists.find(
            (l) => l._id === action.payload.listId
          );
          if (list) {
            list.cards = list.cards.filter(
              (c) => c._id !== action.payload.cardId
            );
          }
        }
      })
      // Move card
      .addCase(moveCard.fulfilled, (state, action) => {
        // Card already moved optimistically, just update with server response
        if (state.currentBoard) {
          for (const list of state.currentBoard.lists) {
            const cardIndex = list.cards.findIndex(
              (c) => c._id === action.payload._id
            );
            if (cardIndex !== -1) {
              list.cards[cardIndex] = action.payload;
              break;
            }
          }
        }
      });
  },
});

export const {
  clearError,
  clearCurrentBoard,
  optimisticMoveCard,
  socketCardMoved,
  socketCardCreated,
  socketCardUpdated,
  socketCardDeleted,
  socketListCreated,
  socketListUpdated,
  socketListDeleted,
} = boardSlice.actions;

export default boardSlice.reducer;
