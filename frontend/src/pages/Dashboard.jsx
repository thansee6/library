import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../utils/api';
import AdminLayout from '../components/AdminLayout';

const Dashboard = () => {
  const [realStats, setRealStats] = useState({
    totalBooks: 0,
    activeUsers: 0,
    totalBorrows: 0,
    overdueBooks: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await API.get('/stats/dashboard');
        setRealStats(data);
      } catch (err) {
        console.error('Error fetching dashboard stats', err);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { title: 'Total Books', value: realStats.totalBooks, change: '+2.4%', changeType: 'positive', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
    { title: 'Active Users', value: realStats.activeUsers, change: '+12%', changeType: 'positive', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', iconBg: 'bg-indigo-50', iconColor: 'text-indigo-600' },
    { title: 'Total Borrows', value: realStats.totalBorrows, change: '+5.1%', changeType: 'positive', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
    { title: 'Overdue Books', value: realStats.overdueBooks, change: 'Priority', changeType: 'warning', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', iconBg: 'bg-red-50', iconColor: 'text-red-500' },
  ];

  return (
    <AdminLayout title="Library Overview">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-lg ${stat.iconBg}`}>
                <svg className={`h-6 w-6 ${stat.iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={stat.icon} />
                </svg>
              </div>
              <div className={`flex items-center text-sm font-semibold ${stat.changeType === 'positive' ? 'text-teal-600' : 'text-red-500'}`}>
                {stat.changeType === 'positive' && (
                  <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                )}
                {stat.changeType === 'warning' && (
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )}
                {stat.change}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-10 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-[#1a237e]">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/catalog" className="flex items-center justify-center py-3 px-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm">
                Go to Catalog
            </Link>
            <Link to="/admin/inventory" className="flex items-center justify-center py-3 px-4 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors font-medium text-sm">
                Manage Inventory
            </Link>
            <Link to="/" className="flex items-center justify-center py-3 px-4 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm">
                Back to Home
            </Link>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
