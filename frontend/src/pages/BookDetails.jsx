import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [borrowing, setBorrowing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('favorites');
    if (stored) {
      setFavorites(JSON.parse(stored));
    }
  }, []);

  const isFavorite = favorites.some(f => f.id === book?.id);

  const toggleFavorite = () => {
    if (!book) return;
    let updated;
    if (isFavorite) {
      updated = favorites.filter(f => f.id !== book.id);
    } else {
      updated = [...favorites, book];
    }
    setFavorites(updated);
    localStorage.setItem('favorites', JSON.stringify(updated));
  };

  useEffect(() => {
    fetchBook();
  }, [id]);

  const fetchBook = async () => {
    try {
      const { data } = await API.get(`/books/${id}`);
      setBook(data.data);
    } catch (err) {
      console.error(err);
      setError('Book not found');
    } finally {
      setLoading(false);
    }
  };

  const handleBorrow = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setBorrowing(true);
    setError('');
    setSuccess('');

    try {
      await API.post('/borrowings/borrow', { bookId: book.id });
      setSuccess('Book borrowed successfully!');
      setBook({ ...book, availableStock: book.availableStock - 1 });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to borrow book');
    } finally {
      setBorrowing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-[#f7f8fc]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a237e]"></div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-[#f7f8fc]">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#1a237e]">Book not found</h1>
          <Link to="/catalog" className="text-[#009688] mt-4 inline-block font-medium underline">Back to Catalog</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f8fc] font-sans">
      <main className="max-w-4xl mx-auto p-6 sm:p-12">
        {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">{error}</div>}
        {success && <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-6">{success}</div>}

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col md:flex-row">
          <div className="w-full md:w-1/3 bg-gray-50 flex items-center justify-center p-0 overflow-hidden border-b md:border-b-0 md:border-r border-gray-100">
            {book.coverImage ? (
               <img 
                src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${book.coverImage}`} 
                alt={book.title} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <span className="text-8xl opacity-30">📖</span>
            )}
          </div>

          <div className="p-8 md:w-2/3">
            <div className="mb-6">
              <span className="text-sm font-bold text-[#009688] uppercase tracking-wider">{book.category?.name || 'Uncategorized'}</span>
              <h1 className="text-4xl font-bold text-[#1a237e] mt-1">{book.title}</h1>
              <p className="text-xl text-[#607d8b] mt-2">by {book.author?.name || 'Unknown Author'}</p>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-bold text-[#2c3e50] mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed italic">
                {book.description || 'No description available.'}
              </p>
            </div>

            <div className="mb-6 flex gap-8 text-sm text-gray-500">
              <div>
                <span className="block font-bold text-gray-700">ISBN</span>
                {book.isbn}
              </div>
              <div>
                <span className="block font-bold text-gray-700">Published</span>
                {book.publicationYear || 'N/A'}
              </div>
              <div>
                <span className="block font-bold text-gray-700">Available Stock</span>
                <span className={book.availableStock > 0 ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                  {book.availableStock} / {book.stock}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              <button 
                onClick={handleBorrow}
                disabled={borrowing || book.availableStock <= 0}
                className="flex-1 min-w-[150px] py-3 px-6 rounded-lg bg-[#1a237e] text-white font-bold hover:bg-[#0d155e] transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {borrowing ? 'Processing...' : book.availableStock > 0 ? 'Borrow Now' : 'Out of Stock'}
              </button>
              <button
                onClick={toggleFavorite}
                className="py-3 px-5 rounded-lg border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                title={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
              >
                <span>{isFavorite ? '❤️' : '🤍'}</span>
                <span>{isFavorite ? 'Saved' : 'Wishlist'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Link to="/catalog" className="text-[#1a237e] font-medium hover:underline flex items-center gap-2">
            ← Back to Catalog
          </Link>
        </div>
      </main>
    </div>
  );
};

export default BookDetails;
