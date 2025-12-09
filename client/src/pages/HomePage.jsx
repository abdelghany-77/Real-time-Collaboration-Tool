import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchBoards, createBoard } from "../store/slices/boardSlice";
import { PlusIcon } from "@heroicons/react/24/outline";

const BOARD_COLORS = [
  "#0079bf",
  "#d29034",
  "#519839",
  "#b04632",
  "#89609e",
  "#cd5a91",
  "#4bbf6b",
  "#00aecc",
];

const HomePage = () => {
  const dispatch = useDispatch();
  const { boards, loading, error } = useSelector((state) => state.board);
  const [showModal, setShowModal] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [selectedColor, setSelectedColor] = useState(BOARD_COLORS[0]);

  useEffect(() => {
    dispatch(fetchBoards());
  }, [dispatch]);

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!newBoardTitle.trim()) return;

    await dispatch(
      createBoard({
        title: newBoardTitle,
        background: selectedColor,
      })
    );

    setNewBoardTitle("");
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            📋 Task Board
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-base sm:text-lg font-semibold text-gray-700 mb-3 sm:mb-4">
            Your Boards
          </h2>

          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
            {/* Existing boards */}
            {boards.map((board) => (
              <Link
                key={board._id}
                to={`/board/${board._id}`}
                className="group relative h-20 sm:h-24 rounded-lg p-2.5 sm:p-4 text-white font-semibold hover:opacity-90 active:scale-[0.98] transition-all"
                style={{ backgroundColor: board.background || "#0079bf" }}
              >
                <span className="text-sm sm:text-base md:text-lg line-clamp-2">
                  {board.title}
                </span>
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 rounded-lg transition-opacity" />
              </Link>
            ))}

            {/* Create new board button */}
            <button
              onClick={() => setShowModal(true)}
              className="h-20 sm:h-24 rounded-lg bg-gray-200 hover:bg-gray-300 active:bg-gray-400 flex items-center justify-center text-gray-600 font-medium transition-colors"
            >
              <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              <span className="text-xs sm:text-sm md:text-base">
                Create new
              </span>
            </button>
          </div>
        </div>
      </main>

      {/* Create Board Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
          <div className="bg-white rounded-t-2xl sm:rounded-lg p-4 sm:p-6 w-full sm:max-w-md sm:mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
              Create Board
            </h3>

            <form onSubmit={handleCreateBoard}>
              {/* Preview */}
              <div
                className="h-20 sm:h-24 rounded-lg mb-3 sm:mb-4 p-3 sm:p-4 text-white font-semibold text-sm sm:text-base"
                style={{ backgroundColor: selectedColor }}
              >
                {newBoardTitle || "Board title"}
              </div>

              {/* Title input */}
              <input
                type="text"
                placeholder="Board title"
                value={newBoardTitle}
                onChange={(e) => setNewBoardTitle(e.target.value)}
                className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg mb-3 sm:mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                autoFocus
              />

              {/* Color picker */}
              <div className="flex flex-wrap gap-2 sm:gap-2 mb-4">
                {BOARD_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`w-9 h-9 sm:w-8 sm:h-8 rounded-lg sm:rounded ${
                      selectedColor === color
                        ? "ring-2 ring-offset-2 ring-blue-500"
                        : ""
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              {/* Actions */}
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-gray-600 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newBoardTitle.trim()}
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
