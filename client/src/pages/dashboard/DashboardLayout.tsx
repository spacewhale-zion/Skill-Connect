import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';

import Dashboard from './DashboardPage'
import LoadingSpinner from '@/components/layout/LoadingSpinner';

const DashboardLayout = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="bg-slate-900 min-h-screen text-white flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 relative">
      
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