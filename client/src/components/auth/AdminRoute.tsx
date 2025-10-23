import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import LoadingSpinner from '../layout/LoadingSpinner'; // Using the loader we created

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="bg-slate-900 min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (user.isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;