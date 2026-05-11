import React, { useState, useEffect, useCallback, useMemo } from 'react';
import AdminLayout from '../components/AdminLayout';
import API from '../utils/api';

const ActiveBorrows = () => {
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [bookSearch, setBookSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchBorrowings = useCallback(async () => {
    try {
      const { data } = await API.get('/borrowings/all');
      setBorrowings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBorrowings();
  }, [fetchBorrowings]);

  const handleClearBorrowing = useCallback(async (id) => {
    if (!window.confirm('Are you sure you want to clear this active borrow? This will mark the book as returned and update the available stock.')) return;
    try {
      await API.post(`/borrowings/clear/${id}`);
      fetchBorrowings();
    } catch (err) {
      alert('Failed to clear borrowing: ' + (err.response?.data?.message || err.message));
    }
  }, [fetchBorrowings]);

  const handleDeleteBorrowing = useCallback(async (id) => {
    if (!window.confirm('Are you sure you want to PERMANENTLY delete this borrowing record? This will also restore the book stock if it is currently borrowed.')) return;
    try {
      await API.delete(`/borrowings/${id}`);
      fetchBorrowings();
    } catch (err) {
      alert('Failed to delete borrowing: ' + (err.response?.data?.message || err.message));
    }
  }, [fetchBorrowings]);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  }, []);


  const filteredBorrowings = useMemo(() => borrowings.filter(borrow => {
    const matchesUser = userSearch === '' || 
      borrow.user?.username?.toLowerCase().includes(userSearch.toLowerCase()) ||
      borrow.user?.email?.toLowerCase().includes(userSearch.toLowerCase());
      
    const matchesBook = bookSearch === '' ||
      borrow.book?.title?.toLowerCase().includes(bookSearch.toLowerCase()) ||
      borrow.book?.isbn?.toLowerCase().includes(bookSearch.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' || borrow.status === statusFilter;
    
    return matchesUser && matchesBook && matchesStatus;
  }), [borrowings, userSearch, bookSearch, statusFilter]);

  return (
    <AdminLayout title="Active Borrows">
      {/* Filters Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-col md:flex-row gap-4 items-end justify-between">
        <div className="w-full flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* User Search */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Filter by User</label>
            <input
              type="text"
              placeholder="Search by Username/Email..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a237e]/30 bg-gray-50/50"
            />
          </div>

          {/* Book Search */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Filter by Book</label>
            <input
              type="text"
              placeholder="Search by Title/ISBN..."
              value={bookSearch}
              onChange={(e) => setBookSearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a237e]/30 bg-gray-50/50"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Filter by Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a237e]/30 bg-gray-50/50 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="borrowed">Borrowed</option>
              <option value="overdue">Overdue</option>
              <option value="returned">Returned</option>
            </select>
          </div>
        </div>

        {/* Clear Filters Button */}
        {(userSearch || bookSearch || statusFilter !== 'all') && (
          <button
            onClick={() => {
              setUserSearch('');
              setBookSearch('');
              setStatusFilter('all');
            }}
            className="w-full md:w-auto text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors bg-gray-100 hover:bg-gray-200 px-4 py-2.5 rounded-lg uppercase tracking-wider cursor-pointer h-[38px] flex items-center justify-center shrink-0"
          >
            Clear Filters
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading borrows...</div>
        ) : (
          <>
            {/* Desktop View */}
            <table className="w-full text-left border-collapse hidden md:table">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 font-bold text-[#2c3e50] text-sm uppercase">Book</th>
                  <th className="p-4 font-bold text-[#2c3e50] text-sm uppercase">User</th>
                  <th className="p-4 font-bold text-[#2c3e50] text-sm uppercase">Dates</th>
                  <th className="p-4 font-bold text-[#2c3e50] text-sm uppercase">Status</th>
                  <th className="p-4 font-bold text-[#2c3e50] text-sm uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBorrowings.map(borrow => (
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
                    <td className="p-4 text-right">
                      <div className="flex justify-end items-center gap-2">
                        {borrow.status !== 'returned' ? (
                          <button
                            onClick={() => handleClearBorrowing(borrow.id)}
                            className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg uppercase tracking-wider cursor-pointer"
                          >
                            Clear
                          </button>
                        ) : (
                          <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg uppercase tracking-wider">Returned</span>
                        )}
                        <button
                          onClick={() => handleDeleteBorrowing(borrow.id)}
                          className="text-xs font-bold text-red-600 hover:text-red-800 transition-colors bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg uppercase tracking-wider cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredBorrowings.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-500">No borrowings found matching the filters.</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Mobile View */}
            <div className="md:hidden grid grid-cols-1 gap-4 p-4">
              {filteredBorrowings.map(borrow => (
                <div key={borrow.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-base text-[#1a237e] break-words line-clamp-2">{borrow.book?.title}</div>
                      <div className="text-[11px] text-gray-500 mb-1">ISBN: {borrow.book?.isbn}</div>
                      <div className="text-xs text-gray-700 font-medium">
                        User: <span className="text-[#1a237e]">{borrow.user?.username}</span> <span className="text-gray-400 text-[10px] break-all">({borrow.user?.email})</span>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                      borrow.status === 'returned' ? 'bg-gray-100 text-gray-600' :
                      borrow.status === 'overdue' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {borrow.status}
                    </span>
                  </div>
                  
                  <div className="text-[11px] text-gray-600 bg-gray-50 p-2.5 rounded-lg space-y-1">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-500">Borrowed:</span> 
                      <span>{formatDate(borrow.borrowDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-500">Due Date:</span> 
                      <span>{formatDate(borrow.dueDate)}</span>
                    </div>
                    {borrow.returnDate && (
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-500">Returned:</span> 
                        <span>{formatDate(borrow.returnDate)}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 pt-2 border-t border-gray-100">
                    {borrow.status !== 'returned' ? (
                      <button
                        onClick={() => handleClearBorrowing(borrow.id)}
                        className="flex-1 text-center text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 hover:bg-blue-100 py-2 rounded-lg uppercase tracking-wider cursor-pointer"
                      >
                        Clear Borrow
                      </button>
                    ) : (
                      <span className="flex-1 text-center text-xs font-semibold text-gray-400 bg-gray-50 py-2 rounded-lg">Returned</span>
                    )}
                    <button
                      onClick={() => handleDeleteBorrowing(borrow.id)}
                      className="flex-1 text-center text-xs font-bold text-red-600 hover:text-red-800 transition-colors bg-red-50 hover:bg-red-100 py-2 rounded-lg uppercase tracking-wider cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {filteredBorrowings.length === 0 && (
                <div className="text-center p-8 text-gray-500">No borrowings found matching the filters.</div>
              )}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default ActiveBorrows;
