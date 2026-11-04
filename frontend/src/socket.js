import { io } from "socket.io-client";
import { SERVER_BASE_URL } from "./services/api";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || SERVER_BASE_URL;

const socket = io(SOCKET_URL, {
  autoConnect: false,
  auth: {
    token: localStorage.getItem("token"),
  },
});

export const connectSocket = () => {
  const token = localStorage.getItem("token");
  if (!token) return socket;
  socket.auth = { token };
  if (!socket.connected) {
    socket.connect();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

export default socket;
