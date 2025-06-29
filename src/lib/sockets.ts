import io from "socket.io-client";

// const socket = io("http://localhost:3001");
const socket = io("https://chat-backend-test-production.up.railway.app/", {
    transports: ["websocket"],
  });
  
export default socket;
