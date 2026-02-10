import { io } from 'socket.io-client';
const url = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
const socket = io(url);
export default socket;