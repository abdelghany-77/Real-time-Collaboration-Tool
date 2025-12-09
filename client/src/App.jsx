import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import BoardPage from "./pages/BoardPage";
import { SocketProvider } from "./contexts/SocketContext";

function App() {
  return (
    <SocketProvider>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/board/:boardId" element={<BoardPage />} />
        </Routes>
      </div>
    </SocketProvider>
  );
}

export default App;
