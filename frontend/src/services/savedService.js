import api from "./api";

export const getSavedProducts = () => api.get("/saved");

export const saveProduct = (productId) => api.post(`/saved/${productId}`);

export const unsaveProduct = (productId) => api.delete(`/saved/${productId}`);

export const checkSaved = (productId) => api.get(`/saved/check/${productId}`);

export default api;
