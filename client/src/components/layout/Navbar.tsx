import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import { useNotifications } from '../../context/notificationContext';
import { FaBell, FaBars, FaTimes, FaUserShield } from 'react-icons/fa'; // Added FaUserShield

const Navbar = () => {
  // Get user, logout function, AND isAdmin flag from useAuth
  const { user, logout, isAdmin } = useAuth();
  const { unreadCount } = useNotifications();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  console.log('Navbar render, unreadCount:', unreadCount);


  // Consistent link styling for reuse
  const linkClasses = "py-2 px-3 rounded-md hover:bg-slate-700 transition-colors duration-300";
  // Specific style for the admin button
  const adminLinkClasses = "py-2 px-3 rounded-md bg-indigo-600 hover:bg-indigo-700 transition-colors duration-300 flex items-center gap-1 text-sm font-semibold";

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

        {/* Desktop Menu - Links */}
        <div className="hidden md:flex items-center space-x-2">
          {navLinks}
        </div>

        {/* Right section of the navbar */}
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              {/* Conditionally render Admin button for desktop */}
              {isAdmin && (
                <Link to="/admin" className={`hidden sm:flex ${adminLinkClasses}`}>
                  <FaUserShield size={14} /> Admin
                </Link>
              )}
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
                    {/* Conditionally render Admin button for mobile */}
                    {isAdmin && (
                         <Link to="/admin" className={adminLinkClasses} onClick={() => setIsMenuOpen(false)}>
                             <FaUserShield size={14} /> Admin Panel
                         </Link>
                    )}
                    <Link to="/dashboard" className={linkClasses} onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
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