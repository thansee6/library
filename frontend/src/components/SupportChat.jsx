import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';

const SupportChat = () => {
  const socket = useSocket();
  const { user } = useAuth();

  const isAdmin = user ? user.role === 'admin' : false;
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);


  const [activeUsers, setActiveUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const messagesEndRef = useRef(null);

  const saveMessagesToLocal = (roomId, newMessages) => {
    localStorage.setItem(`chat_messages_${roomId}`, JSON.stringify(newMessages));
  };

  const loadMessagesFromLocal = (roomId) => {
    const saved = localStorage.getItem(`chat_messages_${roomId}`);
    return saved ? JSON.parse(saved) : [];
  };


  useEffect(() => {
    if (user && !isAdmin) {
      const roomId = `room_${user.id || user._id}`;
      const historical = loadMessagesFromLocal(roomId);
      setMessages(historical);
    }
  }, [user, isAdmin]);

  useEffect(() => {
    if (user && isAdmin) {
      const loadUsersForChat = async () => {
        try {
          const { data } = await API.get('/users');

          const members = data.data.filter(u => u.role !== 'admin');
          setActiveUsers(members.map(u => ({ id: u.id || u._id, username: u.username, hasUnread: false })));
        } catch (err) {
          console.error('Failed to load users for chat:', err);
        }
      };
      loadUsersForChat();
    }
  }, [isAdmin, user]);

  useEffect(() => {
    if (!socket || !user) return;


    if (!isAdmin) {
      socket.emit('join_room', `room_${user.id || user._id}`);
    } else {
      
      socket.emit('join_room', 'admin_support');
    }

    const handleMessage = (msg) => {
      if (isAdmin) {
        if (String(msg.senderId) === String(user.id || user._id)) {
          return;
        }

        const msgRoom = msg.room || `room_${msg.senderId}`;

        setActiveUsers(prev => {
          if (!prev.find(u => String(u.id || u._id) === String(msg.senderId))) {
            return [...prev, { id: msg.senderId, username: msg.senderName, hasUnread: true }];
          }
          return prev;
        });

        const currentMsgs = loadMessagesFromLocal(msgRoom);
        if (!currentMsgs.some(m => m.timestamp === msg.timestamp && m.text === msg.text && String(m.senderId) === String(msg.senderId))) {
          const updated = [...currentMsgs, msg];
          saveMessagesToLocal(msgRoom, updated);

          if (selectedUser && String(selectedUser.id || selectedUser._id) === String(msg.senderId)) {
            setMessages(updated);
          } else {
            
            setActiveUsers(prev => prev.map(u => {
              if (String(u.id || u._id) === String(msg.senderId)) {
                return { ...u, hasUnread: true };
              }
              return u;
            }));
          }
        }
      } else {

        if (String(msg.senderId) === String(user.id || user._id)) {
          return;
        }

        const msgRoom = msg.room || `room_${user.id || user._id}`;
        const currentMsgs = loadMessagesFromLocal(msgRoom);
        if (!currentMsgs.some(m => m.timestamp === msg.timestamp && m.text === msg.text && String(m.senderId) === String(msg.senderId))) {
          const updated = [...currentMsgs, msg];
          saveMessagesToLocal(msgRoom, updated);
          setMessages(updated);
        }
        if (!isOpen) {
          setUnreadCount(c => c + 1);
        }
      }
    };

    socket.on('receive_message', handleMessage);

    return () => {
      socket.off('receive_message');
    };
  }, [socket, user, isAdmin, selectedUser, isOpen]);




  useEffect(() => {
    if (isAdmin && selectedUser && socket) {
      const roomId = `room_${selectedUser.id || selectedUser._id}`;
      socket.emit('join_room', roomId);

      const historical = loadMessagesFromLocal(roomId);
      setMessages(historical);
    }
  }, [selectedUser, isAdmin, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSendMessage = useCallback((e) => {
    e.preventDefault();
    if (!input.trim() || !socket || !user) return;

    const roomId = isAdmin ? `room_${selectedUser?.id || selectedUser?._id}` : `room_${user.id || user._id}`;
    const messageData = {
      room: roomId,
      senderId: user.id || user._id,
      senderName: user.username,
      text: input.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    socket.emit('send_message', messageData);

    const currentMsgs = loadMessagesFromLocal(roomId);
    const updated = [...currentMsgs, messageData];
    saveMessagesToLocal(roomId, updated);
    setMessages(updated);

    setInput('');
  }, [input, socket, user, isAdmin, selectedUser]);

  const toggleChat = useCallback(() => {
    setIsOpen(prev => !prev);
    if (!isOpen) setUnreadCount(0);
  }, [isOpen]);

  if (!user || (user.role !== 'admin' && user.role !== 'member')) return null;

  // Render Admin Chat Panel
  if (isAdmin) {
    const unreadActiveChatsCount = activeUsers.filter(u => u.hasUnread).length;
    return (
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {isOpen ? (
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-[calc(100vw-2rem)] sm:w-[500px] md:w-[600px] h-[60vh] sm:h-[450px] flex overflow-hidden animate-fade-in font-sans">

            {/* Active Users Sidebar */}
            <div className={`${selectedUser ? 'hidden sm:flex' : 'flex'} w-full sm:w-1/3 border-r border-gray-100 bg-gray-50/50 flex-col`}>
              <div className="p-4 border-b border-gray-100 bg-[#1a237e] text-white flex justify-between items-center">
                <h3 className="font-bold text-sm">Active Support Chats</h3>
                <button onClick={toggleChat} className="text-white/80 hover:text-white text-lg cursor-pointer">
                  ✕
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {activeUsers.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-10">No active sessions</p>
                ) : (
                  activeUsers.map(u => (
                    <button
                      key={u.id || u._id}
                      onClick={() => {
                        setSelectedUser(u);
                        setActiveUsers(prev => prev.map(userItem => {
                          if (String(userItem.id || userItem._id) === String(u.id || u._id)) {
                            return { ...userItem, hasUnread: false };
                          }
                          return userItem;
                        }));
                      }}
                      className={`w-full text-left p-3 rounded-xl transition-colors flex items-center justify-between gap-2 ${selectedUser && String(selectedUser.id || selectedUser._id) === String(u.id || u._id)
                        ? 'bg-[#1a237e]/10 text-[#1a237e] font-bold'
                        : 'hover:bg-gray-100 text-gray-600 text-sm'
                        }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-2.5 h-2.5 bg-green-500 rounded-full shrink-0"></span>
                        <span className="truncate">{u.username}</span>
                      </div>
                      {u.hasUnread && (
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Chat Timeline Panel */}
            <div className={`${selectedUser ? 'flex' : 'hidden sm:flex'} w-full sm:w-2/3 flex-col h-full`}>
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white shadow-xs">
                <div className="flex items-center gap-2">
                  {selectedUser && (
                    <button
                      onClick={() => setSelectedUser(null)}
                      className="sm:hidden text-[#1a237e] hover:text-[#0d155e] font-bold text-sm mr-1 cursor-pointer flex items-center gap-0.5"
                    >
                      ← <span className="text-xs font-semibold">Chats</span>
                    </button>
                  )}
                  <h3 className="font-bold text-gray-800 text-xs sm:text-sm truncate max-w-[120px] sm:max-w-[200px]">
                    {selectedUser ? `Chatting with ${selectedUser.username}` : 'Select a user to chat'}
                  </h3>
                </div>
                <button onClick={toggleChat} className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer">
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
                    const isSelf = String(msg.senderId) === String(user.id || user._id);
                    return (
                      <div key={idx} className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs ${isSelf
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
                  id="admin-chat-input"
                  name="message"
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
            {unreadActiveChatsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center text-white border border-white">
                {unreadActiveChatsCount}
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
                const isSelf = String(msg.senderId) === String(user.id || user._id);
                return (
                  <div key={idx} className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[80%] px-3.5 py-2 rounded-2xl text-xs ${isSelf
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
              id="user-chat-input"
              name="message"
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
