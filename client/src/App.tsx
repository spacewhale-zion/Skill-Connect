import { Routes, Route } from "react-router-dom";
import { useState, Suspense, lazy } from "react";

// Layout & Components (non-lazy)
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ChatWindow from "@/components/chat/ChatWindow";
import NotificationPermissionHandler from "@/components/notifications/NotificationHandler";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AdminRoute from "@/components/auth/AdminRoute";
import type { AuthUser } from "@/types";

// 🔹 Lazy-loaded pages
const HomePage = lazy(() => import("./pages/HomePage"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage"));
const DashboardLayout = lazy(() => import("./pages/dashboard/DashboardLayout"));
const TaskDetailsPage = lazy(() => import("./pages/tasks/TaskDetailsPage"));
const ProfilePage = lazy(() => import("./pages/dashboard/ProfilePage"));
const FindTasksPage = lazy(() => import("./pages/tasks/FindTaskPage"));
const NotificationsPage = lazy(() => import("./pages/notifications/NotificationsPage"));
const FindServicesPage = lazy(() => import("./pages/services/FindServicePage"));
const ServiceDetailsPage = lazy(() => import("./pages/services/ServiceDetailsPage"));
const AllMyPostedTasksPage = lazy(() => import("./pages/tasks/my-tasks/MyPostedTasksPage"));
const AllMyAssignedTasksPage = lazy(() => import("./pages/tasks/my-tasks/MyAssignedTasksPage"));
const AllMyServicesPage = lazy(() => import("./pages/services/my-services/MyOfferedServicesPage"));
const AllMyBookedServicesPage = lazy(() => import("./pages/services/my-services/MyBookedServicesPage"));
const AllMyTasksPage = lazy(() => import("./pages/tasks/my-tasks/AllMyTasksPage"));
const VerifyEmailPage = lazy(() => import("./pages/auth/VerifyEmailPage"));
const ForgotPasswordPage = lazy(() => import("./pages/auth/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/auth/ResetPasswordPage"));
const AdminPage = lazy(() => import("./pages/admin/AdminPage"));
const SuspendedPage = lazy(() => import("./pages/auth/SuspendedPage"));

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
          recipient={{
            _id: chatWindowData.recipientId,
            name: chatWindowData.recipientName,
          } as AuthUser}
          onClose={() => setChatWindowData(null)}
        />
      )}

      {/* 🔹 Wrap all routes in Suspense fallback */}
      <Suspense fallback={<div className="text-center mt-10">Loading...</div>}>
        <Routes>
          {/* --- Public Routes --- */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/tasks" element={<FindTasksPage />} />
          <Route path="/services" element={<FindServicesPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/suspended" element={<SuspendedPage />} />

          {/* --- Protected Routes --- */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks/:taskId"
            element={
              <ProtectedRoute>
                <TaskDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/services/:serviceId"
            element={
              <ProtectedRoute>
                <ServiceDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
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
            element={
              <ProtectedRoute>
                <AllMyPostedTasksPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-assigned-tasks"
            element={
              <ProtectedRoute>
                <AllMyAssignedTasksPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-offered-services"
            element={
              <ProtectedRoute>
                <AllMyServicesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-booked-services"
            element={
              <ProtectedRoute>
                <AllMyBookedServicesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-all-tasks"
            element={
              <ProtectedRoute>
                <AllMyTasksPage />
              </ProtectedRoute>
            }
          />

          {/* --- Admin Route --- */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            }
          />
        </Routes>
      </Suspense>

      <Footer />
    </>
  );
}

export default App;
