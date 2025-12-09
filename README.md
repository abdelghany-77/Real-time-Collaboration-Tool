# Real-Time Collaborative Task Board

A Trello-like task board with real-time collaboration using Socket.io.

## 🚀 Project Structure

```
realtime-taskboard/
├── client/                    # React Frontend (Vite + Tailwind)
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── features/          # Feature-based modules (Redux slices)
│   │   ├── hooks/             # Custom React hooks
│   │   ├── pages/             # Page components
│   │   ├── services/          # API and Socket services
│   │   ├── store/             # Redux store configuration
│   │   └── utils/             # Utility functions
│   └── package.json
│
├── server/                    # Node.js Backend
│   ├── src/
│   │   ├── config/            # Configuration (DB, env)
│   │   ├── controllers/       # Route handlers
│   │   ├── middleware/        # Express middleware
│   │   ├── models/            # Mongoose schemas
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   ├── socket/            # Socket.io handlers
│   │   ├── utils/             # Utility functions
│   │   ├── app.js             # Express app setup
│   │   └── index.js           # Server entry point
│   └── package.json
│
└── README.md
```

## 📊 Database Schema

### Entity Relationship

```
Board (1) ──────< List (N)
                    │
                    │
List (1) ──────< Card (N)
```

### Position Management Strategy

We use **Fractional Indexing** for efficient card/list ordering:

- Each item has a `position` field (floating-point number)
- When inserting between two items: `newPosition = (prevPosition + nextPosition) / 2`
- Only ONE document needs to be updated per move operation
- O(1) database operations for drag & drop

#### Example:

```
Cards: A(1.0), B(2.0), C(3.0)
Move C between A and B:
  newPosition = (1.0 + 2.0) / 2 = 1.5
Result: A(1.0), C(1.5), B(2.0)
```

## 🔌 WebSocket Architecture

### Room-Based Broadcasting

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   User A    │     │   User B    │     │   User C    │
│  (Board 1)  │     │  (Board 1)  │     │  (Board 2)  │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       └───────┬───────────┘                   │
               │                               │
        ┌──────▼──────┐                 ┌──────▼──────┐
        │  Room:      │                 │  Room:      │
        │  board:1    │                 │  board:2    │
        └─────────────┘                 └─────────────┘
```

### Event Flow

```
User Action (Drag Card)
        │
        ▼
┌───────────────────┐
│  REST API Call    │──────► Database Update
│  PATCH /cards/:id │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  Socket Emit      │──────► Broadcast to Room
│  'cardMoved'      │
└───────────────────┘
         │
         ▼
┌───────────────────┐
│  Other Users      │──────► Update UI in Real-time
│  Receive Event    │
└───────────────────┘
```

### Socket Events

| Event           | Direction       | Description                |
| --------------- | --------------- | -------------------------- |
| `joinBoard`     | Client → Server | Join a board room          |
| `leaveBoard`    | Client → Server | Leave a board room         |
| `boardData`     | Server → Client | Initial board data         |
| `cardMoved`     | Bidirectional   | Card drag & drop           |
| `cardCreated`   | Bidirectional   | New card added             |
| `cardUpdated`   | Bidirectional   | Card details changed       |
| `cardDeleted`   | Bidirectional   | Card removed               |
| `listCreated`   | Bidirectional   | New list added             |
| `listUpdated`   | Bidirectional   | List renamed               |
| `listReordered` | Bidirectional   | List position changed      |
| `listDeleted`   | Bidirectional   | List removed               |
| `userJoined`    | Server → Client | User presence notification |
| `userLeft`      | Server → Client | User left notification     |

## 🔗 API Endpoints

### Boards

| Method   | Endpoint                     | Description                  |
| -------- | ---------------------------- | ---------------------------- |
| `GET`    | `/api/v1/boards`             | Get all boards               |
| `POST`   | `/api/v1/boards`             | Create a new board           |
| `GET`    | `/api/v1/boards/:id`         | Get board with lists & cards |
| `PUT`    | `/api/v1/boards/:id`         | Update board                 |
| `PATCH`  | `/api/v1/boards/:id/archive` | Archive board                |
| `DELETE` | `/api/v1/boards/:id`         | Delete board permanently     |

### Lists

| Method   | Endpoint                        | Description               |
| -------- | ------------------------------- | ------------------------- |
| `GET`    | `/api/v1/boards/:boardId/lists` | Get all lists for a board |
| `POST`   | `/api/v1/boards/:boardId/lists` | Create a new list         |
| `GET`    | `/api/v1/lists/:id`             | Get single list           |
| `PUT`    | `/api/v1/lists/:id`             | Update list               |
| `PATCH`  | `/api/v1/lists/:id/reorder`     | Reorder list              |
| `PATCH`  | `/api/v1/lists/:id/archive`     | Archive list              |
| `DELETE` | `/api/v1/lists/:id`             | Delete list               |

### Cards

| Method   | Endpoint                                         | Description                         |
| -------- | ------------------------------------------------ | ----------------------------------- |
| `GET`    | `/api/v1/lists/:listId/cards`                    | Get all cards for a list            |
| `POST`   | `/api/v1/lists/:listId/cards`                    | Create a new card                   |
| `GET`    | `/api/v1/cards/:id`                              | Get single card                     |
| `PUT`    | `/api/v1/cards/:id`                              | Update card                         |
| `PATCH`  | `/api/v1/cards/:id/move`                         | **Move/reorder card (drag & drop)** |
| `PATCH`  | `/api/v1/cards/:id/archive`                      | Archive card                        |
| `DELETE` | `/api/v1/cards/:id`                              | Delete card                         |
| `POST`   | `/api/v1/cards/:id/checklist`                    | Add checklist item                  |
| `PATCH`  | `/api/v1/cards/:cardId/checklist/:itemId/toggle` | Toggle checklist item               |

### Move Card Request Body

```json
{
  "targetListId": "64abc123...",
  "prevCardPosition": 1.5, // null if moving to start
  "nextCardPosition": 2.0 // null if moving to end
}
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone and install dependencies:**

```bash
# Server
cd server
npm install
cp .env.example .env
# Edit .env with your MongoDB URI

# Client
cd ../client
npm install
cp .env.example .env
```

2. **Start MongoDB** (if running locally)

3. **Start the server:**

```bash
cd server
npm run dev
```

4. **Start the client:**

```bash
cd client
npm run dev
```

## 🔧 Card Reordering Algorithm

The reordering logic uses **fractional indexing** to minimize database operations:

```javascript
// Calculate new position for a moved card
function calculatePosition(prevPosition, nextPosition) {
  // Moving to start of list
  if (prevPosition === null) {
    return nextPosition / 2;
  }
  // Moving to end of list
  if (nextPosition === null) {
    return prevPosition + 65535;
  }
  // Moving between two cards
  return (prevPosition + nextPosition) / 2;
}
```

### Why This Works

1. **Single Document Update**: Only the moved card's position changes
2. **No Reindexing**: Other cards keep their positions
3. **Infinite Precision**: JavaScript floats allow many insertions
4. **Rebalancing**: Optional periodic reset to integers (1, 2, 3...)

### Frontend Integration with @hello-pangea/dnd

```javascript
const onDragEnd = async (result) => {
  const { destination, source, draggableId } = result;

  if (!destination) return;

  // Get adjacent card positions
  const destCards = cards.filter((c) => c.list === destination.droppableId);
  const prevCard = destCards[destination.index - 1];
  const nextCard = destCards[destination.index];

  // Call API
  await moveCard(draggableId, {
    targetListId: destination.droppableId,
    prevCardPosition: prevCard?.position ?? null,
    nextCardPosition: nextCard?.position ?? null,
  });

  // Emit socket event
  socket.emit("cardMoved", {
    boardId,
    cardId: draggableId,
    sourceListId: source.droppableId,
    targetListId: destination.droppableId,
    // ... other data
  });
};
```

## 📝 Next Steps (Phase 2)

- [ ] User authentication (JWT)
- [ ] Board member permissions
- [ ] Card comments and activity log
- [ ] File attachments
- [ ] Card due date notifications
- [ ] Board templates
- [ ] Search and filter cards
- [ ] Mobile responsive design

## 📄 License

MIT
