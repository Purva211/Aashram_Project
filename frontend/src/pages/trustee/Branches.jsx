import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMapMarkerAlt, FaPlus, FaEdit, FaTrash, FaTimes, FaSave } from 'react-icons/fa';
import { usePermissions } from '../../hooks/usePermissions';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ManageBranches = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBranch, setCurrentBranch] = useState(null);
  const [formData, setFormData] = useState({ name: '', location: '', contact: '', description: '' });
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const { hasManage } = usePermissions('Branches');

  // Firebase auth token is handled by the api interceptor

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const response = await api.get('/branches');
      setBranches(response.data.branches);
    } catch (error) {
      console.error('Error fetching branches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (branch = null) => {
    if (branch) {
      setCurrentBranch(branch);
      setFormData({ name: branch.name, location: branch.location, contact: branch.contact || '', description: branch.description || '' });
    } else {
      setCurrentBranch(null);
      setFormData({ name: '', location: '', contact: '', description: '' });
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentBranch(null);
    setFormData({ name: '', location: '', contact: '', description: '' });
    setImageFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      if (imageFile) {
        data.append('image', imageFile);
      }

      if (currentBranch) {
        await api.put(`/branches/${currentBranch._id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/branches', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      fetchBranches();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving branch:', error);
      alert('Error saving branch. Make sure you are authenticated.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this branch?')) {
      try {
        await api.delete(`/branches/${id}`);
        fetchBranches();
      } catch (error) {
        console.error('Error deleting branch:', error);
        alert('Error deleting branch.');
      }
    }
  };

  const uniqueLocations = [...new Set(branches.map(b => b.location?.split(',')[0]?.trim()).filter(Boolean))];

  const filteredBranches = branches.filter(b => 
    (b.name.toLowerCase().includes(searchTerm.toLowerCase()) || b.location?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterLocation ? b.location?.toLowerCase().includes(filterLocation.toLowerCase()) : true)
  );

  return (
    <div className="h-full flex flex-col relative z-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-deepblue-900 mb-2 font-serif flex items-center tracking-tight">Trust Branches
            {!hasManage && <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full shadow-sm ml-4 font-sans inline-block align-middle">View Only Access</span>}
          </h1>
          <p className="text-gray-500">Manage all spiritual centers and ashrams.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Search branches..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-saffron-500 shadow-sm w-full sm:w-auto"
          />
          <select 
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-saffron-500 shadow-sm cursor-pointer w-full sm:w-auto"
          >
            <option value="">All Locations</option>
            {uniqueLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
          </select>
          {hasManage && (
            <button
              onClick={() => handleOpenModal()}
              className="flex justify-center items-center gap-2 bg-slate-900 hover:bg-black text-white px-6 py-2.5 rounded-xl shadow-lg transition-all font-black hover:-translate-y-0.5 whitespace-nowrap w-full sm:w-auto"
            >
              <FaPlus /> Add Branch
            </button>
          )}
        </div>
      </div>

      <div className="md:bg-white md:rounded-2xl md:shadow-xl md:border md:border-gray-100 flex-1 overflow-hidden flex flex-col relative z-20">
        <div className="w-full flex-1">
          <table className="w-full text-left block md:table">
            <thead className="hidden md:table-header-group">
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm uppercase tracking-wider">
                <th className="p-4 md:p-6 font-semibold">Branch Name</th>
                <th className="p-4 md:p-6 font-semibold">Location</th>
                <th className="p-4 md:p-6 font-semibold">Contact Info</th>
                <th className="p-4 md:p-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="block md:table-row-group w-full divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-12 text-gray-500 block md:table-cell">Loading branches...</td>
                </tr>
              ) : filteredBranches.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-12 text-gray-500 block md:table-cell">No branches found.</td>
                </tr>
              ) : (
                filteredBranches.map((branch) => (
                  <tr key={branch._id} className="flex flex-col md:table-row w-full bg-white md:bg-transparent border border-gray-100 md:border-b md:border-x-0 md:border-t-0 md:border-gray-50 rounded-xl md:rounded-none mb-4 md:mb-0 shadow-sm md:shadow-none hover:bg-gray-50/50">
                    <td className="p-3 md:p-6 flex flex-col md:table-cell w-full border-b border-gray-50 md:border-none">
                      <div className="flex md:hidden justify-between items-start mb-3">
                        <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded">Branch</span>
                      </div>
                      <div>
                        <div className="font-bold text-deepblue-900 text-lg md:text-base break-words whitespace-normal">{branch.name}</div>
                        <div className="md:hidden mt-2 text-sm text-gray-600 flex flex-col gap-1">
                          <div className="flex items-center gap-2"><FaMapMarkerAlt className="text-saffron-500 shrink-0" /> <span className="break-words">{branch.location}</span></div>
                          <div className="text-gray-500 text-xs mt-1 break-words">Contact: {branch.contact || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden md:table-cell p-4 md:p-6 text-gray-600">
                      <div className="flex items-center gap-2">
                        <FaMapMarkerAlt className="text-saffron-500 shrink-0" /> {branch.location}
                      </div>
                    </td>
                    <td className="hidden md:table-cell p-4 md:p-6 text-gray-600">
                      {branch.contact || 'N/A'}
                    </td>
                    <td className="p-3 md:p-6 md:text-right flex flex-col md:table-cell w-full bg-gray-50 md:bg-transparent rounded-b-xl md:rounded-none">
                      <div className="flex justify-between items-center w-full">
                        <span className="md:hidden text-xs text-gray-500 uppercase tracking-wider font-semibold px-1">Actions</span>
                        {hasManage ? (
                          <div className="flex flex-wrap justify-end gap-2 w-full md:w-auto">
                            <button
                              onClick={() => handleOpenModal(branch)}
                              className="p-2 w-10 h-10 md:w-10 md:h-10 flex-1 md:flex-none flex items-center justify-center bg-white md:bg-blue-50 border border-gray-200 md:border-none text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-colors shadow-sm md:shadow-none"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDelete(branch._id)}
                              className="p-2 w-10 h-10 md:w-10 md:h-10 flex-1 md:flex-none flex items-center justify-center bg-white md:bg-red-50 border border-gray-200 md:border-none text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-colors shadow-sm md:shadow-none"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400 font-bold inline-block w-full text-right md:w-auto">View Only</div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Add/Edit */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-deepblue-900/60 backdrop-blur-sm"
              onClick={handleCloseModal}
            ></motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative z-10 flex flex-col max-h-[90vh] overflow-hidden"
            >
              <div className="bg-white p-6 pb-2 flex justify-between items-center shrink-0 border-b border-gray-100">
                <h3 className="text-2xl font-black font-serif text-mahakal-burgundy">{currentBranch ? 'Edit Branch' : 'Add New Branch'}</h3>
                <button type="button" onClick={handleCloseModal} className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors flex items-center justify-center cursor-pointer z-50">
                  <FaTimes className="text-xl" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 overflow-y-auto custom-scrollbar">
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Branch Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-saffron-500 focus:ring-2 focus:ring-saffron-200 outline-none transition-all"
                      placeholder="e.g. Main Ashram, Pune"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-saffron-500 focus:ring-2 focus:ring-saffron-200 outline-none transition-all"
                      placeholder="e.g. Pune, Maharashtra"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Info (Optional)</label>
                    <input
                      type="text"
                      value={formData.contact}
                      onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-saffron-500 focus:ring-2 focus:ring-saffron-200 outline-none transition-all"
                      placeholder="e.g. +91 9876543210"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-saffron-500 focus:ring-2 focus:ring-saffron-200 outline-none transition-all resize-y min-h-[100px]"
                      placeholder="About this branch..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Branch Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files[0])}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none transition-all"
                    />
                  </div>
                  {currentBranch && currentBranch.members && currentBranch.members.length > 0 && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Branch Members (Read-only)</label>
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 max-h-48 overflow-y-auto">
                        <ul className="space-y-3">
                          {currentBranch.members.map((member, idx) => (
                            <li key={idx} className="flex flex-col text-sm border-b border-gray-200 pb-2 last:border-0 last:pb-0">
                              <span className="font-bold text-gray-800">{member.name}</span>
                              <span className="text-gray-600 text-xs">Contact: {member.contact || 'N/A'}</span>
                              <span className="text-gray-600 text-xs">Email: {member.email || 'N/A'}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 pt-4 flex flex-col md:flex-row justify-end gap-3 sticky bottom-[-24px] bg-white border-t border-gray-100 z-10 pb-6 -mx-6 px-6">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="w-full md:w-auto px-6 py-3 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 transition-colors order-2 md:order-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full md:w-auto px-6 py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-black transition-all shadow-lg shadow-gray-900/30 hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2 order-1 md:order-2"
                  >
                    <FaSave /> {submitting ? 'Saving...' : 'Save Branch'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageBranches;




