import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import moment from 'moment';
import { motion } from 'framer-motion';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import './App.css';
import './styles/animations.css';

const socket = io(import.meta.env.VITE_SERVER_URL);

const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase();
};

function App() {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isJoined, setIsJoined] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    socket.on('message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    socket.on('userJoined', (data) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { system: true, text: data.message, timestamp: new Date().toISOString() }
      ]);
    });

    socket.on('userLeft', (data) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { system: true, text: data.message, timestamp: new Date().toISOString() }
      ]);
    });

    return () => {
      socket.off('message');
      socket.off('userJoined');
      socket.off('userLeft');
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleJoin = (e) => {
    e.preventDefault();
    if (username.trim()) {
      socket.emit('join', username);
      setIsJoined(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      socket.emit('message', message);
      setMessage('');
    }
  };

  if (!isJoined) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full p-8"
        >
          <h1 className="text-2xl font-semibold text-gray-900 text-center mb-6">
            Join Chat
          </h1>
          
          <form onSubmit={handleJoin} className="space-y-4">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="message-input"
              placeholder="Enter your username"
              required
            />
            
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Join Chat
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <header className="header">
        <div className="chat-header">
          <div className="user-avatar">
            {getInitials(username)}
          </div>
          <div>
            <h1>{username}</h1>
            <div className="flex items-center">
              <div className="online-status"></div>
              <span className="text-sm text-gray-500 ml-2">Online</span>
            </div>
          </div>
        </div>
      </header>

      <div className="messages-container">
        {messages.map((msg, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {msg.system ? (
              <div className="system-message">
                {msg.text}
              </div>
            ) : (
              <div className="message-group">
                {msg.username !== username && (
                  <div className="username">
                    {msg.username}
                  </div>
                )}
                <div className={`text-left message-bubble ${msg.username === username ? 'sent' : 'received'}`}>
                  {msg.text}
                </div>
                <div className={`timestamp ${msg.username === username ? 'text-right' : ''}`}>
                  {moment(msg.timestamp).format('HH:mm')}
                </div>
              </div>
            )}
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="message-input-container">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="message-input"
            placeholder="Type a message..."
          />
          <button
            type="submit"
            className="send-button"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
