import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMapMarkerAlt, FaEdit, FaTimes, FaSave, FaPlus, FaTrash } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ManageBranches = () => {
  const { user } = useAuth();
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBranch, setCurrentBranch] = useState(null);
  
  const [formData, setFormData] = useState({ name: '', location: '', contact: '', description: '' });
  const [imageFile, setImageFile] = useState(null);
  const [members, setMembers] = useState([]);
  
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLocation, setFilterLocation] = useState("");

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

  const handleOpenModal = (branch) => {
    setCurrentBranch(branch);
    setFormData({ name: branch.name, location: branch.location, contact: branch.contact || '', description: branch.description || '' });
    setMembers(branch.members || []);
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentBranch(null);
    setFormData({ name: '', location: '', contact: '', description: '' });
    setMembers([]);
    setImageFile(null);
  };

  const handleAddMember = () => {
    setMembers([...members, { name: '', contact: '', email: '' }]);
  };

  const handleRemoveMember = (index) => {
    const newMembers = [...members];
    newMembers.splice(index, 1);
    setMembers(newMembers);
  };

  const handleMemberChange = (index, field, value) => {
    const newMembers = [...members];
    newMembers[index][field] = value;
    setMembers(newMembers);
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
      
      // Send members as a JSON string
      data.append('members', JSON.stringify(members.filter(m => m.name.trim() !== '')));

      await api.put(`/branches/${currentBranch._id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      
      fetchBranches();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving branch:', error);
      alert('Error saving branch. Make sure you are authenticated.');
    } finally {
      setSubmitting(false);
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
          <h1 className="text-3xl font-bold text-deepblue-900 mb-2 font-serif">Branch Details</h1>
          <p className="text-gray-500">View branches and update your assigned branch.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Search branches..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-saffron-500 shadow-sm"
          />
          <select 
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-saffron-500 shadow-sm cursor-pointer"
          >
            <option value="">All Locations</option>
            {uniqueLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 flex-1 overflow-hidden flex flex-col relative z-20">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm uppercase tracking-wider">
                <th className="p-6 font-semibold">Branch Name</th>
                <th className="p-6 font-semibold">Location</th>
                <th className="p-6 font-semibold">Contact Info</th>
                <th className="p-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-12 text-gray-500">Loading branches...</td>
                </tr>
              ) : filteredBranches.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-12 text-gray-500">No branches found.</td>
                </tr>
              ) : (
                filteredBranches.map((branch) => (
                  <tr key={branch._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-6">
                      <div className="font-bold text-deepblue-900">{branch.name}</div>
                      {user?.branch === branch._id && (
                        <span className="inline-block mt-1 bg-saffron-100 text-saffron-700 text-xs px-2 py-0.5 rounded-md font-bold">Assigned to You</span>
                      )}
                    </td>
                    <td className="p-6 text-gray-600">
                      <div className="flex items-center gap-2">
                        <FaMapMarkerAlt className="text-saffron-500" /> {branch.location}
                      </div>
                    </td>
                    <td className="p-6 text-gray-600">{branch.contact || 'N/A'}</td>
                    <td className="p-6 text-right">
                      {user?.branch === branch._id ? (
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => handleOpenModal(branch)}
                            className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors"
                            title="Edit Assigned Branch"
                          >
                            <FaEdit />
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm italic">Read-only</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Edit */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
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
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden flex flex-col max-h-full"
            >
              <div className="bg-white px-8 py-6 border-b border-gray-100 flex justify-between items-center shrink-0 sticky top-0 z-50">
                <div>
                  <h3 className="text-2xl font-black text-deepblue-900 tracking-tight">Edit Your Branch</h3>
                  <p className="text-sm text-gray-500 font-medium mt-1">Update branch details and contact information.</p>
                </div>
                <button type="button" onClick={handleCloseModal} className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors flex items-center justify-center cursor-pointer z-50">
                  <FaTimes className="text-xl" />
                </button>
              </div>
              
              <div className="overflow-y-auto p-6">
                <form id="branch-form" onSubmit={handleSubmit} className="space-y-6">
                  {/* Branch Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Branch Name <span className="text-gray-400 text-xs font-normal ml-2">(Contact Trustee to change)</span></label>
                      <input
                        type="text"
                        value={formData.name}
                        disabled
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed outline-none font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Location <span className="text-gray-400 text-xs font-normal ml-2">(Contact Trustee to change)</span></label>
                      <input
                        type="text"
                        value={formData.location}
                        disabled
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed outline-none font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Info</label>
                      <input
                        type="text"
                        value={formData.contact}
                        onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-saffron-500 focus:ring-2 focus:ring-saffron-200 outline-none transition-all"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-saffron-500 focus:ring-2 focus:ring-saffron-200 outline-none transition-all resize-y min-h-[100px]"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Update Branch Image</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files[0])}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Branch Members Dynamic Form */}
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h4 className="text-lg font-bold text-slate-800">Branch Members</h4>
                        <p className="text-xs text-gray-500">Add committee members or administrators.</p>
                      </div>
                      <button 
                        type="button" 
                        onClick={handleAddMember}
                        className="text-sm flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-1.5 px-3 rounded-lg font-bold transition-colors"
                      >
                        <FaPlus size={12} /> Add Member
                      </button>
                    </div>

                    {members.length === 0 ? (
                      <div className="text-center py-6 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
                        <p className="text-sm text-gray-500">No members added yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {members.map((member, idx) => (
                          <div key={idx} className="flex flex-col sm:flex-row gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100 relative group">
                            <button 
                              type="button"
                              onClick={() => handleRemoveMember(idx)}
                              className="absolute -right-2 -top-2 bg-red-100 hover:bg-red-500 text-red-600 hover:text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                            >
                              <FaTimes size={10} />
                            </button>
                            <div className="flex-1">
                              <label className="block text-xs font-semibold text-gray-600 mb-1">Name <span className="text-red-500">*</span></label>
                              <input 
                                type="text"
                                value={member.name}
                                onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500 outline-none"
                                placeholder="Member Name"
                                required
                              />
                            </div>
                            <div className="flex-1">
                              <label className="block text-xs font-semibold text-gray-600 mb-1">Contact</label>
                              <input 
                                type="text"
                                value={member.contact}
                                onChange={(e) => handleMemberChange(idx, 'contact', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500 outline-none"
                                placeholder="Phone Number"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
                              <input 
                                type="email"
                                value={member.email}
                                onChange={(e) => handleMemberChange(idx, 'email', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500 outline-none"
                                placeholder="Email Address"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </form>
              </div>

              <div className="p-6 bg-white border-t border-gray-100 shrink-0 flex justify-end gap-3 rounded-b-2xl sticky bottom-0 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <div className="flex justify-end gap-3 w-full">
                  <button 
                    type="button" 
                    onClick={handleCloseModal}
                    className="w-1/3 py-3.5 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    disabled={submitting} 
                    type="submit" 
                    form="branch-form"
                    className="w-2/3 flex justify-center items-center gap-2 py-3.5 bg-black hover:bg-gray-900 text-white font-black rounded-xl hover:bg-gray-900 transition-all shadow-lg shadow-black/30 hover:-translate-y-0.5 disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : 'Save Branch Details'}
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageBranches;
