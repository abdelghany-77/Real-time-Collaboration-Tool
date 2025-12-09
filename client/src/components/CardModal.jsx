import { useState, useEffect, useRef } from "react";
import {
  XMarkIcon,
  TrashIcon,
  CalendarIcon,
  TagIcon,
  Bars3BottomLeftIcon,
} from "@heroicons/react/24/outline";

const CardModal = ({ card, listId, onClose, onUpdate, onDelete }) => {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || "");
  const [dueDate, setDueDate] = useState(
    card.dueDate ? new Date(card.dueDate).toISOString().split("T")[0] : ""
  );
  const [priority, setPriority] = useState(card.priority || "none");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);

  const modalRef = useRef(null);
  const titleInputRef = useRef(null);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // Close on click outside
  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  const handleTitleBlur = () => {
    if (title.trim() && title !== card.title) {
      onUpdate({ title: title.trim() });
    } else {
      setTitle(card.title);
    }
    setIsEditingTitle(false);
  };

  const handleDescriptionBlur = () => {
    if (description !== (card.description || "")) {
      onUpdate({ description });
    }
    setIsEditingDescription(false);
  };

  const handleDueDateChange = (e) => {
    const newDate = e.target.value;
    setDueDate(newDate);
    onUpdate({ dueDate: newDate || null });
  };

  const handlePriorityChange = (e) => {
    const newPriority = e.target.value;
    setPriority(newPriority);
    onUpdate({ priority: newPriority });
  };

  const priorities = [
    { value: "none", label: "None", color: "bg-gray-200" },
    { value: "low", label: "Low", color: "bg-green-500" },
    { value: "medium", label: "Medium", color: "bg-yellow-500" },
    { value: "high", label: "High", color: "bg-red-500" },
  ];

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-end sm:items-start justify-center sm:pt-16 z-50 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-t-2xl sm:rounded-xl w-full sm:max-w-2xl sm:mb-8 shadow-2xl max-h-[90vh] sm:max-h-none overflow-y-auto animate-slide-up sm:animate-none"
      >
        {/* Mobile drag handle indicator */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>
        {/* Header */}
        <div className="p-3 sm:p-4 flex items-start gap-2 sm:gap-3">
          <div className="flex-1 min-w-0">
            {isEditingTitle ? (
              <input
                ref={titleInputRef}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleTitleBlur();
                  if (e.key === "Escape") {
                    setTitle(card.title);
                    setIsEditingTitle(false);
                  }
                }}
                className="w-full text-base sm:text-xl font-semibold px-2 py-1 border-2 border-blue-500 rounded focus:outline-none"
                autoFocus
              />
            ) : (
              <h2
                onClick={() => setIsEditingTitle(true)}
                className="text-base sm:text-xl font-semibold text-gray-800 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded -ml-2 break-words"
              >
                {card.title}
              </h2>
            )}
            <p className="text-xs sm:text-sm text-gray-500 mt-1 ml-2">
              in list{" "}
              <span className="underline">{card.listTitle || "List"}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation flex-shrink-0"
          >
            <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 p-3 sm:p-4 pt-2 sm:pt-0">
          {/* Main Content */}
          <div className="flex-1 space-y-4 sm:space-y-6 order-2 sm:order-1">
            {/* Description */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Bars3BottomLeftIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                <h3 className="text-sm sm:text-base font-semibold text-gray-800">
                  Description
                </h3>
              </div>
              {isEditingDescription ? (
                <div>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add a more detailed description..."
                    className="w-full px-3 py-2 border-2 border-blue-500 rounded-lg focus:outline-none resize-none text-sm sm:text-base"
                    rows={4}
                    autoFocus
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handleDescriptionBlur}
                      className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors touch-manipulation text-sm sm:text-base"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setDescription(card.description || "");
                        setIsEditingDescription(false);
                      }}
                      className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation text-sm sm:text-base"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setIsEditingDescription(true)}
                  className={`ml-0 sm:ml-7 px-3 py-2.5 sm:py-2 rounded-lg cursor-pointer transition-colors text-sm sm:text-base ${
                    description
                      ? "text-gray-700 hover:bg-gray-100"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {description || "Add a more detailed description..."}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full sm:w-48 space-y-3 order-1 sm:order-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Add to card
            </p>

            {/* Mobile: Horizontal layout for date and priority */}
            <div className="flex flex-row sm:flex-col gap-3">
              {/* Due Date */}
              <div className="flex-1 sm:flex-none">
                <label className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mb-1">
                  <CalendarIcon className="w-4 h-4" />
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={handleDueDateChange}
                  className="w-full px-3 py-2.5 sm:py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation"
                />
              </div>

              {/* Priority */}
              <div className="flex-1 sm:flex-none">
                <label className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mb-1">
                  <TagIcon className="w-4 h-4" />
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={handlePriorityChange}
                  className="w-full px-3 py-2.5 sm:py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation"
                >
                  {priorities.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 sm:pt-4 border-t">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 sm:mb-3">
                Actions
              </p>
              <button
                onClick={() => {
                  if (
                    window.confirm("Are you sure you want to delete this card?")
                  ) {
                    onDelete();
                  }
                }}
                className="w-full flex items-center justify-center sm:justify-start gap-2 px-3 py-2.5 sm:py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors touch-manipulation"
              >
                <TrashIcon className="w-4 h-4" />
                Delete Card
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardModal;
