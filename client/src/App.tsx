import { Routes, Route } from 'react-router-dom';
import { useState } from 'react';

// Page & Layout Imports
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import DashboardLayout from './pages/DashboardLayout';
import TaskDetailsPage from './pages/TaskDetailsPage';
import ProfilePage from './pages/ProfilePage';
import FindTasksPage from './pages/FindTaskPage';
import NotificationsPage from './pages/NotificationPage';
import FindServicesPage from './pages/FindServicePage';
import ServiceDetailsPage from './pages/ServiceDetailsPage';
import AllMyPostedTasksPage from './pages/AllmytPostedtask';
import AllMyAssignedTasksPage from './pages/AllmyAssignedtask';
import AllMyServicesPage from './pages/AllmyServicePage';
import AllMyBookedServicesPage from './pages/AllBookedServices';
import AllMyTasksPage from './pages/Allmytaskpage';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Component Imports
import NotificationPermissionHandler from './components/notifications/NotificationHandler';
import ChatWindow from './components/chat/ChatWindow';
import ProtectedRoute from './components/auth/ProtectedRoute'; // <-- 1. Import ProtectedRoute

// Type and Hook Imports
import type { AuthUser } from './types';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

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