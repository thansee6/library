import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  const isLoginPage = location.pathname === '/login';
  const isRegisterPage = location.pathname === '/register';

  return (
    <nav className="bg-[#1a237e] text-white shadow-md relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold tracking-tight mr-8">
              E-Library
            </Link>
            <div className="hidden md:flex items-baseline space-x-4">
              {user && user.role !== 'admin' && (
                <>
                  <Link to="/borrowings" className="hover:bg-[#0d155e] px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    My Borrowings
                  </Link>
                  <Link to="/favorites" className="hover:bg-[#0d155e] px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    Favourites ❤️
                  </Link>
                  <Link to="/catalog" className="hover:bg-[#0d155e] px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    Books Catalog
                  </Link>
                </>
              )}
              {(!user || user.role === 'admin') && (
                <>
                  <Link to="/" className="hover:bg-[#0d155e] px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    Home
                  </Link>
                  <Link to="/catalog" className="hover:bg-[#0d155e] px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    Catalog
                  </Link>
                  {user && (
                    <Link to="/borrowings" className="hover:bg-[#0d155e] px-3 py-2 rounded-md text-sm font-medium transition-colors">
                      My Borrowings
                    </Link>
                  )}
                  {user && (
                    <Link to="/favorites" className="hover:bg-[#0d155e] px-3 py-2 rounded-md text-sm font-medium transition-colors">
                      Wishlist ❤️
                    </Link>
                  )}
                  {user && (
                    <Link to="/profile" className="hover:bg-[#0d155e] px-3 py-2 rounded-md text-sm font-medium transition-colors">
                      My Profile
                    </Link>
                  )}
                </>
              )}
              {user && user.role === 'admin' && (
                <>
                  <Link to="/admin/dashboard" className="hover:bg-[#0d155e] px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    Dashboard
                  </Link>
                  <Link to="/admin/inventory" className="hover:bg-[#0d155e] px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    Inventory
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/profile" className="text-sm hidden sm:inline-block hover:underline">
                  Welcome, <span className="font-semibold">{user.username}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-[#009688] hover:bg-[#00796b] px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer"
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

          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md hover:bg-[#0d155e] focus:outline-none transition-colors cursor-pointer"
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <svg className="h-6 w-6 animate-pulse" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-[#161d6f] border-t border-white/10" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className="block hover:bg-[#0d155e] px-3 py-2 rounded-md text-base font-medium transition-colors"
            >
              Home
            </Link>
            <Link
              to="/catalog"
              onClick={() => setIsOpen(false)}
              className="block hover:bg-[#0d155e] px-3 py-2 rounded-md text-base font-medium transition-colors"
            >
              Catalog
            </Link>
            {user && (
              <>
                <Link
                  to="/borrowings"
                  onClick={() => setIsOpen(false)}
                  className="block hover:bg-[#0d155e] px-3 py-2 rounded-md text-base font-medium transition-colors"
                >
                  My Borrowings
                </Link>
                <Link
                  to="/favorites"
                  onClick={() => setIsOpen(false)}
                  className="block hover:bg-[#0d155e] px-3 py-2 rounded-md text-base font-medium transition-colors"
                >
                  Wishlist ❤️
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="block hover:bg-[#0d155e] px-3 py-2 rounded-md text-base font-medium transition-colors"
                >
                  My Profile
                </Link>
              </>
            )}
            {user && user.role === 'admin' && (
              <>
                <Link
                  to="/admin/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="block hover:bg-[#0d155e] px-3 py-2 rounded-md text-base font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/admin/inventory"
                  onClick={() => setIsOpen(false)}
                  className="block hover:bg-[#0d155e] px-3 py-2 rounded-md text-base font-medium transition-colors"
                >
                  Inventory
                </Link>
              </>
            )}
          </div>
          <div className="pt-4 pb-4 border-t border-white/10 px-5 flex flex-col gap-3">
            {user ? (
              <div className="flex flex-col gap-2">
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="text-sm hover:underline block"
                >
                  Welcome, <span className="font-semibold">{user.username}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-center bg-[#009688] hover:bg-[#00796b] px-4 py-2.5 rounded-md text-sm font-semibold transition-colors cursor-pointer"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {!isLoginPage && (
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center hover:bg-white/10 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Login
                  </Link>
                )}
                {!isRegisterPage && (
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center bg-[#009688] hover:bg-[#00796b] px-4 py-2.5 rounded-md text-sm font-semibold transition-colors"
                  >
                    Register
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
