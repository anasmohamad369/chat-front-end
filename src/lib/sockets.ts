import io from "socket.io-client";

const socket = io("http://localhost:3001"); // or your deployed URL
export default socket;
