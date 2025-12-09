import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useDispatch } from "react-redux";
import {
  socketCardMoved,
  socketCardCreated,
  socketCardUpdated,
  socketCardDeleted,
  socketListCreated,
  socketListUpdated,
  socketListDeleted,
} from "../store/slices/boardSlice";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    const socketInstance = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on("connect", () => {
      console.log("🔌 Connected to server");
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      console.log("🔌 Disconnected from server");
      setIsConnected(false);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    // Board events
    socketInstance.on("boardData", ({ board, activeUsers }) => {
      setActiveUsers(activeUsers);
    });

    socketInstance.on("userJoined", ({ user, activeUsers }) => {
      setActiveUsers(activeUsers);
    });

    socketInstance.on("userLeft", ({ socketId, activeUsers }) => {
      setActiveUsers(activeUsers);
    });

    // Card events
    socketInstance.on("cardMoved", (data) => {
      dispatch(socketCardMoved(data));
    });

    socketInstance.on("cardCreated", (data) => {
      dispatch(socketCardCreated(data));
    });

    socketInstance.on("cardUpdated", (data) => {
      dispatch(socketCardUpdated(data));
    });

    socketInstance.on("cardDeleted", (data) => {
      dispatch(socketCardDeleted(data));
    });

    // List events
    socketInstance.on("listCreated", (data) => {
      dispatch(socketListCreated(data));
    });

    socketInstance.on("listUpdated", (data) => {
      dispatch(socketListUpdated(data));
    });

    socketInstance.on("listDeleted", (data) => {
      dispatch(socketListDeleted(data));
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [dispatch]);

  const joinBoard = (boardId, user = null) => {
    if (socket) {
      socket.emit("joinBoard", { boardId, user });
    }
  };

  const leaveBoard = (boardId) => {
    if (socket) {
      socket.emit("leaveBoard", { boardId });
    }
  };

  const emitCardMoved = (data) => {
    if (socket) {
      socket.emit("cardMoved", data);
    }
  };

  const emitCardCreated = (data) => {
    if (socket) {
      socket.emit("cardCreated", data);
    }
  };

  const emitCardUpdated = (data) => {
    if (socket) {
      socket.emit("cardUpdated", data);
    }
  };

  const emitCardDeleted = (data) => {
    if (socket) {
      socket.emit("cardDeleted", data);
    }
  };

  const emitListCreated = (data) => {
    if (socket) {
      socket.emit("listCreated", data);
    }
  };

  const emitListUpdated = (data) => {
    if (socket) {
      socket.emit("listUpdated", data);
    }
  };

  const emitListDeleted = (data) => {
    if (socket) {
      socket.emit("listDeleted", data);
    }
  };

  const value = {
    socket,
    isConnected,
    activeUsers,
    joinBoard,
    leaveBoard,
    emitCardMoved,
    emitCardCreated,
    emitCardUpdated,
    emitCardDeleted,
    emitListCreated,
    emitListUpdated,
    emitListDeleted,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
