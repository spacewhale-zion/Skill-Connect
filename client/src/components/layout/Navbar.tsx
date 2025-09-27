import { Link } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import { useNotifications } from '../../context/notificationContext'; // Import the new hook
import { FaBell } from 'react-icons/fa'; 

const Navbar = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications(); // Get the unread count
  console.log(unreadCount)
  return (
    <nav className="bg-gray-800 text-white shadow-lg">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        {/* ... Left and middle sections of the navbar ... */}
        <Link to="/" className="text-xl font-bold text-white hover:text-gray-300">
          Skill<span className="text-indigo-400">Connect</span>
        </Link>
        <div className="hidden md:flex items-center space-x-4">
          <Link to="/tasks" className="py-2 px-3 hover:text-indigo-400">Find Tasks</Link>
          <Link to="/services" className="py-2 px-3 hover:text-indigo-400">Book Services</Link>
        </div>

        {/* Right section of the navbar */}
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Link to="/notifications" className="relative py-2 px-3 hover:text-indigo-400">
                <FaBell size={20} />
               
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Link>
              <Link to="/dashboard" className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-md text-sm">Dashboard</Link>
              <button onClick={logout} className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md text-sm">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="py-2 px-3 hover:text-indigo-400">Login</Link>
              <Link to="/register" className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-md text-sm">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;