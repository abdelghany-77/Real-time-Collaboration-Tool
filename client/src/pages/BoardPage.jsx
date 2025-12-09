import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import {
  fetchBoard,
  createList,
  moveCard,
  clearCurrentBoard,
  optimisticMoveCard,
} from "../store/slices/boardSlice";
import { useSocket } from "../contexts/SocketContext";
import List from "../components/List";
import {
  ArrowLeftIcon,
  PlusIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

const BoardPage = () => {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentBoard, loading, error } = useSelector((state) => state.board);
  const { joinBoard, leaveBoard, isConnected, activeUsers, emitCardMoved } =
    useSocket();

  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");

  useEffect(() => {
    dispatch(fetchBoard(boardId));
    joinBoard(boardId);

    return () => {
      leaveBoard(boardId);
      dispatch(clearCurrentBoard());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId]);

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId, type } = result;

    // Dropped outside a valid area
    if (!destination) return;

    // Dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (type === "CARD") {
      const sourceListId = source.droppableId;
      const targetListId = destination.droppableId;
      const cardId = draggableId;

      // Get the target list's cards
      const targetList = currentBoard.lists.find((l) => l._id === targetListId);
      if (!targetList) return;

      // Calculate positions for the API
      const targetCards = [...targetList.cards];

      // If moving within the same list, we need to account for the card being removed
      if (sourceListId === targetListId) {
        const sourceIndex = targetCards.findIndex((c) => c._id === cardId);
        targetCards.splice(sourceIndex, 1);
      }

      const prevCard = targetCards[destination.index - 1];
      const nextCard = targetCards[destination.index];

      const prevCardPosition = prevCard?.position ?? null;
      const nextCardPosition = nextCard?.position ?? null;

      // Optimistic update
      dispatch(
        optimisticMoveCard({
          cardId,
          sourceListId,
          targetListId,
          newIndex: destination.index,
        })
      );

      // API call
      try {
        const result = await dispatch(
          moveCard({
            cardId,
            targetListId,
            prevCardPosition,
            nextCardPosition,
          })
        ).unwrap();

        // Emit socket event for other users
        emitCardMoved({
          boardId,
          cardId,
          sourceListId,
          targetListId,
          newPosition: result.position,
          card: result,
        });
      } catch (error) {
        // Revert on failure by refetching
        dispatch(fetchBoard(boardId));
      }
    }
  };

  const handleAddList = async (e) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;

    await dispatch(createList({ boardId, title: newListTitle }));
    setNewListTitle("");
    setIsAddingList(false);
  };

  if (loading && !currentBoard) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#0079bf" }}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  if (!currentBoard) return null;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: currentBoard.background || "#0079bf" }}
    >
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between px-2 sm:px-4 py-2 sm:py-3 bg-black bg-opacity-20 gap-2 sm:gap-0 safe-area-padding">
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
          <button
            onClick={() => navigate("/")}
            className="p-2 text-white hover:bg-white hover:bg-opacity-20 active:bg-opacity-30 rounded-lg transition-colors flex-shrink-0"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <h1 className="text-base sm:text-xl font-bold text-white truncate max-w-[140px] xs:max-w-[180px] sm:max-w-xs md:max-w-md">
            {currentBoard.title}
          </h1>

          {/* Add List Button - In Header */}
          <button
            onClick={() => setIsAddingList(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-white bg-opacity-25 hover:bg-opacity-35 active:bg-opacity-45 text-white rounded-lg transition-colors text-xs sm:text-sm font-medium flex-shrink-0 ml-auto sm:ml-2"
          >
            <PlusIcon className="w-4 h-4" />
            <span className="hidden xs:inline">Add List</span>
          </button>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 ml-auto sm:ml-4">
          {/* Connection status */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-white text-xs sm:text-sm">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-green-400" : "bg-red-400"
              }`}
            ></span>
            <span className="hidden xs:inline">
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>

          {/* Active users */}
          {activeUsers.length > 0 && (
            <div className="flex items-center gap-1.5 sm:gap-2 text-white text-xs sm:text-sm">
              <UsersIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>{activeUsers.length}</span>
              <span className="hidden xs:inline">online</span>
            </div>
          )}
        </div>
      </header>

      {/* Board content */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="board" direction="horizontal" type="LIST">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex-1 p-2 sm:p-4 overflow-x-auto overflow-y-hidden custom-scrollbar hide-scrollbar-mobile"
            >
              <div className="flex gap-2 sm:gap-4 items-start h-full pb-2">
                {/* Lists */}
                {currentBoard.lists.map((list, index) => (
                  <List
                    key={list._id}
                    list={list}
                    index={index}
                    boardId={boardId}
                  />
                ))}
                {provided.placeholder}

                {/* Add list form - only shows when adding */}
                {isAddingList && (
                  <div className="flex-shrink-0 w-64 sm:w-72">
                    <form
                      onSubmit={handleAddList}
                      className="bg-list-bg rounded-xl p-2"
                    >
                      <input
                        type="text"
                        placeholder="Enter list title..."
                        value={newListTitle}
                        onChange={(e) => setNewListTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border-2 border-blue-500 focus:outline-none text-sm sm:text-base"
                        autoFocus
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          type="submit"
                          className="px-3 sm:px-4 py-2 bg-blue-600 text-white text-sm sm:text-base rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors"
                        >
                          Add List
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingList(false);
                            setNewListTitle("");
                          }}
                          className="px-3 sm:px-4 py-2 text-gray-600 hover:bg-gray-200 active:bg-gray-300 rounded-lg transition-colors text-sm sm:text-base"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default BoardPage;
