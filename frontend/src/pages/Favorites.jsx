import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const storedFavorites = localStorage.getItem('favorites');
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
  }, []);

  const handleRemove = (bookId) => {
    const updated = favorites.filter(b => b.id !== bookId);
    setFavorites(updated);
    localStorage.setItem('favorites', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-[#f7f8fc] font-sans py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 text-center lg:text-left">
          <h1 className="text-4xl font-bold text-[#1a237e] mb-2">My Wishlist & Favorites</h1>
          <p className="text-gray-500">Your curated collection of books you want to read next.</p>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300 shadow-sm max-w-2xl mx-auto px-6">
            <span className="text-5xl mb-4 block animate-bounce">✨</span>
            <h3 className="text-2xl font-bold text-[#1a237e] mb-2">Your wishlist is empty</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">Browse our collection to add books to your personal wishlist and keep track of your favorites.</p>
            <Link 
              to="/catalog" 
              className="inline-block py-3 px-8 bg-[#009688] hover:bg-[#00796b] text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg"
            >
              Explore Book Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {favorites.map((book) => (
              <div 
                key={book.id} 
                className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 group flex flex-col justify-between relative"
              >
                <button
                  onClick={() => handleRemove(book.id)}
                  className="absolute top-4 right-4 bg-red-50 hover:bg-red-100 text-red-500 p-2.5 rounded-full shadow-sm hover:scale-110 active:scale-95 transition-all z-10"
                  title="Remove from favorites"
                >
                  ❤️
                </button>

                <div>
                  <div className="w-full h-48 bg-gray-50 rounded-xl mb-4 flex items-center justify-center text-gray-400 group-hover:bg-gray-100 transition-colors overflow-hidden border border-gray-100">
                    {book.coverImage ? (
                      <img 
                        src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${book.coverImage}`} 
                        alt={book.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                    ) : (
                      <span className="text-6xl opacity-40">📖</span>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-[#1a237e] mb-1 line-clamp-1 group-hover:text-[#009688] transition-colors">{book.title}</h2>
                  <p className="text-gray-400 text-sm mb-4">by {book.author?.name || 'Unknown Author'}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-4">
                  <span className="text-xs font-bold px-3 py-1 bg-[#e8eaf6] text-[#1a237e] rounded-full uppercase tracking-wider">
                    {book.category?.name || 'Uncategorized'}
                  </span>
                  <Link 
                    to={`/book/${book.id}`} 
                    className="text-[#009688] font-bold hover:text-[#00796b] transition-colors text-sm flex items-center gap-1"
                  >
                    Details <span>→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
