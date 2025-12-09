import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor (for auth token when implemented)
api.interceptors.request.use(
  (config) => {
    // Add auth token here when implemented
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Board endpoints
export const getBoards = () => api.get("/boards");
export const getBoard = (boardId) => api.get(`/boards/${boardId}`);
export const createBoard = (data) => api.post("/boards", data);
export const updateBoard = (boardId, data) =>
  api.put(`/boards/${boardId}`, data);
export const deleteBoard = (boardId) => api.delete(`/boards/${boardId}`);

// List endpoints
export const getLists = (boardId) => api.get(`/boards/${boardId}/lists`);
export const createList = (boardId, data) =>
  api.post(`/boards/${boardId}/lists`, data);
export const updateList = (listId, data) => api.put(`/lists/${listId}`, data);
export const reorderList = (listId, data) =>
  api.patch(`/lists/${listId}/reorder`, data);
export const deleteList = (listId) => api.delete(`/lists/${listId}`);

// Card endpoints
export const getCards = (listId) => api.get(`/lists/${listId}/cards`);
export const createCard = (listId, data) =>
  api.post(`/lists/${listId}/cards`, data);
export const getCard = (cardId) => api.get(`/cards/${cardId}`);
export const updateCard = (cardId, data) => api.put(`/cards/${cardId}`, data);
export const moveCard = (cardId, data) =>
  api.patch(`/cards/${cardId}/move`, data);
export const deleteCard = (cardId) => api.delete(`/cards/${cardId}`);

export default api;
