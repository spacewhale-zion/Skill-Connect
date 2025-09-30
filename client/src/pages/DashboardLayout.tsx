import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import Navbar from '../components/layout/Navbar'; 
import Footer from '../components/layout/Footer';
import Dashboard from './Dashboard'

const DashboardLayout = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="bg-slate-900 min-h-screen text-white text-center py-10">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 relative">
      {/* --- Starfield Background --- */}
      <div className="absolute inset-0 z-0">
        <div id="stars"></div>
        <div id="stars2"></div>
        <div id="stars3"></div>
      </div>
      
      {/* --- Page Content (must be relative and have a z-index) --- */}
      <div className="relative z-10 flex flex-col flex-grow">
        <main className="flex-grow container mx-auto px-4 py-8">
          <Dashboard />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;