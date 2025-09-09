import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../../context/authContext';
import { fetchChatHistory, Message } from '../../services/chatService';
import toast from 'react-hot-toast';

interface ChatWindowProps {
  taskId: string;
  recipientName: string;
  onClose: () => void;
}

const ChatWindow = ({ taskId, recipientName, onClose }: ChatWindowProps) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Connect to the socket server
    const newSocket = io("http://localhost:5000", { // Use your server URL
      auth: { token: user?.token }
    });
    setSocket(newSocket);

    // Fetch chat history
    fetchChatHistory(taskId)
      .then(data => {
        setMessages(data.messages);
        setConversationId(data.conversationId);
        newSocket.emit('join_chat_room', taskId);
      })
      .catch(() => toast.error('Could not load chat history.'));

    // Listen for incoming messages
    newSocket.on('message_received', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    // Cleanup on unmount
    return () => {
      newSocket.emit('leave_chat_room', taskId);
      newSocket.disconnect();
    };
  }, [taskId, user?.token]);

  useEffect(() => {
    // Auto-scroll to the bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && socket && conversationId) {
      socket.emit('send_message', {
        conversationId,
        taskId,
        text: newMessage,
      });
      setNewMessage('');
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-white rounded-lg shadow-2xl flex flex-col z-50">
      <header className="bg-indigo-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <h3 className="font-bold">Chat with {recipientName}</h3>
        <button onClick={onClose} className="font-bold text-xl">&times;</button>
      </header>
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
    </div>
  );
};

export default ChatWindow;