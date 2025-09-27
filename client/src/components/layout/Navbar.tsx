// spacewhale-zion/skill-connect/Skill-Connect-7116ae5702cce0b0c74858586a22e6d652228ad1/client/src/components/layout/Navbar.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import { useNotifications } from '../../context/notificationContext';
import { FaBell, FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = (
    <>
      <Link to="/tasks" className="py-2 px-3 hover:text-indigo-400">Find Tasks</Link>
      <Link to="/services" className="py-2 px-3 hover:text-indigo-400">Book Services</Link>
    </>
  );

  return (
    <nav className="bg-gray-800 text-white shadow-lg">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-white hover:text-gray-300">
          Skill<span className="text-indigo-400">Connect</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-4">
          {navLinks}
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
              <Link to="/dashboard" className="hidden sm:block bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-md text-sm">Dashboard</Link>
              <button onClick={logout} className="hidden sm:block bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md text-sm">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="py-2 px-3 hover:text-indigo-400">Login</Link>
              <Link to="/register" className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-md text-sm">Register</Link>
            </>
          )}
          {/* Hamburger Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden px-6 pb-4">
          <div className="flex flex-col space-y-2">
            {navLinks}
             {user && (
                <>
                    <hr className="border-gray-700 my-2"/>
                    <Link to="/dashboard" className="py-2 px-3 hover:text-indigo-400">Dashboard</Link>
                    <button onClick={logout} className="text-left py-2 px-3 hover:text-indigo-400">Logout</button>
                </>
             )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;