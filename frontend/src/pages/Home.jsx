import React, { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [borrowings, setBorrowings] = useState([]);
  const [recommendedBooks, setRecommendedBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user || user.role === 'admin') return; // Don't fetch if not standard user

    const fetchData = async () => {
      try {
        setLoading(true);
        
        const borrowRes = await API.get('/borrowings/history');
        setBorrowings(borrowRes.data);

        const booksRes = await API.get('/books', { params: { limit: 4 } });
        setRecommendedBooks(booksRes.data.data);

       
        const catRes = await API.get('/categories');
        setCategories(catRes.data.data);

       
        const stored = localStorage.getItem('favorites');
        if (stored) {
          setFavoritesCount(JSON.parse(stored).length);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  
  if (user && user.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] font-sans flex items-center justify-center p-4 sm:p-8">
        <div className="max-w-6xl w-full flex flex-col lg:flex-row items-center lg:items-start justify-between gap-12 lg:gap-8 animate-fade-in">
          
          <div className="flex-1 text-center lg:text-left mt-0 lg:mt-20">
            <h1 className="text-5xl sm:text-6xl font-bold text-[#1a237e] mb-4 tracking-tight">
              E-Library
            </h1>
            <p className="text-xl sm:text-2xl text-[#1c1e21] leading-relaxed max-w-lg mx-auto lg:mx-0">
              Connect with a world of knowledge. Borrow, manage, and explore thousands of books from anywhere, anytime.
            </p>
            <div className="mt-8 flex justify-center lg:justify-start">
              <Link to="/catalog" className="text-[#1a237e] font-bold hover:underline flex items-center gap-2 group">
                Browse our Collection <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          </div>

          <div className="w-full max-w-[400px] shadow-2xl rounded-2xl bg-white border border-white/50 p-2">
            <LoginForm showTitle={false} />
          </div>

        </div>
      </div>
    );
  }

  const handleReturnBook = async (id) => {
    if (!window.confirm('Are you sure you want to return this book?')) return;
    try {
      await API.post(`/borrowings/return/${id}`);
      // Refresh list
      const borrowRes = await API.get('/borrowings/history');
      setBorrowings(borrowRes.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to return book');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = [];
    if (searchQuery.trim()) {
      params.push(`search=${encodeURIComponent(searchQuery.trim())}`);
    }
    if (selectedCategory) {
      params.push(`category=${encodeURIComponent(selectedCategory)}`);
    }
    
    if (params.length > 0) {
      navigate(`/catalog?${params.join('&')}`);
    } else {
      navigate('/catalog');
    }
  };

  const activeBorrows = borrowings.filter(b => b.status !== 'returned');
  const overdueBorrows = borrowings.filter(b => b.status === 'overdue');

  return (
    <div className="min-h-screen bg-[#f4f6fa] font-sans py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input 
              type="text" 
              placeholder="Search by title or ISBN..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#1a237e]/50 text-sm"
            />
          </div>
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-gray-300 bg-white min-w-[200px] focus:outline-none focus:ring-2 focus:ring-[#1a237e]/50 text-sm text-gray-600 cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-[#1a237e] hover:bg-[#0d155e] text-white font-bold text-sm px-6 py-2.5 rounded-lg transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          
          <Link to="/borrowings" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:scale-[1.02] transition-all duration-300 flex items-center justify-between group">
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#607d8b] uppercase tracking-wider">Active Borrows</span>
              <p className="text-3xl font-extrabold text-[#1a237e]">{loading ? '...' : activeBorrows.length}</p>
              <span className="text-xs text-blue-600 font-medium group-hover:underline">Manage borrows →</span>
            </div>
            <div className="p-4 bg-blue-50 text-blue-600 rounded-xl text-3xl group-hover:rotate-12 transition-transform">
              📚
            </div>
          </Link>

          <Link to="/favorites" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:scale-[1.02] transition-all duration-300 flex items-center justify-between group">
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#607d8b] uppercase tracking-wider">My Wishlist</span>
              <p className="text-3xl font-extrabold text-red-500">{favoritesCount}</p>
              <span className="text-xs text-red-500 font-medium group-hover:underline">View wishlist →</span>
            </div>
            <div className="p-4 bg-red-50 text-red-500 rounded-xl text-3xl group-hover:scale-110 transition-transform">
              ❤️
            </div>
          </Link>

          <div className={`bg-white rounded-2xl p-6 shadow-sm border ${overdueBorrows.length > 0 ? 'border-orange-200 bg-orange-50/20' : 'border-gray-100'} flex items-center justify-between transition-all duration-300`}>
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#607d8b] uppercase tracking-wider">Overdue Alerts</span>
              <p className={`text-3xl font-extrabold ${overdueBorrows.length > 0 ? 'text-orange-600 animate-bounce' : 'text-emerald-600'}`}>
                {loading ? '...' : overdueBorrows.length}
              </p>
              <span className="text-xs font-medium text-gray-500">
                {overdueBorrows.length > 0 ? 'Action required immediately!' : 'All clean & on-time! 🎉'}
              </span>
            </div>
            <div className={`p-4 rounded-xl text-3xl ${overdueBorrows.length > 0 ? 'bg-orange-100 text-orange-600 animate-pulse' : 'bg-emerald-50 text-emerald-600'}`}>
              🚨
            </div>
          </div>

        </div>

        {/* Dashboard Grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Active Borrowings section */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#2c3e50]">My Active Borrows</h2>
              <Link to="/borrowings" className="text-xs font-bold text-[#1a237e] hover:underline">
                View All History →
              </Link>
            </div>

            {loading ? (
              <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a237e]"></div>
              </div>
            ) : activeBorrows.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center space-y-4">
                <div className="text-5xl">📖</div>
                <h3 className="text-base font-bold text-[#2c3e50]">No active borrowings</h3>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  Your hands are empty. Explore our collection and borrow a fascinating book to start reading!
                </p>
                <Link to="/catalog" className="inline-block bg-[#1a237e] text-white px-5 py-2 rounded-xl text-xs font-bold shadow hover:bg-[#0d155e] transition-colors">
                  Explore Catalog
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {activeBorrows.map(borrow => {
                  const isOverdue = borrow.status === 'overdue';
                  const daysLeft = Math.ceil((new Date(borrow.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={borrow.id} className={`bg-white rounded-xl p-4 shadow-sm border flex items-center justify-between gap-4 hover:shadow-md transition-shadow duration-200 ${isOverdue ? 'border-red-100 bg-red-50/5' : 'border-gray-50'}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-14 bg-gray-50 rounded flex items-center justify-center text-lg shadow-inner shrink-0">
                          {borrow.book?.coverImage ? (
                            <img
                              src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${borrow.book?.coverImage}`}
                              alt={borrow.book?.title}
                              className="w-full h-full object-cover rounded"
                            />
                          ) : '📖'}
                        </div>
                        <div>
                          <h4 className="font-bold text-[#2c3e50] text-sm line-clamp-1">{borrow.book?.title}</h4>
                          <p className="text-xs text-[#607d8b]">Due: {new Date(borrow.dueDate).toLocaleDateString()}</p>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full mt-1 inline-block ${
                            isOverdue ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {isOverdue ? 'Overdue' : daysLeft > 0 ? `${daysLeft} days left` : 'Due today'}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleReturnBook(borrow.id)}
                        className="bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-bold px-3 py-2 rounded-lg transition-colors shadow-xs cursor-pointer"
                      >
                        Return
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick recommendations section */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#2c3e50]">Recommended Reads</h2>

            {loading ? (
              <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a237e]"></div>
              </div>
            ) : recommendedBooks.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center text-gray-500 text-xs">
                No recommendations available.
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                {recommendedBooks.map(book => (
                  <Link key={book.id} to={`/book/${book.id}`} className="bg-white rounded-xl p-3 shadow-sm border border-gray-50 hover:shadow-md transition-shadow flex items-center gap-3 group">
                    <div className="w-12 h-16 bg-gray-50 rounded flex items-center justify-center text-xl shadow-inner group-hover:scale-105 transition-transform shrink-0">
                      {book.coverImage ? (
                        <img
                          src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${book.coverImage}`}
                          alt={book.title}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : '📖'}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-[#2c3e50] text-sm line-clamp-1 group-hover:text-[#1a237e] transition-colors">{book.title}</h4>
                      <p className="text-xs text-[#607d8b] truncate">by {book.author?.name || 'Unknown Author'}</p>
                      <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded mt-1 inline-block">
                        {book.category?.name || 'Uncategorized'}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default Home;
