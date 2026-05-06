import React from 'react';
import AdminLayout from '../components/AdminLayout';

const ActivityLogs = () => (
  <AdminLayout title="Activity Logs">
    <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
      <div className="bg-gray-100 p-4 rounded-full mb-4">
        <svg className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-[#1a237e] mb-2">Activity Logs</h2>
      <p className="text-gray-500">This module is currently under development. Soon you will be able to view system-wide activity logs here.</p>
    </div>
  </AdminLayout>
);

export default ActivityLogs;
