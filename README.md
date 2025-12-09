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


<img width="1910" height="932" alt="realtimeagile3" src="https://github.com/user-attachments/assets/52a9f229-8f26-4a0b-a7c9-b5a270ce9317" />
<img width="1910" height="932" alt="realtimeagile2" src="https://github.com/user-attachments/assets/c565bc3a-76a3-4b13-b963-d17b200afa0f" />
<img width="1910" height="932" alt="realtimeagile1" src="https://github.com/user-attachments/assets/417e1f41-772f-4bac-a2ba-9e9b864eee79" />
