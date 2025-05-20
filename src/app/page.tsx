'use client';
import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

// Setup socket only once
const socket = io("https://chat-backend-test-wbsa.onrender.com");

interface Message {
  username: string;
  text: string;
}

export default function Home() {
  const [username, setUsername] = useState('');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  // Load past messages and listen to new ones
  useEffect(() => {
    // 1. Load past messages
    axios.get('https://chat-backend-test-wbsa.onrender.com/messages')
      .then((res) => {
        setMessages(res.data);
      })
      .catch((err) => console.error('Error fetching messages:', err));

    // 2. Listen for new messages
    socket.on('chat message', (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off('chat message');
    };
  }, []);

  const sendMessage = () => {
    if (username && input) {
      const msg = { username, text: input };
      socket.emit('chat message', msg);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col items-center p-6 min-h-screen bg-black">
      <h1 className="text-2xl font-bold mb-4">Real-time Chat</h1>

      <input
        placeholder="Enter your name"
        className="border p-2 mb-2 w-64"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <div className="flex space-x-2">
        <input
          placeholder="Type a message"
          className="border p-2 w-64"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button className="bg-blue-500 text-white px-4 rounded" onClick={sendMessage}>
          Send
        </button>
      </div>

      <ul className="mt-4 w-full max-w-lg">
        {messages.map((msg, idx) => (
          <li key={idx} className="bg-white my-1 text-black p-2 rounded shadow">
            <strong>{msg.username}</strong>: {msg.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
