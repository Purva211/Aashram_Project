import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { FaPlus, FaTrash, FaEdit, FaCheck, FaTimes } from 'react-icons/fa';
import { usePermissions } from '../../hooks/usePermissions';

const Bulletins = () => {
  const [bulletins, setBulletins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ headline: '', messages: [''], isActive: true });
  const [error, setError] = useState('');
  const { hasManage } = usePermissions('Sansthan Updates');

  useEffect(() => {
    fetchBulletins();
  }, []);

  const fetchBulletins = async () => {
    try {
      const res = await api.get('/bulletins');
      if (res.data.success) {
        setBulletins(res.data.bulletins);
      }
    } catch (err) {
      console.error("Error fetching bulletins", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMessage = () => {
    setFormData({ ...formData, messages: [...formData.messages, ''] });
  };

  const handleMessageChange = (index, value) => {
    const newMessages = [...formData.messages];
    newMessages[index] = value;
    setFormData({ ...formData, messages: newMessages });
  };

  const handleRemoveMessage = (index) => {
    if (formData.messages.length > 1) {
      const newMessages = formData.messages.filter((_, i) => i !== index);
      setFormData({ ...formData, messages: newMessages });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // Clean empty messages
      const cleanMessages = formData.messages.filter(m => m.trim() !== '');
      if (!formData.headline.trim() || cleanMessages.length === 0) {
        setError('Headline and at least one message are required.');
        return;
      }
      
      const payload = { ...formData, messages: cleanMessages };
      
      let res;
      if (editingId) {
        res = await api.put(`/bulletins/${editingId}`, payload);
      } else {
        res = await api.post('/bulletins', payload);
      }

      if (res.data.success) {
        setShowAddForm(false);
        setEditingId(null);
        setFormData({ headline: '', messages: [''], isActive: true });
        fetchBulletins();
      }
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${editingId ? 'update' : 'create'} update`);
    }
  };

  const handleEdit = (bulletin) => {
    setFormData({
      headline: bulletin.headline,
      messages: bulletin.messages,
      isActive: bulletin.isActive
    });
    setEditingId(bulletin._id);
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this update?")) {
      try {
        await api.delete(`/bulletins/${id}`);
        fetchBulletins();
      } catch (err) {
        console.error("Failed to delete", err);
      }
    }
  };

  const toggleStatus = async (bulletin) => {
    try {
      await api.put(`/bulletins/${bulletin._id}`, { ...bulletin, isActive: !bulletin.isActive });
      fetchBulletins();
    } catch (err) {
      console.error("Failed to toggle status", err);
    }
  };

  if (loading) return <div className="p-8">Loading updates...</div>;

  return (
    <div className="p-6 md:p-10 w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-caramel-deep font-serif flex flex-wrap items-center gap-2">
          Manage Sansthan Updates
          {!hasManage && <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full shadow-sm font-sans inline-block align-middle">View Only Access</span>}
        </h1>
        {hasManage && (
          <div className="w-full md:w-auto">
            <button 
              onClick={() => {
                setShowAddForm(!showAddForm);
                if (!showAddForm) {
                  setEditingId(null);
                  setFormData({ headline: '', messages: [''], isActive: true });
                }
              }}
              className="flex justify-center items-center gap-2 bg-slate-900 hover:bg-black text-white px-6 py-2.5 rounded-xl shadow-md transition-colors font-black w-full md:w-auto"
            >
              {showAddForm ? <><FaTimes /> Cancel</> : <><FaPlus /> Add Update</>}
            </button>
          </div>
        )}
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-stone-200 mb-10">
          <h2 className="text-xl font-bold mb-6 text-caramel-dark">{editingId ? 'Edit Update' : 'Create New Update'}</h2>
          
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm">{error}</div>}
          
          <div className="mb-6">
            <label className="block text-sm font-bold text-stone-600 mb-2">Headline</label>
            <input 
              type="text" 
              value={formData.headline}
              onChange={(e) => setFormData({...formData, headline: e.target.value})}
              className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="e.g. Mahashivratri Special"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold text-stone-600 mb-2">Messages (Bullet Points)</label>
            {formData.messages.map((msg, index) => (
              <div key={index} className="flex gap-3 mb-3">
                <input 
                  type="text" 
                  value={msg}
                  onChange={(e) => handleMessageChange(index, e.target.value)}
                  className="flex-1 border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder={`Message ${index + 1}`}
                />
                <button 
                  type="button" 
                  onClick={() => handleRemoveMessage(index)}
                  className="bg-red-50 text-red-500 px-4 rounded-xl hover:bg-red-100 transition-colors"
                  disabled={formData.messages.length === 1}
                >
                  <FaTrash />
                </button>
              </div>
            ))}
            <button 
              type="button" 
              onClick={handleAddMessage}
              className="text-primary font-bold text-sm mt-2 hover:text-gold flex items-center gap-2"
            >
              <FaPlus size={12} /> Add another message
            </button>
          </div>

          <div className="flex items-center gap-3 mb-8">
            <input 
              type="checkbox" 
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
              className="w-5 h-5 accent-primary"
            />
            <label htmlFor="isActive" className="font-semibold text-stone-700">Set as Active</label>
          </div>

          <button type="submit" className="bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 px-8 rounded-xl shadow-md hover:shadow-lg transition-all w-full md:w-auto">
            {editingId ? 'Save Changes' : 'Publish Update'}
          </button>
        </form>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                <th className="py-4 px-6 font-bold text-stone-600">Headline</th>
                <th className="py-4 px-6 font-bold text-stone-600">Messages</th>
                <th className="py-4 px-6 font-bold text-stone-600">Status</th>
                <th className="py-4 px-6 font-bold text-stone-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bulletins.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-stone-500">No updates found.</td>
                </tr>
              ) : (
                bulletins.map((bulletin) => (
                  <tr key={bulletin._id} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                    <td className="py-4 px-6 font-bold text-caramel-deep">{bulletin.headline}</td>
                    <td className="py-4 px-6">
                      <ul className="list-disc pl-4 text-sm text-stone-600">
                        {bulletin.messages.map((m, i) => <li key={i}>{m}</li>)}
                      </ul>
                    </td>
                    <td className="py-4 px-6">
                      <button 
                        onClick={() => hasManage && toggleStatus(bulletin)}
                        disabled={!hasManage}
                        className={`px-3 py-1 text-xs font-bold rounded-full ${bulletin.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} ${!hasManage && 'cursor-not-allowed opacity-80'}`}
                      >
                        {bulletin.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-4 px-6 text-right flex items-center justify-end gap-2">
                      {hasManage ? (
                        <>
                          <button 
                            onClick={() => handleEdit(bulletin)}
                            className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                            title="Edit Update"
                          >
                            <FaEdit />
                          </button>
                          <button 
                            onClick={() => handleDelete(bulletin._id)}
                            className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                            title="Delete Update"
                          >
                            <FaTrash />
                          </button>
                        </>
                      ) : (
                        <div className="text-xs text-gray-400 font-bold">View Only</div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Bulletins;
