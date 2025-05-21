'use client';
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

// Setup socket only once
const socket = io("https://chat-backend-test-wbsa.onrender.com");

interface Message {
  username: string;
  text: string;
  image?: string;
  timestamp?: string;
}


export default function Home() {
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [joined, setJoined] = useState(false);
  const [image, setImage] = useState<string | null>(null);

  console.log(messages);
  console.log(image);
  useEffect(() => {
    if (joined) {
      socket.on('chat message', (msg: Message) => {
        setMessages((prev) => [...prev, msg]);
      });

      return () => {
        socket.off('chat message');
      };
    }
  }, [joined]);

  const joinRoom = async () => {
    const finalRoom = roomCode.trim() || 'global';
    socket.emit('join room', finalRoom);
  
    try {
      const res = await fetch(`http://localhost:3001/messages?room=${finalRoom}`);
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error("Failed to fetch chat history", err);
    }
  
    setJoined(true);
  };
  

  const sendMessage = () => {
    if (input || image) {
      const message = {
        username,
        text: input,
        image: image || null,
        roomCode: roomCode.trim() || null
      };
      socket.emit('chat message', message);
      setInput('');
      setImage(null);
    }
  };


  return (
    <div className="flex flex-col items-center p-6 min-h-screen bg-blue-500/40">
      {!joined ? (
        <>
          <h1 className="text-2xl font-bold mb-4">Join a Chat</h1>

          <input
            placeholder="Your name"
            className="border p-2 mb-2 w-64"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            placeholder="Room Code (leave empty for Global Chat)"
            className="border p-2 mb-4 w-64"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
          />

          <button
            className="bg-green-500 text-white px-4 py-2 rounded"
            onClick={joinRoom}
          >
            {roomCode ? 'Join Private Room' : 'Join Global Chat'}
          </button>
        </>
      ) : (
        <>
          <h1 className="text-xl font-bold mb-2">
            Room: {roomCode.trim() || 'Global Chat'}
          </h1>

          <div className="flex space-x-2">
            <input
              placeholder="Type a message"
              className="border p-2 w-64"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setImage(reader.result as string);
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="border p-2"
            />

            <button
              className="bg-blue-500 text-white px-4 rounded"
              onClick={sendMessage}
            >
              Send
            </button>
          </div>

          <ul className="mt-4 w-full max-w-lg">
            {messages.map((msg, idx) => (
             <li key={idx} className="bg-white my-1 text-black p-2 rounded shadow">
             <strong>{msg.username}</strong>: {msg.text}
             {msg.image && (
               <img src={msg.image} alt="chat-img" className="mt-2 max-w-xs rounded" />
             )}
             {msg.timestamp && (
               <div className="text-xs text-gray-500 mt-1">
                 {new Date(msg.timestamp).toLocaleTimeString()}
               </div>
             )}
           </li>
           
            ))}
          </ul>

        </>
      )}
    </div>
  );
}
