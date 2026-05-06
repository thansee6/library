import { useState, useEffect } from 'react';
import API from '../utils/api';
import AdminLayout from '../components/AdminLayout';

const InventoryManagement = () => {
  const [activeTab, setActiveTab] = useState('books');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);


  const [authors, setAuthors] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchData();
    if (activeTab === 'books') {
      fetchAuthors();
      fetchCategories();
    }
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const endpoint = activeTab === 'books' ? '/books' : activeTab === 'authors' ? '/authors' : '/categories';
      const { data } = await API.get(endpoint);
      setData(activeTab === 'books' ? data.data : data.data);
    } catch (err) {
      setError('Failed to fetch inventory data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuthors = async () => {
    try {
      const { data } = await API.get('/authors');
      setAuthors(data.data);
    } catch (err) {}
  };

  const fetchCategories = async () => {
    try {
      const { data } = await API.get('/categories');
      setCategories(data.data);
    } catch (err) {}
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      const endpoint = activeTab === 'books' ? '/books' : activeTab === 'authors' ? '/authors' : '/categories';
      await API.delete(`${endpoint}/${id}`);
      fetchData();
    } catch (err) {
      alert('Failed to delete item');
    }
  };

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    setSelectedFile(null);
    if (item) {
      setFormData(item);
    } else {
      setFormData(activeTab === 'books' ? { title: '', isbn: '', authorId: '', categoryId: '', stock: 0 } : { name: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = activeTab === 'books' ? '/books' : activeTab === 'authors' ? '/authors' : '/categories';
      
      let payload = formData;
      
      // If it's a book and a file is selected, use FormData
      if (activeTab === 'books' && selectedFile) {
        payload = new FormData();
        Object.keys(formData).forEach(key => {
          payload.append(key, formData[key]);
        });
        payload.append('coverImage', selectedFile);
      }

      if (editingItem) {
        await API.put(`${endpoint}/${editingItem.id}`, payload);
      } else {
        await API.post(endpoint, payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert('Operation failed: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <AdminLayout title="Inventory Management">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <p className="text-[#607d8b]">Manage your books, authors, and categories.</p>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-[#1a237e] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#0d155e] transition-colors shadow-md"
          >
            + Add New {activeTab.slice(0, -1)}
          </button>
        </div>


        <div className="flex border-b border-gray-200 mb-6">
          {['books', 'authors', 'categories'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium capitalize transition-colors border-b-2 ${
                activeTab === tab 
                  ? 'border-[#1a237e] text-[#1a237e]' 
                  : 'border-transparent text-gray-500 hover:text-[#1a237e]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100">{error}</div>}


        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-20 text-center text-gray-500">Loading...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 font-bold text-[#2c3e50] text-sm uppercase">
                    {activeTab === 'books' ? 'Title' : 'Name'}
                  </th>
                  <th className="p-4 font-bold text-[#2c3e50] text-sm uppercase">
                    {activeTab === 'books' ? 'Author/Info' : 'Details'}
                  </th>
                  <th className="p-4 font-bold text-[#2c3e50] text-sm uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map(item => (
                  <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center">
                        {activeTab === 'books' && item.coverImage && (
                          <img 
                            src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${item.coverImage}`} 
                            alt={item.title} 
                            className="w-10 h-14 object-cover rounded mr-3 shadow-sm"
                          />
                        )}
                        <div>
                          <div className="font-bold text-[#1a237e]">{activeTab === 'books' ? item.title : item.name}</div>
                          {activeTab === 'books' && <div className="text-xs text-gray-400">ISBN: {item.isbn}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-[#607d8b]">
                      {activeTab === 'books' ? (
                        <>
                          <div>{item.author?.name || 'No Author'}</div>
                          <div className="text-xs">{item.category?.name || 'No Category'}</div>
                        </>
                      ) : activeTab === 'authors' ? (
                        <div className="line-clamp-1">{item.biography || 'No biography'}</div>
                      ) : (
                        <div className="line-clamp-1">{item.description || 'No description'}</div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleOpenModal(item)}
                          className="text-[#3f51b5] hover:underline font-medium text-sm"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="text-red-500 hover:underline font-medium text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>


      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-[#1a237e] mb-6">
              {editingItem ? 'Edit' : 'Add New'} {activeTab.slice(0, -1)}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {activeTab === 'books' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input 
                      required
                      className="w-full p-2 border rounded-lg"
                      value={formData.title || ''}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">ISBN</label>
                      <input 
                        required
                        className="w-full p-2 border rounded-lg"
                        value={formData.isbn || ''}
                        onChange={e => setFormData({...formData, isbn: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Stock</label>
                      <input 
                        type="number"
                        className="w-full p-2 border rounded-lg"
                        value={formData.stock || 0}
                        onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Author</label>
                    <select 
                      required
                      className="w-full p-2 border rounded-lg"
                      value={formData.authorId || ''}
                      onChange={e => setFormData({...formData, authorId: e.target.value})}
                    >
                      <option value="">Select Author</option>
                      {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <select 
                      required
                      className="w-full p-2 border rounded-lg"
                      value={formData.categoryId || ''}
                      onChange={e => setFormData({...formData, categoryId: e.target.value})}
                    >
                      <option value="">Select Category</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Cover Image</label>
                    <input 
                      type="file"
                      accept="image/*"
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      onChange={e => setSelectedFile(e.target.files[0])}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input 
                      required
                      className="w-full p-2 border rounded-lg"
                      value={formData.name || ''}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {activeTab === 'authors' ? 'Biography' : 'Description'}
                    </label>
                    <textarea 
                      className="w-full p-2 border rounded-lg h-32"
                      value={activeTab === 'authors' ? formData.biography || '' : formData.description || ''}
                      onChange={e => setFormData({
                        ...formData, 
                        [activeTab === 'authors' ? 'biography' : 'description']: e.target.value
                      })}
                    />
                  </div>
                </>
              )}
              
              <div className="flex gap-4 mt-8">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#1a237e] text-white rounded-lg font-bold"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default InventoryManagement;
