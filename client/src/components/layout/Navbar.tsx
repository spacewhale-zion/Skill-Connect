// spacewhale-zion/skill-connect/Skill-Connect-e87cf6223cbd3887670780f5036f493f8ada8812/client/src/components/layout/Navbar.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import { useNotifications } from '../../context/notificationContext';
import { FaBell, FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Consistent link styling for reuse
  const linkClasses = "py-2 px-3 rounded-md hover:bg-slate-700 transition-colors duration-300";

  const navLinks = (
    <>
      <Link to="/tasks" className={linkClasses}>Find Tasks</Link>
      <Link to="/services" className={linkClasses}>Book Services</Link>
    </>
  );

  return (
    <nav className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-white hover:opacity-90 transition-opacity">
          Skill<span className="text-yellow-400">Connect</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-2">
          {navLinks}
        </div>

        {/* Right section of the navbar */}
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Link to="/notifications" className="relative p-2 rounded-full hover:bg-slate-700 transition-colors">
                <FaBell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 block w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold text-[10px]">
                    {unreadCount}
                  </span>
                )}
              </Link>
              <Link to="/dashboard" className="hidden sm:block bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold py-2 px-4 rounded-md text-sm transition-colors duration-300">Dashboard</Link>
              <button onClick={logout} className="hidden sm:block bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 rounded-md text-sm transition-colors duration-300">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="py-2 px-3 hover:text-yellow-400 transition-colors duration-300">Login</Link>
              <Link to="/register" className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold py-2 px-4 rounded-md text-sm transition-colors duration-300">Register</Link>
            </>
          )}
          {/* Hamburger Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md hover:bg-slate-700 transition-colors">
              {isMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden px-4 pb-4 border-t border-slate-700">
          <div className="flex flex-col space-y-2 pt-4">
            {navLinks}
             {user && (
                <>
                    <hr className="border-slate-700 my-2"/>
                    <Link to="/dashboard" className={linkClasses}>Dashboard</Link>
                    <button onClick={() => { logout(); setIsMenuOpen(false); }} className={`text-left w-full ${linkClasses}`}>Logout</button>
                </>
             )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;