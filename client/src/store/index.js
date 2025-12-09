import { configureStore } from "@reduxjs/toolkit";
import boardReducer from "./slices/boardSlice";

export const store = configureStore({
  reducer: {
    board: boardReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
