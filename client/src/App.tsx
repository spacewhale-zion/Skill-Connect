import { Routes, Route } from 'react-router-dom';
import { useState } from 'react';

// Page & Layout Imports
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import HomePage from './pages/HomePage';
import DashboardLayout from './pages/dashboard/DashboardLayout';
import TaskDetailsPage from './pages/tasks/TaskDetailsPage';
import ProfilePage from './pages/dashboard/ProfilePage';
import FindTasksPage from './pages/tasks/FindTaskPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import FindServicesPage from './pages/services/FindServicePage';
import ServiceDetailsPage from './pages/services/ServiceDetailsPage';
import AllMyPostedTasksPage from './pages/tasks/my-tasks/MyPostedTasksPage';
import AllMyAssignedTasksPage from './pages/tasks/my-tasks/MyAssignedTasksPage';
import AllMyServicesPage from './pages/services/my-services/MyOfferedServicesPage';
import AllMyBookedServicesPage from './pages/services/my-services/MyBookedServicesPage';
import AllMyTasksPage from './pages/tasks/my-tasks/AllMyTasksPage';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

// Component Imports
import NotificationPermissionHandler from '@/components/notifications/NotificationHandler';
import ChatWindow from '@/components/chat/ChatWindow';
import ProtectedRoute from '@/components/auth/ProtectedRoute'; // <-- 1. Import ProtectedRoute

// Type and Hook Imports
import type { AuthUser } from '@/types';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

function App() {
  const [chatWindowData, setChatWindowData] = useState<{
    conversationId: string;
    recipientId: string;
    recipientName: string;
  } | null>(null);

  const openChatWindow = (conversationId: string, recipientId: string, recipientName: string) => {
    setChatWindowData({ conversationId, recipientId, recipientName });
  };

  return (
    <>
      <Navbar />
      <NotificationPermissionHandler />

      {chatWindowData && (
        <ChatWindow
          taskId={chatWindowData.conversationId}
          recipient={{ _id: chatWindowData.recipientId, name: chatWindowData.recipientName } as AuthUser}
          onClose={() => setChatWindowData(null)}
        />
      )}

      <Routes>
        {/* --- Public Routes --- */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/tasks" element={<FindTasksPage />} />
        <Route path="/services" element={<FindServicesPage />} />
         <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage/>} />
        
        {/* --- Protected Routes --- */}
        {/* Wrap the element of each protected route with the ProtectedRoute component */}
        <Route
          path="/dashboard"
          element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}
        />
        <Route
          path="/tasks/:taskId"
          element={<ProtectedRoute><TaskDetailsPage /></ProtectedRoute>}
        />
         <Route
          path="/services/:serviceId"
          element={<ProtectedRoute><ServiceDetailsPage /></ProtectedRoute>}
        />
        <Route
          path="/profile"
          element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage
                openChatWindow={openChatWindow}
                activeChatId={chatWindowData?.conversationId}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-posted-tasks"
          element={<ProtectedRoute><AllMyPostedTasksPage /></ProtectedRoute>}
        />
        <Route
          path="/my-assigned-tasks"
          element={<ProtectedRoute><AllMyAssignedTasksPage /></ProtectedRoute>}
        />
        <Route
          path="/my-offered-services"
          element={<ProtectedRoute><AllMyServicesPage /></ProtectedRoute>}
        />
        <Route
          path="/my-booked-services"
          element={<ProtectedRoute><AllMyBookedServicesPage /></ProtectedRoute>}
        />
        <Route
          path="/my-all-tasks"
          element={<ProtectedRoute><AllMyTasksPage /></ProtectedRoute>}
        />
      </Routes>

      <Footer />
    </>
  );
}

export default App;