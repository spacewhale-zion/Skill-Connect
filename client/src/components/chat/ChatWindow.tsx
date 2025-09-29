// spacewhale-zion/skill-connect/Skill-Connect-e87cf6223cbd3887670780f5036f493f8ada8812/client/src/components/chat/ChatWindow.tsx
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/authContext";
import { useNotifications } from "../../context/notificationContext";
import { fetchChatHistory, Message, markMessageAsRead } from "../../services/chatService";
import toast from "react-hot-toast";
import type { AuthUser } from "../../types";
import { Send, ChevronDown, X } from 'lucide-react';

interface ChatWindowProps {
  taskId: string;
  recipient: AuthUser;
  onClose: () => void;
}

const ChatWindow = ({ taskId, recipient, onClose }: ChatWindowProps) => {
  const { user } = useAuth();
  const { socket, incrementUnreadCount, setNotifications, decrementUnreadCount } = useNotifications();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || !socket) return;

    fetchChatHistory(taskId)
      .then((data) => {
        setMessages(data.messages);
        setConversationId(data.conversationId);
        socket.emit("join_chat_room", taskId);
        data.messages
          .filter((msg) => msg.sender._id !== user._id && !msg.isRead)
          .forEach((msg) => {
            markMessageAsRead(msg._id).catch(console.error);
            decrementUnreadCount();
          });
      })
      .catch(() => toast.error("Could not load chat history."));

    const handleMessageReceived = (message: Message) => {
      if (message.conversation === conversationId) {
        setMessages((prev) => [...prev, message]);
        if (!isMinimized) {
          markMessageAsRead(message._id).catch(console.error);
        } else {
          const notification = {
            _id: message._id,
            title: "New Chat Message",
            message: message.text,
            link: `/tasks/${taskId}`,
            isRead: false,
            createdAt: new Date().toISOString(),
          };
          setNotifications((prev) => [notification, ...prev]);
          incrementUnreadCount();
          toast.success("New chat message");
        }
      }
    };

    socket.on("message_received", handleMessageReceived);

    return () => {
      socket.emit("leave_chat_room", taskId);
      socket.off("message_received", handleMessageReceived);
    };
  }, [taskId, user, socket, conversationId, isMinimized, decrementUnreadCount, incrementUnreadCount, setNotifications]);

  useEffect(() => {
    if (!isMinimized) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isMinimized]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && socket && conversationId) {
      socket.emit("send_message", {
        conversationId,
        taskId,
        text: newMessage,
        recipientId: recipient._id,
      });
      setNewMessage("");
    }
  };

  return (
    <div className={`fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-2xl flex flex-col z-50 transition-all duration-300 ${isMinimized ? "h-14" : "h-[500px]"}`}>
      <header
        className="bg-gray-100 text-gray-800 p-3 rounded-t-lg flex justify-between items-center cursor-pointer border-b"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center gap-2">
            <img src={recipient.profilePicture || `https://ui-avatars.com/api/?name=${recipient.name}&background=random`} alt={recipient.name} className="w-8 h-8 rounded-full" />
            <h3 className="font-bold text-sm">{recipient.name}</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }} className="text-gray-500 hover:text-gray-800">
            <ChevronDown className={`w-5 h-5 transition-transform ${!isMinimized && "rotate-180"}`} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="text-gray-500 hover:text-gray-800">
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>
      {!isMinimized && (
        <>
          <div className="flex-grow p-4 overflow-y-auto bg-gray-50">
            {messages.map((msg) => (
              <div key={msg._id} className={`flex mb-3 ${msg.sender._id === user?._id ? "justify-end" : "justify-start"}`}>
                 <div className={`p-2 px-3 rounded-lg max-w-xs text-base ${msg.sender._id === user?._id ? "bg-blue-500 text-white" : "bg-gray-200"}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSendMessage} className="p-3 border-t flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-grow p-2 bg-transparent border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button type="submit" className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 disabled:opacity-50" disabled={!newMessage.trim()}>
              <Send className="w-5 h-5"/>
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default ChatWindow;