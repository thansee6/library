import { useState, useEffect, useCallback } from 'react';
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

  const fetchData = useCallback(async () => {
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
  }, [activeTab]);

  const fetchAuthors = useCallback(async (force = false) => {
    if (authors.length > 0 && !force) return;
    try {
      const { data } = await API.get('/authors');
      setAuthors(data.data);
    } catch (err) {}
  }, [authors.length]);

  const fetchCategories = useCallback(async (force = false) => {
    if (categories.length > 0 && !force) return;
    try {
      const { data } = await API.get('/categories');
      setCategories(data.data);
    } catch (err) {}
  }, [categories.length]);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      const endpoint = activeTab === 'books' ? '/books' : activeTab === 'authors' ? '/authors' : '/categories';
      await API.delete(`${endpoint}/${id}`);
      fetchData();
      if (activeTab === 'authors') fetchAuthors(true);
      if (activeTab === 'categories') fetchCategories(true);
    } catch (err) {
      alert('Failed to delete item');
    }
  }, [activeTab, fetchData, fetchAuthors, fetchCategories]);

  const handleOpenModal = useCallback((item = null) => {
    setEditingItem(item);
    setSelectedFile(null);
    if (item) {
      setFormData(item);
    } else {
      setFormData(activeTab === 'books' ? { title: '', isbn: '', authorId: '', categoryId: '', stock: 0 } : { name: '' });
    }
    setIsModalOpen(true);
  }, [activeTab]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    try {
      const endpoint = activeTab === 'books' ? '/books' : activeTab === 'authors' ? '/authors' : '/categories';
      
      let payload = formData;
      
      if (activeTab === 'books' && selectedFile) {
        payload = new FormData();
        Object.keys(formData).forEach(key => {
          if (typeof formData[key] !== 'object' || formData[key] === null) {
            payload.append(key, formData[key]);
          }
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
      if (activeTab === 'authors') fetchAuthors(true);
      if (activeTab === 'categories') fetchCategories(true);
    } catch (err) {
      alert('Operation failed: ' + (err.response?.data?.message || err.message));
    }
  }, [activeTab, formData, selectedFile, editingItem, fetchData, fetchAuthors, fetchCategories]);

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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-5 shadow-2xl">
            <h2 className="text-xl font-bold text-[#1a237e] mb-4">
              {editingItem ? 'Edit' : 'Add New'} {activeTab.slice(0, -1)}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              {activeTab === 'books' ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Title</label>
                    <input 
                      required
                      className="w-full p-1.5 border rounded-lg text-sm"
                      value={formData.title || ''}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">ISBN</label>
                      <input 
                        required
                        className="w-full p-1.5 border rounded-lg text-sm"
                        value={formData.isbn || ''}
                        onChange={e => setFormData({...formData, isbn: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Stock</label>
                      <input 
                        type="number"
                        className="w-full p-1.5 border rounded-lg text-sm"
                        value={formData.stock || 0}
                        onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Author</label>
                      <select 
                        required
                        className="w-full p-1.5 border rounded-lg text-sm bg-white"
                        value={formData.authorId || ''}
                        onChange={e => setFormData({...formData, authorId: e.target.value})}
                      >
                        <option value="">Select Author</option>
                        {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Category</label>
                      <select 
                        required
                        className="w-full p-1.5 border rounded-lg text-sm bg-white"
                        value={formData.categoryId || ''}
                        onChange={e => setFormData({...formData, categoryId: e.target.value})}
                      >
                        <option value="">Select Category</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Description</label>
                    <textarea 
                      className="w-full p-1.5 border rounded-lg h-16 text-sm"
                      placeholder="Enter a brief summary..."
                      value={formData.description || ''}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Cover Image</label>
                    <div className="flex items-center gap-3 p-1.5 bg-gray-50/50 rounded-lg border border-gray-100 mb-2">
                      <div className="w-8 h-11 bg-gray-100 border border-gray-200 rounded flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                        {selectedFile ? (
                          <img 
                            src={URL.createObjectURL(selectedFile)} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                          />
                        ) : formData.coverImage ? (
                          <img 
                            src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${formData.coverImage}`} 
                            alt="Current Cover" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xl text-gray-300">📖</span>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-400 truncate max-w-[240px]">
                        {selectedFile ? 'New cover ready' : formData.coverImage ? 'Original cover active' : 'No cover uploaded yet'}
                      </div>
                    </div>
                    <input 
                      type="file"
                      accept="image/*"
                      className="w-full text-xs text-gray-500 file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                      onChange={e => setSelectedFile(e.target.files[0])}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Name</label>
                    <input 
                      required
                      className="w-full p-1.5 border rounded-lg text-sm"
                      value={formData.name || ''}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      {activeTab === 'authors' ? 'Biography' : 'Description'}
                    </label>
                    <textarea 
                      className="w-full p-1.5 border rounded-lg h-24 text-sm"
                      value={activeTab === 'authors' ? formData.biography || '' : formData.description || ''}
                      onChange={e => setFormData({
                        ...formData, 
                        [activeTab === 'authors' ? 'biography' : 'description']: e.target.value
                      })}
                    />
                  </div>
                </>
              )}
              
              <div className="flex gap-3 pt-3 border-t border-gray-50">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-1.5 border rounded-lg text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-1.5 bg-[#1a237e] text-white rounded-lg text-sm font-bold hover:bg-[#0d155e] transition-colors"
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
