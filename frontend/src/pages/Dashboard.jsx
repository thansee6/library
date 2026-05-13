import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../utils/api';
import AdminLayout from '../components/AdminLayout';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [realStats, setRealStats] = useState({
    totalBooks: 0,
    activeUsers: 0,
    totalBorrows: 0,
    activeBorrows: 0,
    overdueBooks: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await API.get('/stats/dashboard');
        setRealStats(data);
      } catch (err) {
        console.error('Error fetching dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    {
      title: 'Total Books',
      value: realStats.totalBooks,
      subtitle: 'In library catalog',
      link: '/admin/inventory',
      icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      hoverBorder: 'hover:border-blue-200',
      hoverShadow: 'hover:shadow-blue-100/50',
      valueBg: 'from-blue-600 to-blue-500',
    },
    {
      title: 'Total Users',
      value: realStats.activeUsers,
      subtitle: 'Registered members',
      link: '/admin/users',
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      hoverBorder: 'hover:border-indigo-200',
      hoverShadow: 'hover:shadow-indigo-100/50',
      valueBg: 'from-indigo-600 to-indigo-500',
    },
    {
      title: 'Total Borrows',
      value: realStats.totalBorrows,
      subtitle: 'All-time borrowings',
      link: '/admin/borrows',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
      iconBg: 'bg-teal-50',
      iconColor: 'text-teal-600',
      hoverBorder: 'hover:border-teal-200',
      hoverShadow: 'hover:shadow-teal-100/50',
      valueBg: 'from-teal-600 to-teal-500',
    },
    {
      title: 'Active Borrows',
      value: realStats.activeBorrows,
      subtitle: 'Currently checked out',
      link: '/admin/borrows',
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      hoverBorder: 'hover:border-amber-200',
      hoverShadow: 'hover:shadow-amber-100/50',
      valueBg: 'from-amber-600 to-amber-500',
    },
    {
      title: 'Overdue Books',
      value: realStats.overdueBooks,
      subtitle: 'Action required',
      link: '/admin/borrows',
      icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
      iconBg: 'bg-red-50',
      iconColor: 'text-red-500',
      hoverBorder: 'hover:border-red-200',
      hoverShadow: 'hover:shadow-red-100/50',
      valueBg: 'from-red-600 to-red-500',
      isAlert: true,
    },
  ];

  const quickActions = [
    { label: 'Manage Inventory', link: '/admin/inventory', icon: '📦', desc: 'Add, edit, or remove books' },
    { label: 'Manage Users', link: '/admin/users', icon: '👥', desc: 'View and manage members' },
    { label: 'View Borrows', link: '/admin/borrows', icon: '📋', desc: 'Track all borrow activity' },
    { label: 'System Settings', link: '/admin/settings', icon: '⚙️', desc: 'Configure library rules' },
  ];

  return (
    <AdminLayout title="Library Overview">
      <div className="space-y-8">

        {/* Stat Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {stats.map((stat, index) => (
            <button
              key={index}
              onClick={() => navigate(stat.link)}
              className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between text-left cursor-pointer
                transition-all duration-300 ease-out
                ${stat.hoverBorder} hover:shadow-lg ${stat.hoverShadow}
                hover:-translate-y-1 active:translate-y-0 active:shadow-md
                group relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1a237e]/30`}
            >
              {/* Subtle background glow on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.valueBg} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300 rounded-2xl`} />

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl ${stat.iconBg} group-hover:scale-110 transition-transform duration-300`}>
                    <svg className={`h-5 w-5 ${stat.iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={stat.icon} />
                    </svg>
                  </div>
                  {stat.isAlert && stat.value > 0 && (
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                  )}
                </div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{stat.title}</p>
                <p className={`text-3xl font-extrabold text-gray-900 tabular-nums transition-colors duration-200 ${loading ? 'animate-pulse text-gray-300' : ''}`}>
                  {loading ? '—' : stat.value}
                </p>
                <p className="text-[11px] text-gray-400 mt-1.5 font-medium">{stat.subtitle}</p>
              </div>

              {/* Bottom arrow indicator */}
              <div className="relative z-10 flex items-center gap-1 mt-4 pt-3 border-t border-gray-50">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider group-hover:text-[#1a237e] transition-colors duration-200">
                  View Details
                </span>
                <svg className="w-3 h-3 text-gray-300 group-hover:text-[#1a237e] group-hover:translate-x-1 transition-all duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>⚡</span> Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-start gap-4
                  hover:shadow-md hover:border-gray-200 hover:-translate-y-0.5
                  transition-all duration-200 group"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform duration-200 shrink-0 mt-0.5">
                  {action.icon}
                </span>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-gray-800 group-hover:text-[#1a237e] transition-colors">
                    {action.label}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{action.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Summary Banner */}
        {!loading && realStats.overdueBooks > 0 && (
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
            <div className="flex items-center gap-3">
              <span className="text-2xl animate-pulse">🚨</span>
              <div>
                <p className="font-bold text-red-800 text-sm">
                  {realStats.overdueBooks} overdue book{realStats.overdueBooks > 1 ? 's' : ''} require attention
                </p>
                <p className="text-xs text-red-600/70 mt-0.5">
                  These borrowings have passed their due date and need to be followed up.
                </p>
              </div>
            </div>
            <Link
              to="/admin/borrows"
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg text-xs font-bold transition-colors shadow-sm shrink-0"
            >
              Review Overdue →
            </Link>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
