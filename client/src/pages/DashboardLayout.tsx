import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import Navbar from '../components/layout/Navbar'; // Reuse the Navbar
import Footer from '../components/layout/Footer';
import Dashboard from './Dashboard'
const DashboardLayout = () => {
  const { user, isLoading } = useAuth();

  // Show a loading indicator while checking auth status
  if (isLoading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  // If not loading and no user, redirect to the login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If the user is logged in, render the dashboard layout
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Dashboard />
      </main>
      <Footer />
    </div>
  );
};

export default DashboardLayout;