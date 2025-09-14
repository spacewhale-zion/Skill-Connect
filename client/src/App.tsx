import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage'; // <-- Import the new page
import DashboardLayout from './pages/DashboardLayout';
import TaskDetailsPage from './pages/TaskDetailsPage';
import ProfilePage from './pages/ProfilePage';
import FindTasksPage from './pages/FindTaskPage';
import NotificationPermissionHandler from './components/notifications/NotificationHandler';
import NotificationsPage from './pages/NotificationPage';

function App() {
  return (
    <>
    <NotificationPermissionHandler/>
   
    <Routes>
      <Route path="/" element={<HomePage />} /> 
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={< DashboardLayout/>} />
      <Route path="/tasks/:taskId" element={<TaskDetailsPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/tasks" element={<FindTasksPage />} />
    <Route path="/notifications" element={<NotificationsPage />} /> 

      





    </Routes>

    </>
  );
}

export default App;