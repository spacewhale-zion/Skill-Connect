import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../../context/authContext';
import { useNotifications } from '../../context/notificationContext';
import { fetchChatHistory, Message, markMessageAsRead } from '../../services/chatService'; // <- add markMessageAsRead
import toast from 'react-hot-toast';
import type { AuthUser } from '../../types';

interface ChatWindowProps {
  taskId: string;
  recipient: AuthUser;
  onClose: () => void;
}

const ChatWindow = ({ taskId, recipient, onClose }: ChatWindowProps) => {
  const { user } = useAuth();
  const { incrementUnreadCount, setNotifications, decrementUnreadCount } = useNotifications();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history & initialize socket
  useEffect(() => {
    const newSocket = io("http://localhost:5000", {
      auth: { token: user?.token }
    });
    setSocket(newSocket);

    fetchChatHistory(taskId)
      .then(data => {
        setMessages(data.messages);
        setConversationId(data.conversationId);
        newSocket.emit('join_chat_room', taskId);

        // Mark all messages as read if chat is open
        data.messages
          .filter(msg => !msg.isRead && msg.sender._id !== user?._id)
          .forEach(msg => {
            markMessageAsRead(msg._id).catch(console.error);
            decrementUnreadCount();
          });
      })
      .catch(() => toast.error('Could not load chat history.'));

    // Listen for incoming messages
    newSocket.on('message_received', (message: Message) => {
      setMessages(prev => [...prev, message]);

      if (!isMinimized) {
        // Chat is open → mark as read automatically
        markMessageAsRead(message._id).catch(console.error);
      } else {
        // Chat minimized → treat as notification
        const notification = {
          _id: message._id,
          title: 'New Chat Message',
          message: message.text,
          link: `/chat/${conversationId}`,
          isRead: false,
          createdAt: new Date().toISOString()
        };
        setNotifications(prev => [notification, ...prev]);
        incrementUnreadCount();
        toast.success('New chat message');
      }
    });

    return () => {
      newSocket.emit('leave_chat_room', taskId);
      newSocket.disconnect();
    };
  }, [taskId, user?.token, conversationId, isMinimized, incrementUnreadCount, setNotifications, decrementUnreadCount]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (!isMinimized) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isMinimized]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && socket && conversationId) {
      socket.emit('send_message', {
        conversationId,
        taskId,
        text: newMessage,
        recipientId: recipient._id,
      });
      setNewMessage('');
    }
  };

  return (
    <div className={`fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-2xl flex flex-col z-50 transition-all duration-300 ${isMinimized ? 'h-14' : 'h-[500px]'}`}>
      <header className="bg-indigo-600 text-white p-4 rounded-t-lg flex justify-between items-center cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
        <h3 className="font-bold">{recipient.name}</h3>
        <div className="flex items-center space-x-3">
          <button onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }} className="hover:bg-indigo-700 p-1 rounded-full focus:outline-none">
            {isMinimized ? <span>▲</span> : <span>▼</span>}
          </button>
          <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="hover:bg-indigo-700 p-1 rounded-full focus:outline-none">✖</button>
        </div>
      </header>
      {!isMinimized && (
        <>
          <div className="flex-grow p-4 overflow-y-auto bg-gray-50">
            {messages.map(msg => (
              <div key={msg._id} className={`flex mb-4 ${msg.sender._id === user?._id ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-lg max-w-xs ${msg.sender._id === user?._id ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSendMessage} className="p-4 border-t flex">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-grow p-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button type="submit" className="bg-indigo-600 text-white px-4 rounded-r-md hover:bg-indigo-700">Send</button>
          </form>
        </>
      )}
    </div>
  );
};

export default ChatWindow;
