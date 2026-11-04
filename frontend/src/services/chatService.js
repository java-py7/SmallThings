import api from "./api";

export const getConversations = () => api.get("/chat/conversations");

export const startConversation = (sellerId, itemId) =>
  api.post("/chat/start", {
    sellerId,
    itemId,
  });

export const getMessages = (conversationId) =>
  api.get(`/chat/${conversationId}/messages`);

export const sendMessage = (conversationId, text) =>
  api.post(`/chat/${conversationId}/message`, {
    text,
  });

export default api;
