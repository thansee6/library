import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isLoginPage = location.pathname === '/login';
  const isRegisterPage = location.pathname === '/register';

  return (
    <nav className="bg-[#1a237e] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold tracking-tight mr-8">
              E-Library
            </Link>
            <div className="hidden md:flex items-baseline space-x-4">
              <Link to="/" className="hover:bg-[#0d155e] px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Home
              </Link>
              <Link to="/catalog" className="hover:bg-[#0d155e] px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Catalog
              </Link>
              {user && (user.role === 'admin' || user.role === 'librarian') && (
                <Link to="/admin/inventory" className="hover:bg-[#0d155e] px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Inventory
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm hidden sm:inline-block">Welcome, <span className="font-semibold">{user.username}</span></span>
                <button
                  onClick={handleLogout}
                  className="bg-[#009688] hover:bg-[#00796b] px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                {!isLoginPage && (
                  <Link to="/login" className="hover:text-gray-300 px-3 py-2 text-sm font-medium">
                    Login
                  </Link>
                )}
                {!isRegisterPage && (
                  <Link to="/register" className="bg-[#009688] hover:bg-[#00796b] px-4 py-2 rounded-md text-sm font-medium transition-colors">
                    Register
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

