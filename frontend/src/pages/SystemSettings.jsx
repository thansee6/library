import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import API from '../utils/api';

const SystemSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [settings, setSettings] = useState({
    borrowLimit: '3',
    borrowDuration: '14',
    fineRate: '0.50',
    enableChat: 'true'
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await API.get('/settings');
        if (data.success && data.data) {
          setSettings(prev => ({
            ...prev,
            ...data.data
          }));
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
        setErrorMsg('Failed to load system settings from server.');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? String(checked) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const { data } = await API.put('/settings', settings);
      if (data.success) {
        setSuccessMsg('System configurations updated successfully!');
        setTimeout(() => setSuccessMsg(''), 5000);
      } else {
        setErrorMsg(data.message || 'Failed to update system configurations.');
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to connect to the server.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="System Configurations">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden font-sans">
        <div className="px-6 py-4 border-b border-gray-100 bg-[#1a237e] text-white">
          <h2 className="text-lg font-bold">ScholarLibrary Settings</h2>
          <p className="text-xs text-white/80 mt-0.5">Configure global library rules and communication modules.</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-gray-500">Retrieving parameters...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {successMsg && (
              <div className="bg-teal-50 border border-teal-100 text-teal-800 rounded-lg p-4 text-sm font-medium flex items-center gap-2 animate-fade-in">
                <svg className="h-5 w-5 text-teal-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {successMsg}
              </div>
            )}

            {errorMsg && (
              <div className="bg-red-50 border border-red-100 text-red-800 rounded-lg p-4 text-sm font-medium flex items-center gap-2 animate-fade-in">
                <svg className="h-5 w-5 text-red-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {errorMsg}
              </div>
            )}

            <div className="space-y-4">

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                <label className="text-sm font-semibold text-gray-700">Max Book Borrow Limit</label>
                <div className="md:col-span-2 relative">
                  <input
                    type="number"
                    name="borrowLimit"
                    min="1"
                    max="10"
                    required
                    value={settings.borrowLimit}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a237e]/30 bg-gray-50/30"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Maximum number of active books a member can borrow at once.</p>
                </div>
              </div>


              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center pt-4 border-t border-gray-50">
                <label className="text-sm font-semibold text-gray-700">Borrow Duration (Days)</label>
                <div className="md:col-span-2 relative">
                  <input
                    type="number"
                    name="borrowDuration"
                    min="1"
                    max="90"
                    required
                    value={settings.borrowDuration}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a237e]/30 bg-gray-50/30"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Default return period allowed per book (in days).</p>
                </div>
              </div>


              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center pt-4 border-t border-gray-50">
                <label className="text-sm font-semibold text-gray-700">Overdue Fine Rate ($)</label>
                <div className="md:col-span-2 relative">
                  <input
                    type="number"
                    step="0.01"
                    name="fineRate"
                    min="0"
                    max="10"
                    required
                    value={settings.fineRate}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a237e]/30 bg-gray-50/30"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Fine charged per day for overdue book returns.</p>
                </div>
              </div>


              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center pt-4 border-t border-gray-50">
                <label className="text-sm font-semibold text-gray-700">Librarian Live Chat</label>
                <div className="md:col-span-2 flex items-center">
                  <input
                    type="checkbox"
                    name="enableChat"
                    id="enableChat"
                    checked={settings.enableChat === 'true'}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="enableChat" className="text-xs text-gray-500 ml-2 cursor-pointer">
                    Enable real-time Librarian support chat globally for members.
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-end gap-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-[#1a237e] hover:bg-[#0d155e] text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-sm hover:shadow"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving Changes...
                  </>
                ) : (
                  'Apply Configurations'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
};

export default SystemSettings;
