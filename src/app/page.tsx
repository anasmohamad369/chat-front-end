'use client'
// pages/index.js
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io("https://chat-backend-test-wbsa.onrender.com");

export default function Home() {
  const [username, setUsername] = useState('');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    socket.on('chat message', (msg: string) => {
      setMessages((prev: string[]) => [...prev, msg]);
    });

    return () => {
      socket.off('chat message');
    };
  }, []);

  const sendMessage = () => {
    if (username && input) {
      const msg = `${username}: ${input}`;
      socket.emit('chat message', msg);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold mb-4">Real-time Chat</h1>

      <input
        placeholder="Enter your name"
        className="border p-2 mb-2 w-64"
        value={username}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
      />
      <div className="flex space-x-2">
        <input
          placeholder="Type a message"
          className="border p-2 w-64"
          value={input}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && sendMessage()}
        />
        <button className="bg-blue-500 text-white px-4 rounded" onClick={sendMessage}>
          Send
        </button>
      </div>

      <ul className="mt-4 w-full max-w-lg">
        {messages.map((msg, idx) => (
          <li key={idx} className="bg-gray-100 my-1 text-black p-2 rounded">
            {msg}
          </li>
        ))}
      </ul>
    </div>
  );
}
