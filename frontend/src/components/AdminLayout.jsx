import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const AdminLayout = ({ children, title }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);
  const [showSidebar, setShowSidebar] = React.useState(false);

  const socket = useSocket();
  const [notifications, setNotifications] = React.useState([]);
  const [showNotifications, setShowNotifications] = React.useState(false);

  const unreadCount = notifications.filter(n => n.unread).length;

  React.useEffect(() => {
    if (!socket) return;

    const handleBorrowed = (data) => {
      const newNotif = {
        id: Date.now() + Math.random(),
        text: `User "${data.user?.username}" borrowed "${data.book?.title}"`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        unread: true,
        type: 'borrow'
      };
      setNotifications(prev => [newNotif, ...prev]);
    };

    const handleReturned = (data) => {
      const newNotif = {
        id: Date.now() + Math.random(),
        text: `User "${data.user?.username}" returned "${data.book?.title}"`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        unread: true,
        type: 'return'
      };
      setNotifications(prev => [newNotif, ...prev]);
    };

    const handleOverdue = (data) => {
      const newNotif = {
        id: Date.now() + Math.random(),
        text: `ALERT: "${data.book?.title}" is OVERDUE for user "${data.user?.username}"!`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        unread: true,
        type: 'overdue'
      };
      setNotifications(prev => [newNotif, ...prev]);
    };

    socket.on('book_borrowed', handleBorrowed);
    socket.on('book_returned', handleReturned);
    socket.on('book_overdue', handleOverdue);

    return () => {
      socket.off('book_borrowed', handleBorrowed);
      socket.off('book_returned', handleReturned);
      socket.off('book_overdue', handleOverdue);
    };
  }, [socket]);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    }
  };

  const clearAllNotifications = (e) => {
    e.stopPropagation();
    setNotifications([]);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z', path: '/admin/dashboard' },
    { name: 'Inventory Management', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', path: '/admin/inventory' },
    { name: 'User Management', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', path: '/admin/users' },
    { name: 'Active Borrows', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', path: '/admin/borrows' },
    { name: 'System Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z', path: '/admin/settings' },
  ];

  return (
    <div className="flex h-screen w-full bg-[#f8faff] font-sans overflow-hidden relative">
      {/* Mobile Sidebar Overlay */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-100 flex flex-col shrink-0 md:shrink-0 z-50 transform ${showSidebar ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:flex`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-50">
          <Link to="/admin/dashboard" className="text-xl font-bold text-[#1a237e]">
            ScholarAdmin
          </Link>
          <button
            onClick={() => setShowSidebar(false)}
            className="md:hidden text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 py-6 overflow-y-auto">
          <nav className="space-y-1 px-3">
            {navItems.map((item, index) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={index}
                  to={item.path}
                  onClick={() => setShowSidebar(false)}
                  className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  <svg className={`mr-3 h-5 w-5 flex-shrink-0 ${active ? 'text-blue-700' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-100 h-16 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="md:hidden mr-4 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-[#1a237e]">{title}</h1>
          </div>
          <div className="flex items-center space-x-4">

            <div className="relative">
              <button 
                onClick={toggleNotifications}
                className="text-gray-400 hover:text-gray-500 relative mr-2 p-1.5 rounded-full hover:bg-gray-50 transition-colors focus:outline-none flex items-center justify-center"
                title="System Notifications"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-[9px] text-white flex items-center justify-center font-bold ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl py-2 border border-gray-100 z-50 overflow-hidden transform origin-top-right transition-all duration-200">
                  <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <p className="text-sm font-bold text-gray-800">System Activity Alerts</p>
                    {notifications.length > 0 && (
                      <button 
                        onClick={clearAllNotifications}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 focus:outline-none"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-gray-400">
                        <svg className="mx-auto h-8 w-8 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <p className="text-xs font-medium">No recent real-time activity</p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div key={notif.id} className="px-4 py-3 hover:bg-gray-50/50 transition-colors flex gap-3">
                          <div className="mt-0.5 shrink-0">
                            {notif.type === 'borrow' && (
                              <span className="flex h-6 w-6 rounded-full bg-blue-50 text-blue-600 items-center justify-center">
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
                                </svg>
                              </span>
                            )}
                            {notif.type === 'return' && (
                              <span className="flex h-6 w-6 rounded-full bg-teal-50 text-teal-600 items-center justify-center">
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                                </svg>
                              </span>
                            )}
                            {notif.type === 'overdue' && (
                              <span className="flex h-6 w-6 rounded-full bg-red-50 text-red-500 items-center justify-center">
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-600 leading-normal">{notif.text}</p>
                            <span className="text-[10px] text-gray-400 mt-1 block">{notif.time}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="h-8 w-8 rounded-full bg-[#1a237e] text-white flex items-center justify-center font-bold text-sm focus:outline-none ring-2 ring-[#1a237e] ring-offset-2 transition-all"
              >
                {user?.username ? user.username.substring(0, 2).toUpperCase() : 'AD'}
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-100 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-bold text-gray-900">{user?.username || 'Admin User'}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email || 'admin@admin.com'}</p>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 overflow-y-auto bg-[#f4f7fe] p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
