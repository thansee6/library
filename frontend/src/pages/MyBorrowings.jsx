import React, { useState, useEffect, useCallback } from 'react';
import API from '../utils/api';
import { Link } from 'react-router-dom';

const MyBorrowings = () => {
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBorrowings();
  }, []);

  const fetchBorrowings = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/borrowings/history');
      setBorrowings(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch borrowing history');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleReturn = useCallback(async (id) => {
    try {
      await API.post(`/borrowings/return/${id}`);
      setBorrowings(prev => prev.map(b => b.id === id ? { ...b, status: 'returned', returnDate: new Date().toISOString() } : b));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to return book');
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f8fc]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a237e]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f8fc] font-sans py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[#1a237e] mb-8">My Borrowings</h1>
        
        {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

        {borrowings.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-sm text-center">
            <p className="text-gray-500 mb-4">You have not borrowed any books yet.</p>
            <Link to="/catalog" className="inline-block bg-[#009688] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#00796b] transition-colors">
              Browse Catalog
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <ul className="divide-y divide-gray-200">
              {borrowings.map((borrowing) => (
                <li key={borrowing.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-[#2c3e50]">{borrowing.book?.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Borrowed on: {new Date(borrowing.borrowDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        Due Date: {new Date(borrowing.dueDate).toLocaleDateString()}
                      </p>
                      {borrowing.returnDate && (
                        <p className="text-sm text-gray-500">
                          Returned on: {new Date(borrowing.returnDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider
                        ${borrowing.status === 'borrowed' ? 'bg-blue-100 text-blue-800' : 
                          borrowing.status === 'returned' ? 'bg-green-100 text-green-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {borrowing.status}
                      </span>
                      {borrowing.status !== 'returned' && (
                        <button 
                          onClick={() => handleReturn(borrowing.id)}
                          className="mt-2 text-sm bg-[#1a237e] text-white px-4 py-2 rounded shadow hover:bg-[#0d155e] transition-colors"
                        >
                          Return Book
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBorrowings;
