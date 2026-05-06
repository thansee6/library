import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import API from '../utils/api';

const ActiveBorrows = () => {
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBorrowings = async () => {
    try {
      const { data } = await API.get('/borrowings/all');
      setBorrowings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrowings();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <AdminLayout title="Active Borrows">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading borrows...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 font-bold text-[#2c3e50] text-sm uppercase">Book</th>
                <th className="p-4 font-bold text-[#2c3e50] text-sm uppercase">User</th>
                <th className="p-4 font-bold text-[#2c3e50] text-sm uppercase">Dates</th>
                <th className="p-4 font-bold text-[#2c3e50] text-sm uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {borrowings.map(borrow => (
                <tr key={borrow.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="p-4">
                    <div className="font-bold text-[#1a237e]">{borrow.book?.title}</div>
                    <div className="text-xs text-gray-500">ISBN: {borrow.book?.isbn}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium">{borrow.user?.username}</div>
                    <div className="text-xs text-gray-500">{borrow.user?.email}</div>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    <div><span className="font-medium">Borrowed:</span> {formatDate(borrow.borrowDate)}</div>
                    <div><span className="font-medium">Due:</span> {formatDate(borrow.dueDate)}</div>
                    {borrow.returnDate && <div><span className="font-medium">Returned:</span> {formatDate(borrow.returnDate)}</div>}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                      borrow.status === 'returned' ? 'bg-gray-100 text-gray-600' :
                      borrow.status === 'overdue' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {borrow.status}
                    </span>
                  </td>
                </tr>
              ))}
              {borrowings.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-500">No borrows found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
};

export default ActiveBorrows;
