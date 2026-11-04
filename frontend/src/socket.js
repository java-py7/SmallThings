import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

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
