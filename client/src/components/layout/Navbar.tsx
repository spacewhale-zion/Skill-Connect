import { Link } from 'react-router-dom';
import { useAuth } from '../../context/authContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-gray-800 text-white shadow-lg">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-white hover:text-gray-300">
          Skill<span className="text-indigo-400">Connect</span>
        </Link>
        <div className="hidden md:flex items-center space-x-4">
          <Link to="/tasks" className="py-2 px-3 hover:text-indigo-400">Find Tasks</Link>
          <Link to="/providers" className="py-2 px-3 hover:text-indigo-400">Offer Skills</Link>
        </div>
        <div className="flex items-center space-x-2">
          {user ? (
            <>
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