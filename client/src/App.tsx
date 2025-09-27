import { Routes, Route, } from 'react-router-dom';
import {useState} from 'react';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import DashboardLayout from './pages/DashboardLayout';
import TaskDetailsPage from './pages/TaskDetailsPage';
import ProfilePage from './pages/ProfilePage';
import FindTasksPage from './pages/FindTaskPage';
import NotificationPermissionHandler from './components/notifications/NotificationHandler';
import NotificationsPage from './pages/NotificationPage';
import ChatWindow from './components/chat/ChatWindow';
import type { AuthUser } from './types';
import useFcmToken from './hooks/useFCMtoken';
import AllMyTasksPage from './pages/Allmytask';
import AllMyAssignedTasksPage from './pages/AllmyAssignedtask';
import FindServicesPage from './pages/FindServicePage';
import ServiceDetailsPage from './pages/ServiceDetailsPage';
import AllMyServicesPage from './pages/AllmyServicePage';

function App() {

  const { token: fcmToken } = useFcmToken(); // inside App.tsx or a top-level component

  // Move state inside App component
  const [chatWindowData, setChatWindowData] = useState<{
    conversationId: string;
    recipientId: string;
    recipientName: string;
  } | null>(null);

  // Function to open chat modal
  const openChatWindow = (conversationId: string, recipientId: string, recipientName: string) => {
    setChatWindowData({ conversationId, recipientId, recipientName });
  };

  return (
    <>
      <NotificationPermissionHandler />

      {/* Render ChatWindow if chatWindowData exists */}
      {chatWindowData && (
        <ChatWindow
          taskId={chatWindowData.conversationId}
          recipient={{ _id: chatWindowData.recipientId, name: chatWindowData.recipientName } as AuthUser}
          onClose={() => setChatWindowData(null)}
        />
      )}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardLayout />} />
        <Route path="/tasks/:taskId" element={<TaskDetailsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/tasks" element={<FindTasksPage />} />
         <Route path="/services" element={<FindServicesPage />} /> 
           <Route path="/services/:serviceId" element={<ServiceDetailsPage />}/>
        
        <Route
          path="/notifications"
          element={<NotificationsPage openChatWindow={openChatWindow}
           activeChatId={chatWindowData?.conversationId} />} // pass the prop here
        />
        <Route path="/my-posted-tasks" element={<AllMyTasksPage />} />
        <Route path="/my-assigned-tasks" element={<AllMyAssignedTasksPage />} />
        <Route path="/my-offered-services" element={<AllMyServicesPage />}/>

      </Routes>
    </>
  );
}

export default App;
