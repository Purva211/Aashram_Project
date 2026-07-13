import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiUsers, FiX, FiCheck, FiSearch, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import api from "../../utils/api";
import { useTableFeatures } from '../../hooks/useTableFeatures';
import TablePagination from '../../components/TablePagination';
import { usePermissions } from '../../hooks/usePermissions';

const ManageLineage = () => {
  const [lineageMembers, setLineageMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '', era: '', shortDescription: '', biography: '', status: 'Draft', parentId: ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [documents, setDocuments] = useState([]);

  const {
    searchTerm, setSearchTerm, sortConfig, handleSort,
    currentPage, setCurrentPage, itemsPerPage, setItemsPerPage,
    totalPages, paginatedData, totalItems
  } = useTableFeatures(lineageMembers, ['name', 'era', 'status']);
  const { hasManage } = usePermissions('Lineage');

  const fetchMembers = async () => {
    try {
      const res = await api.get('/lineage');
      setLineageMembers(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const form = new FormData();
      Object.keys(formData).forEach(key => {
        if(formData[key]) form.append(key, formData[key]);
      });
      
      if(profileImage) form.append('profileImage', profileImage);
      if(galleryImages) {
          Array.from(galleryImages).forEach(file => form.append('galleryImages', file));
      }
      if(documents) {
          Array.from(documents).forEach(file => form.append('documents', file));
      }

      if (editingId) {
        await api.put(`/lineage/${editingId}`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/lineage', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setIsModalOpen(false);
      setEditingId(null);
      fetchMembers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving member');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this Guru Parampara member?")) {
      try {
        await api.delete(`/lineage/${id}`);
        fetchMembers();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const openEdit = (member) => {
    setFormData({
      name: member.name,
      era: member.era,
      shortDescription: member.shortDescription,
      biography: member.biography,
      status: member.status || 'Draft',
      parentId: member.parentId ? member.parentId._id : ''
    });
    setProfileImage(null);
    setGalleryImages([]);
    setDocuments([]);
    setEditingId(member._id);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '', era: '', shortDescription: '', biography: '', status: 'Draft', parentId: ''
    });
    setProfileImage(null);
    setGalleryImages([]);
    setDocuments([]);
    setEditingId(null);
  };

  const toggleStatus = async (id, currentStatus) => {
      const newStatus = currentStatus === 'Published' ? 'Draft' : 'Published';
      try {
          await api.patch(`/lineage/${id}/status`, { status: newStatus });
          fetchMembers();
      } catch (err) {
          alert('Error updating status');
      }
  };

  if (loading) return <div className="h-64 flex items-center justify-center"><div className="w-8 h-8 border-4 border-saffron-500 rounded-full border-t-transparent animate-spin"></div></div>;

  return (
    <div className="w-full space-y-6 text-gray-800 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold flex items-center gap-2 text-slate-900 tracking-tight">
            <FiUsers className="text-saffron-500" /> Guru Parampara (Lineage)
            {!hasManage && <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full shadow-sm ml-2 font-sans inline-block align-middle">View Only Access</span>}
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage the sacred lineage, profiles, and hierarchy of Gurus.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:w-auto">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search members..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full sm:w-64 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500 shadow-sm transition-all"
            />
          </div>
          {hasManage && (
            lineageMembers.length >= 37 ? (
               <div className="bg-red-50 text-red-600 px-4 py-2.5 rounded-xl font-bold border border-red-100 text-sm flex items-center whitespace-nowrap">
                  Limit Reached (37/37)
               </div>
            ) : (
              <button 
                onClick={() => { resetForm(); setIsModalOpen(true); }}
                className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 rounded-xl font-black transition-colors shadow-lg flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <FiPlus /> Add Member
              </button>
            )
          )}
        </div>
      </div>

      <div className="md:bg-white md:border md:border-gray-100 md:shadow-sm md:rounded-2xl overflow-hidden relative z-10">
        <div className="w-full overflow-hidden">
          <table className="w-full text-left border-collapse block md:table">
            <thead className="hidden md:table-header-group">
              <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                <th className="p-4 md:p-6 font-bold cursor-pointer" onClick={() => handleSort('name')}>Guru Name</th>
                <th className="p-4 md:p-6 font-bold cursor-pointer" onClick={() => handleSort('era')}>Era</th>
                <th className="p-4 md:p-6 font-bold">Parent (Predecessor)</th>
                <th className="p-4 md:p-6 font-bold cursor-pointer" onClick={() => handleSort('status')}>Status</th>
                <th className="p-4 md:p-6 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="block md:table-row-group w-full divide-y divide-gray-100 text-sm">
              {paginatedData.map(member => (
                <tr key={member._id} className="flex flex-col md:table-row w-full bg-white md:bg-transparent border border-gray-100 md:border-b md:border-x-0 md:border-t-0 md:border-gray-50 rounded-xl md:rounded-none mb-4 md:mb-0 shadow-sm md:shadow-none hover:bg-gray-50/50">
                  <td className="p-4 md:p-6 flex flex-col md:table-cell w-full border-b border-gray-50 md:border-none">
                    <div className="flex md:hidden justify-between items-start mb-3">
                      <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded break-words max-w-[60%]">Era: {member.era}</span>
                      <button 
                         onClick={() => hasManage && toggleStatus(member._id, member.status)}
                         disabled={!hasManage}
                         className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors shrink-0 ${member.status === 'Published' ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100' : member.status === 'Pending' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'} ${!hasManage && 'cursor-not-allowed opacity-80'}`}>
                        {member.status}
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      {member.profileImage && <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${member.profileImage.startsWith('/') ? '' : '/'}${member.profileImage}`} alt={member.name} className="w-12 h-12 md:w-10 md:h-10 rounded-full object-cover border shrink-0" />}
                      <div>
                        <div className="font-bold text-slate-900 text-lg md:text-base break-words whitespace-normal">{member.name}</div>
                        <div className="md:hidden text-xs text-gray-500 mt-0.5 break-words">Parent: {member.parentId ? member.parentId.name : <span className="italic text-gray-400">None (Root)</span>}</div>
                      </div>
                    </div>
                  </td>
                  <td className="hidden md:table-cell p-4 md:p-6 text-gray-600 break-words whitespace-normal">
                    {member.era}
                  </td>
                  <td className="hidden md:table-cell p-4 md:p-6 text-gray-600 break-words whitespace-normal">
                    {member.parentId ? member.parentId.name : <span className="text-gray-400 italic">None (Root)</span>}
                  </td>
                  <td className="hidden md:table-cell p-4 md:p-6">
                    <button 
                       onClick={() => hasManage && toggleStatus(member._id, member.status)}
                       disabled={!hasManage}
                       className={`px-2.5 py-1 rounded-full text-xs font-bold border transition-colors inline-block ${member.status === 'Published' ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100' : member.status === 'Pending' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'} ${!hasManage && 'cursor-not-allowed opacity-80'}`}>
                      {member.status}
                    </button>
                  </td>
                  <td className="p-3 md:p-6 md:text-right flex flex-col md:table-cell w-full bg-gray-50 md:bg-transparent rounded-b-xl md:rounded-none">
                    <div className="flex justify-between items-center w-full">
                      <span className="md:hidden text-xs text-gray-500 uppercase tracking-wider font-semibold px-1">Actions</span>
                      {hasManage ? (
                        <div className="flex flex-wrap md:justify-end gap-2 w-full md:w-auto justify-end">
                          <button onClick={() => openEdit(member)} className="p-2 w-10 h-10 md:w-auto md:h-auto flex-1 md:flex-none flex items-center justify-center bg-white md:bg-transparent border border-gray-200 md:border-none text-blue-600 hover:bg-blue-50 rounded-lg transition-colors shadow-sm md:shadow-none"><FiEdit2 /></button>
                          <button onClick={() => handleDelete(member._id)} className="p-2 w-10 h-10 md:w-auto md:h-auto flex-1 md:flex-none flex items-center justify-center bg-white md:bg-transparent border border-gray-200 md:border-none text-red-500 hover:bg-red-50 rounded-lg transition-colors shadow-sm md:shadow-none"><FiTrash2 /></button>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400 font-bold inline-block w-full text-right md:w-auto">View Only Access</div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <TablePagination 
          currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage}
          totalItems={totalItems} itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage}
        />
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col relative z-10 border border-gray-100 overflow-hidden">
              <div className="bg-white p-6 border-b border-gray-100 flex justify-between items-center z-20 shrink-0">
                <h2 className="text-xl font-bold text-slate-900">{editingId ? 'Edit Profile' : 'Add Guru Profile'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-full"><FiX size={20} /></button>
              </div>
              <div className="p-6 overflow-y-auto custom-scrollbar">
                <form id="lineage-form" onSubmit={handleSubmit} className="space-y-6">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Guru Name</label>
                      <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Era</label>
                      <input required type="text" value={formData.era} onChange={e => setFormData({...formData, era: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800" placeholder="e.g. 19th Century" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Predecessor (Parent Guru)</label>
                      <select value={formData.parentId} onChange={e => setFormData({...formData, parentId: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 appearance-none">
                        <option value="">None (Root Founder)</option>
                        {lineageMembers.filter(m => m._id !== editingId).map(m => (
                            <option key={m._id} value={m._id}>{m.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Status</label>
                      <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 appearance-none">
                        <option value="Draft">Draft</option>
                        <option value="Pending">Pending Approval</option>
                        <option value="Published">Published</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Short Description</label>
                    <input required type="text" value={formData.shortDescription} onChange={e => setFormData({...formData, shortDescription: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800" placeholder="Brief 1-2 sentence description" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Full Biography</label>
                    <textarea required rows="8" value={formData.biography} onChange={e => setFormData({...formData, biography: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 resize-none"></textarea>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-100 pt-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Profile Image</label>
                      <input type="file" onChange={e => setProfileImage(e.target.files[0])} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-saffron-50 file:text-saffron-700 hover:file:bg-saffron-100" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Gallery Images</label>
                      <input type="file" multiple onChange={e => setGalleryImages(e.target.files)} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-saffron-50 file:text-saffron-700 hover:file:bg-saffron-100" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Documents / Books</label>
                      <input type="file" multiple onChange={e => setDocuments(e.target.files)} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-saffron-50 file:text-saffron-700 hover:file:bg-saffron-100" />
                    </div>
                  </div>
                </form>
              </div>
              <div className="p-6 md:p-8 bg-white border-t border-gray-100 flex flex-col md:flex-row justify-end gap-3 sticky bottom-0 z-20 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <button type="button" onClick={() => setIsModalOpen(false)} className="w-full md:w-auto px-5 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 font-bold transition-colors order-2 md:order-1">Cancel</button>
                <button type="submit" form="lineage-form" className="order-1 md:order-2 bg-blue-900 hover:bg-slate-900 w-full md:w-auto justify-center text-white px-8 py-2.5 rounded-xl font-black transition-colors shadow-lg">
                  {editingId ? 'Save Changes' : 'Create Profile'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageLineage;



