import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../utils/api';

const BookCatalog = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [search, category, page]);

  const fetchCategories = async () => {
    try {
      const { data } = await API.get('/categories');
      setCategories(data.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/books', {
        params: {
          search,
          category,
          page,
          limit: 6
        }
      });
      setBooks(data.data);
      setTotalPages(data.pages);
    } catch (err) {
      console.error('Error fetching books:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f8fc] font-sans pb-12">
      <main className="max-w-6xl mx-auto p-6">
        <div className="mb-10 text-center lg:text-left">
          <h1 className="text-4xl font-bold text-[#2c3e50] mb-2">Book Collection</h1>
          <p className="text-[#607d8b]">Browse and discover your next favorite read.</p>
        </div>


        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input 
              type="text" 
              placeholder="Search by title or ISBN..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a237e]/50"
            />
          </div>
          <select 
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white min-w-[200px] focus:outline-none focus:ring-2 focus:ring-[#1a237e]/50"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>


        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a237e]"></div>
          </div>
        ) : books.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {books.map(book => (
                <div key={book.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow group">
                  <div className="w-full h-48 bg-gray-50 rounded-lg mb-4 flex items-center justify-center text-gray-400 group-hover:bg-gray-100 transition-colors">
                    {book.coverImage ? (
                       <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <span className="text-5xl opacity-50">📖</span>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-[#1a237e] mb-1 line-clamp-1">{book.title}</h2>
                  <p className="text-[#607d8b] mb-4 text-sm">by {book.author?.name || 'Unknown Author'}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold px-2 py-1 bg-[#e8eaf6] text-[#1a237e] rounded-full">
                      {book.category?.name || 'Uncategorized'}
                    </span>
                    <Link to={`/book/${book.id}`} className="text-[#009688] font-bold hover:text-[#00796b] transition-colors text-sm">
                      View Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>


            {totalPages > 1 && (
              <div className="mt-12 flex justify-center items-center gap-2">
                <button 
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
                <span className="text-[#607d8b] text-sm font-medium">
                  Page {page} of {totalPages}
                </span>
                <button 
                  disabled={page === totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
            <span className="text-4xl mb-4 block">🔍</span>
            <h3 className="text-xl font-bold text-[#2c3e50]">No books found</h3>
            <p className="text-[#607d8b]">Try adjusting your search or filters.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default BookCatalog;
