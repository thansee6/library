import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const SupportChat = () => {
  const socket = useSocket();
  const { user } = useAuth();
  
  if (!user) return null;

  const isAdmin = user.role === 'admin';
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  // Admin-specific state
  const [activeUsers, setActiveUsers] = useState([]); // List of users who have chatted
  const [selectedUser, setSelectedUser] = useState(null); // { id, username }
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    // Standard User joins their own private room
    if (!isAdmin) {
      socket.emit('join_room', `room_${user.id}`);
    } else {
      // Admin joins general admin support room to listen for initial joins
      socket.emit('join_room', 'admin_support');
    }

    const handleMessage = (msg) => {
      // For Admin
      if (isAdmin) {
        if (msg.senderId !== user.id) {
          // If the sender is not in the list of active users, add them
          setActiveUsers(prev => {
            if (!prev.find(u => u.id === msg.senderId)) {
              return [...prev, { id: msg.senderId, username: msg.senderName }];
            }
            return prev;
          });
        }

        // Add message to timeline if it's from the currently selected user or from admin themselves
        if (selectedUser?.id === msg.senderId || msg.senderId === user.id) {
          setMessages(prev => [...prev, msg]);
        }
      } else {
        // For standard user
        setMessages(prev => [...prev, msg]);
        if (!isOpen) {
          setUnreadCount(c => c + 1);
        }
      }
    };

    socket.on('receive_message', handleMessage);

    return () => {
      socket.off('receive_message');
    };
  }, [socket, user, isAdmin, selectedUser]);

  // When admin selects a different user, fetch or join that room
  useEffect(() => {
    if (isAdmin && selectedUser && socket) {
      socket.emit('join_room', `room_${selectedUser.id}`);
      setMessages([]); // Clear timeline for new chat session
    }
  }, [selectedUser, isAdmin, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!input.trim() || !socket) return;

    const roomId = isAdmin ? `room_${selectedUser?.id}` : `room_${user.id}`;
    const messageData = {
      room: roomId,
      senderId: user.id,
      senderName: user.username,
      text: input.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    socket.emit('send_message', messageData);
    
    // For admin, add message locally to own view immediately if selected
    if (isAdmin) {
      setMessages(prev => [...prev, messageData]);
    }

    setInput('');
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) setUnreadCount(0);
  };

  // Render Admin Chat Panel
  if (isAdmin) {
    return (
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {isOpen ? (
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-[600px] h-[450px] flex overflow-hidden animate-fade-in font-sans">
            
            {/* Active Users Sidebar */}
            <div className="w-1/3 border-r border-gray-100 bg-gray-50/50 flex flex-col">
              <div className="p-4 border-b border-gray-100 bg-[#1a237e] text-white">
                <h3 className="font-bold text-sm">Active Support Chats</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {activeUsers.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-10">No active sessions</p>
                ) : (
                  activeUsers.map(u => (
                    <button
                      key={u.id}
                      onClick={() => setSelectedUser(u)}
                      className={`w-full text-left p-3 rounded-xl transition-colors flex items-center gap-2 ${
                        selectedUser?.id === u.id 
                          ? 'bg-[#1a237e]/10 text-[#1a237e] font-bold' 
                          : 'hover:bg-gray-100 text-gray-600 text-sm'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
                      <span className="truncate">{u.username}</span>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Chat Timeline Panel */}
            <div className="w-2/3 flex flex-col h-full">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white shadow-xs">
                <div>
                  <h3 className="font-bold text-gray-800 text-sm">
                    {selectedUser ? `Chatting with ${selectedUser.username}` : 'Select a user to chat'}
                  </h3>
                </div>
                <button onClick={toggleChat} className="text-gray-400 hover:text-gray-600 text-lg">
                  ✕
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/30">
                {!selectedUser ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-2 text-gray-400">
                    <span className="text-4xl">💬</span>
                    <p className="text-xs font-medium">Select a user from the sidebar to begin support.</p>
                  </div>
                ) : messages.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-10">No messages yet. Send a greeting!</p>
                ) : (
                  messages.map((msg, idx) => {
                    const isSelf = msg.senderId === user.id;
                    return (
                      <div key={idx} className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs ${
                          isSelf 
                            ? 'bg-[#1a237e] text-white rounded-br-none' 
                            : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none shadow-xs'
                        }`}>
                          <p className="leading-relaxed">{msg.text}</p>
                        </div>
                        <span className="text-[9px] text-gray-400 mt-1 px-1">{msg.timestamp}</span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-100 flex gap-2 bg-white">
                <input
                  type="text"
                  disabled={!selectedUser}
                  placeholder={selectedUser ? "Type your response..." : "Select a user first"}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1a237e]/30 bg-gray-50/50 disabled:bg-gray-100"
                />
                <button
                  type="submit"
                  disabled={!selectedUser}
                  className="bg-[#1a237e] hover:bg-[#0d155e] text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Send
                </button>
              </form>
            </div>

          </div>
        ) : (
          <button
            onClick={toggleChat}
            className="bg-[#1a237e] hover:bg-[#0d155e] text-white p-4 rounded-full shadow-2xl flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95 cursor-pointer relative"
          >
            <span className="text-xl">💬</span>
            <span className="text-sm font-bold pr-1">Librarian Support</span>
            {activeUsers.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center text-white border border-white">
                {activeUsers.length}
              </span>
            )}
          </button>
        )}
      </div>
    );
  }

  // Render Standard User Chat Widget
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen ? (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-80 h-96 flex flex-col overflow-hidden animate-fade-in font-sans">
          
          {/* Header */}
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-[#1a237e] text-white">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></span>
              <h3 className="font-bold text-sm">Librarian Live Support</h3>
            </div>
            <button onClick={toggleChat} className="text-white/80 hover:text-white text-lg">
              ✕
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-2 text-gray-400">
                <span className="text-3xl">👋</span>
                <p className="text-xs font-bold">Hello, {user.username}!</p>
                <p className="text-[10px] max-w-[180px]">Need help borrowing books or returning? Chat with our librarian right now.</p>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isSelf = msg.senderId === user.id;
                return (
                  <div key={idx} className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[80%] px-3.5 py-2 rounded-2xl text-xs ${
                      isSelf 
                        ? 'bg-[#1a237e] text-white rounded-br-none' 
                        : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none shadow-xs'
                    }`}>
                      <p className="leading-relaxed">{msg.text}</p>
                    </div>
                    <span className="text-[8px] text-gray-400 mt-1 px-1">{msg.timestamp}</span>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-100 flex gap-2 bg-white">
            <input
              type="text"
              placeholder="Ask a question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1a237e]/30 bg-gray-50/50"
            />
            <button
              type="submit"
              className="bg-[#1a237e] hover:bg-[#0d155e] text-white px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Send
            </button>
          </form>

        </div>
      ) : (
        <button
          onClick={toggleChat}
          className="bg-[#1a237e] hover:bg-[#0d155e] text-white p-4 rounded-full shadow-2xl flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95 cursor-pointer relative"
        >
          <span className="text-xl">💬</span>
          <span className="text-sm font-bold pr-1">Chat Support</span>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center text-white border border-white">
              {unreadCount}
            </span>
          )}
        </button>
      )}
    </div>
  );
};

export default SupportChat;
