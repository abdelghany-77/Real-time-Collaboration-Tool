import { useState } from "react";
import { useDispatch } from "react-redux";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import { updateList, deleteList, createCard } from "../store/slices/boardSlice";
import { useSocket } from "../contexts/SocketContext";
import Card from "./Card";
import {
  EllipsisHorizontalIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const List = ({ list, index, boardId }) => {
  const dispatch = useDispatch();
  const { emitListUpdated, emitListDeleted, emitCardCreated } = useSocket();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(list.title);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [showMenu, setShowMenu] = useState(false);

  const handleUpdateTitle = async () => {
    if (title.trim() && title !== list.title) {
      await dispatch(updateList({ listId: list._id, title: title.trim() }));
      emitListUpdated({
        boardId,
        listId: list._id,
        updates: { title: title.trim() },
      });
    } else {
      setTitle(list.title);
    }
    setIsEditingTitle(false);
  };

  const handleDeleteList = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this list? All cards will be deleted."
      )
    ) {
      await dispatch(deleteList(list._id));
      emitListDeleted({ boardId, listId: list._id });
    }
    setShowMenu(false);
  };

  const handleAddCard = async (e) => {
    e.preventDefault();
    if (!newCardTitle.trim()) return;

    const result = await dispatch(
      createCard({
        listId: list._id,
        title: newCardTitle.trim(),
        boardId,
      })
    );

    if (result.payload?.card) {
      emitCardCreated({
        boardId,
        listId: list._id,
        card: result.payload.card,
      });
    }

    setNewCardTitle("");
    setIsAddingCard(false);
  };

  return (
    <Draggable draggableId={list._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`flex-shrink-0 w-64 sm:w-72 bg-list-bg rounded-xl flex flex-col max-h-[calc(100vh-110px)] sm:max-h-[calc(100vh-140px)] ${
            snapshot.isDragging ? "shadow-xl rotate-3" : ""
          }`}
        >
          {/* List Header */}
          <div
            {...provided.dragHandleProps}
            className="p-2 sm:p-3 font-semibold text-gray-800 flex items-center justify-between text-sm sm:text-base"
          >
            {isEditingTitle ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleUpdateTitle}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleUpdateTitle();
                  if (e.key === "Escape") {
                    setTitle(list.title);
                    setIsEditingTitle(false);
                  }
                }}
                className="flex-1 px-2 py-1 rounded border-2 border-blue-500 focus:outline-none text-sm sm:text-base"
                autoFocus
              />
            ) : (
              <span
                onClick={() => setIsEditingTitle(true)}
                className="flex-1 cursor-pointer px-2 py-1 hover:bg-gray-200 active:bg-gray-300 rounded truncate"
              >
                {list.title}
              </span>
            )}

            {/* Menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 sm:p-1 hover:bg-gray-200 active:bg-gray-300 rounded transition-colors"
              >
                <EllipsisHorizontalIcon className="w-5 h-5 text-gray-600" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg py-2 w-40 sm:w-48 z-20">
                    <button
                      onClick={handleDeleteList}
                      className="w-full text-left px-4 py-2.5 sm:py-2 text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors text-sm sm:text-base"
                    >
                      Delete List
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Cards */}
          <Droppable droppableId={list._id} type="CARD">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`flex-1 px-2 pb-2 overflow-y-auto custom-scrollbar min-h-[2px] ${
                  snapshot.isDraggingOver ? "bg-gray-200" : ""
                }`}
              >
                {list.cards?.map((card, cardIndex) => (
                  <Card
                    key={card._id}
                    card={card}
                    index={cardIndex}
                    listId={list._id}
                    boardId={boardId}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {/* Add Card */}
          <div className="p-2">
            {isAddingCard ? (
              <form onSubmit={handleAddCard}>
                <textarea
                  placeholder="Enter a title for this card..."
                  value={newCardTitle}
                  onChange={(e) => setNewCardTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleAddCard(e);
                    }
                    if (e.key === "Escape") {
                      setIsAddingCard(false);
                      setNewCardTitle("");
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg border-2 border-blue-500 focus:outline-none resize-none text-sm sm:text-base"
                  rows={2}
                  autoFocus
                />
                <div className="flex gap-2 mt-2">
                  <button
                    type="submit"
                    className="px-3 sm:px-4 py-2 bg-blue-600 text-white text-sm sm:text-base rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors"
                  >
                    Add Card
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingCard(false);
                      setNewCardTitle("");
                    }}
                    className="p-2 hover:bg-gray-200 active:bg-gray-300 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setIsAddingCard(true)}
                className="w-full flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-200 active:bg-gray-300 rounded-lg transition-colors text-sm sm:text-base"
              >
                <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                Add a card
              </button>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default List;
