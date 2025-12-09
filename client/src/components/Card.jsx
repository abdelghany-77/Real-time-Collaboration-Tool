import { useState } from "react";
import { useDispatch } from "react-redux";
import { Draggable } from "@hello-pangea/dnd";
import { updateCard, deleteCard } from "../store/slices/boardSlice";
import { useSocket } from "../contexts/SocketContext";
import CardModal from "./CardModal";
import { ChatBubbleLeftIcon, PaperClipIcon } from "@heroicons/react/24/outline";

const Card = ({ card, index, listId, boardId }) => {
  const dispatch = useDispatch();
  const { emitCardUpdated, emitCardDeleted } = useSocket();
  const [showModal, setShowModal] = useState(false);

  const handleUpdateCard = async (updates) => {
    await dispatch(updateCard({ cardId: card._id, updates }));
    emitCardUpdated({ boardId, listId, cardId: card._id, updates });
  };

  const handleDeleteCard = async () => {
    await dispatch(deleteCard({ cardId: card._id, listId }));
    emitCardDeleted({ boardId, listId, cardId: card._id });
    setShowModal(false);
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-300";
    }
  };

  // Check if card has description or other content
  const hasDescription = card.description && card.description.trim().length > 0;

  return (
    <>
      <Draggable draggableId={card._id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onClick={() => setShowModal(true)}
            className={`group bg-white rounded-lg shadow-sm mb-2 cursor-pointer touch-manipulation active:scale-[0.98] hover:ring-2 hover:ring-blue-400 transition-all ${
              snapshot.isDragging
                ? "shadow-lg rotate-3 ring-2 ring-blue-500"
                : ""
            }`}
          >
            {/* Cover Image */}
            {card.cover && (
              <div
                className="h-6 sm:h-8 rounded-t-lg"
                style={{ backgroundColor: card.cover }}
              />
            )}

            <div className="p-2 sm:p-3">
              {/* Labels */}
              {card.labels && card.labels.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {card.labels.map((label, i) => (
                    <span
                      key={i}
                      className="h-2 w-10 rounded-full"
                      style={{ backgroundColor: label.color || "#94a3b8" }}
                      title={label.text}
                    />
                  ))}
                </div>
              )}

              {/* Title */}
              <p className="text-xs sm:text-sm text-gray-800 break-words line-clamp-3">
                {card.title}
              </p>

              {/* Card Badges */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2">
                {/* Priority Badge */}
                {card.priority && card.priority !== "none" && (
                  <div
                    className={`w-2 h-2 rounded-full ${getPriorityColor(
                      card.priority
                    )}`}
                    title={`Priority: ${card.priority}`}
                  />
                )}

                {/* Due Date */}
                {card.dueDate && (
                  <span
                    className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded whitespace-nowrap ${
                      new Date(card.dueDate) < new Date()
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {new Date(card.dueDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                )}

                {/* Description indicator */}
                {hasDescription && (
                  <ChatBubbleLeftIcon
                    className="w-4 h-4 text-gray-400"
                    title="Has description"
                  />
                )}

                {/* Attachments indicator */}
                {card.attachments && card.attachments.length > 0 && (
                  <div className="flex items-center gap-1 text-gray-400">
                    <PaperClipIcon className="w-4 h-4" />
                    <span className="text-xs">{card.attachments.length}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Draggable>

      {/* Card Modal */}
      {showModal && (
        <CardModal
          card={card}
          listId={listId}
          onClose={() => setShowModal(false)}
          onUpdate={handleUpdateCard}
          onDelete={handleDeleteCard}
        />
      )}
    </>
  );
};

export default Card;
