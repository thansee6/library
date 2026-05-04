
import { useParams, Link } from 'react-router-dom';

const mockBooks = [
  { id: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', category: 'Classic', year: 1925, description: 'A story of decadence and excess, Gatsby explores the American Dream in the 1920s.' },
  { id: 2, title: 'To Kill a Mockingbird', author: 'Harper Lee', category: 'Classic', year: 1960, description: 'A gripping, heart-wrenching, and wholly remarkable tale of coming-of-age in a South poisoned by virulent prejudice.' },
  { id: 3, title: '1984', author: 'George Orwell', category: 'Dystopian', year: 1949, description: 'A haunting look at a future where individual thought is a crime.' },
  { id: 4, title: 'The Hobbit', author: 'J.R.R. Tolkien', category: 'Fantasy', year: 1937, description: 'A great modern classic and the prelude to The Lord of the Rings.' },
  { id: 5, title: 'The Catcher in the Rye', author: 'J.D. Salinger', category: 'Classic', year: 1951, description: 'The story of Holden Caulfield, a teenager who is trying to find his place in the world.' },
  { id: 6, title: 'The Alchemist', author: 'Paulo Coelho', category: 'Adventure', year: 1988, description: 'The story of Santiago, an Andalusian shepherd boy who yearns to travel in search of a worldly treasure.' },
];

const BookDetails = () => {
  const { id } = useParams();
  const book = mockBooks.find(b => b.id === parseInt(id));

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
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col md:flex-row">
         
          <div className="w-full md:w-1/3 bg-gray-200 flex items-center justify-center text-8xl p-12">
            📖
          </div>

          <div className="p-8 md:w-2/3">
            <div className="mb-6">
              <span className="text-sm font-bold text-[#009688] uppercase tracking-wider">{book.category}</span>
              <h1 className="text-4xl font-bold text-[#1a237e] mt-1">{book.title}</h1>
              <p className="text-xl text-[#607d8b] mt-2">by {book.author}</p>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-bold text-[#2c3e50] mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed italic">
                "{book.description}"
              </p>
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              <button className="flex-1 min-w-[150px] py-3 px-6 rounded-lg bg-[#1a237e] text-white font-bold hover:bg-[#0d155e] transition-all shadow-md">
                Borrow Now
              </button>
              <button className="flex-1 min-w-[150px] py-3 px-6 rounded-lg border-2 border-[#1a237e] text-[#1a237e] font-bold hover:bg-[#f0f2f5] transition-all">
                Add to Wishlist
              </button>
            </div>

            <p className="mt-6 text-sm text-gray-400">Published: {book.year}</p>
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
