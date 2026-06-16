import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiTrash2, FiBell, FiX, FiCheckCircle, FiClock, FiSend, FiFileText, FiBarChart2, FiUsers, FiMapPin, FiMessageCircle, FiMail, FiSmartphone, FiSearch, FiUser, FiEye } from 'react-icons/fi';
import api from "../../utils/api";
import { useTableFeatures } from '../../hooks/useTableFeatures';
import TablePagination from '../../components/TablePagination';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';

const Announcements = () => {
  const [activeTab, setActiveTab] = useState('list'); // 'list', 'analytics'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [branches, setBranches] = useState([]);
  const [trustees, setTrustees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newlyAddedId, setNewAddedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [ownershipFilter, setOwnershipFilter] = useState('all'); // 'all', 'mine', 'others'

  const { user } = useAuth();

  const filteredAnnouncements = announcements.filter(ann => {
    const creatorId = ann.createdBy?._id || ann.createdBy;
    const isMine = creatorId && String(creatorId) === String(user?._id);
    
    if (ownershipFilter === 'mine') return isMine;
    if (ownershipFilter === 'others') return !isMine;
    return true;
  });

  const {
    searchTerm, setSearchTerm, sortConfig, handleSort,
    currentPage, setCurrentPage, itemsPerPage, setItemsPerPage,
    totalPages, paginatedData, totalItems
  } = useTableFeatures(filteredAnnouncements, ['title', 'subject', 'message', 'status']);

  const availableRoles = [
    "Chairman", "Vice Chairman", "Secretary", "Treasurer", "Branch Manager", 
    "Document Handler", "Donation Manager", "Event Manager", "Annadan Manager", "Trust Member"
  ];

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    message: '',
    priority: 'Normal',
    audienceType: ['All Users'],
    targetBranches: [],
    targetRoles: [],
    targetUsers: [],
    displayLocations: ['Website Home Page'],
    status: 'Published',
    publishDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    whatsappIntegration: false,
    smsIntegration: false,
    emailIntegration: false,
    dashboardNotification: true,
  });

  useEffect(() => {
    fetchAnnouncements();
    fetchBranches();
    fetchTrustees();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await api.get('/announcements');
      setAnnouncements(res.data.data);
    } catch (err) {
      console.error("Failed to fetch announcements.", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const res = await api.get('/branches');
      setBranches(res.data.branches || res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch branches", err);
    }
  };

  const fetchTrustees = async () => {
    try {
      const res = await api.get('/trustees');
      setTrustees(res.data.trustees || res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch trustees", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      let res;
      if (editingId) {
        res = await api.put(`/announcements/${editingId}`, formData);
      } else {
        res = await api.post('/announcements', formData);
      }
      setIsModalOpen(false);
      setEditingId(null);
      resetForm();
      await fetchAnnouncements();
      
      if(res.data && res.data.data && res.data.data._id) {
        setNewAddedId(res.data.data._id);
        setTimeout(() => setNewAddedId(null), 5000); 
      }
      
    } catch (err) {
      alert(`Failed to save announcement. Server said: ${err.response?.data?.message || err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '', subject: '', message: '', priority: 'Normal', audienceType: ['All Users'],
      targetBranches: [], targetRoles: [], targetUsers: [], displayLocations: ['Website Home Page'], status: 'Published',
      publishDate: new Date().toISOString().split('T')[0], expiryDate: '',
      whatsappIntegration: false, smsIntegration: false, emailIntegration: false, dashboardNotification: true,
    });
  };

  const handleEdit = (ann) => {
    setEditingId(ann._id);
    setFormData({
      title: ann.title || '',
      subject: ann.subject || '',
      message: ann.message || '',
      priority: ann.priority || 'Normal',
      audienceType: ann.audienceType || ['All Users'],
      targetBranches: ann.targetBranches || [],
      targetRoles: ann.targetRoles || [],
      targetUsers: ann.targetUsers || [],
      displayLocations: ann.displayLocations || ['Website Home Page'],
      status: ann.status || 'Published',
      publishDate: ann.publishDate ? new Date(ann.publishDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      expiryDate: ann.expiryDate ? new Date(ann.expiryDate).toISOString().split('T')[0] : '',
      whatsappIntegration: ann.whatsappIntegration || false,
      smsIntegration: ann.smsIntegration || false,
      emailIntegration: ann.emailIntegration || false,
      dashboardNotification: ann.dashboardNotification ?? true,
    });
    setIsModalOpen(true);
  };

  const handleOpenNew = () => {
    setEditingId(null);
    resetForm();
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if(window.confirm("Delete this announcement permanently?")) {
      try {
        await api.delete(`/announcements/${id}`);
        fetchAnnouncements();
      } catch (err) {
        console.error("Failed to delete.", err);
      }
    }
  };

  const toggleBranch = (branchId) => {
    const current = formData.targetBranches || [];
    setFormData({
      ...formData,
      targetBranches: current.includes(branchId) ? current.filter(id => id !== branchId) : [...current, branchId]
    });
  };

  const toggleRole = (role) => {
    const current = formData.targetRoles || [];
    setFormData({
      ...formData,
      targetRoles: current.includes(role) ? current.filter(r => r !== role) : [...current, role]
    });
  };

  const toggleAudienceType = (type) => {
    const current = formData.audienceType || [];
    setFormData({
      ...formData,
      audienceType: current.includes(type) ? current.filter(t => t !== type) : [...current, type]
    });
  };

  const toggleUser = (userId) => {
    const current = formData.targetUsers || [];
    setFormData({
      ...formData,
      targetUsers: current.includes(userId) ? current.filter(id => id !== userId) : [...current, userId]
    });
  };

  if (loading) return <div className="h-64 flex items-center justify-center"><div className="w-8 h-8 border-4 border-saffron-500 rounded-full border-t-transparent animate-spin"></div></div>;

  const totalReads = announcements.reduce((acc, ann) => acc + (ann.totalRead || 0), 0);

  return (
    <div className="w-full space-y-6 text-gray-800 pb-12 relative">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg text-white">
              <FiSend />
            </div>
            Communications & Broadcasts
          </h2>
          <p className="text-slate-500 mt-2 font-medium">Enterprise announcement engine with omnichannel distribution.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search announcements..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 w-64 shadow-sm transition-all"
            />
          </div>
          <button onClick={handleOpenNew} className="flex items-center gap-2 px-6 py-3 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all whitespace-nowrap">
            <FiPlus /> New Announcement
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex bg-white rounded-xl shadow-sm border border-slate-100 p-1 gap-1 w-full md:w-auto">
          <button onClick={() => setActiveTab('list')} className={`flex-1 md:flex-none md:px-8 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'list' ? 'bg-slate-900 text-white shadow' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
            <FiFileText className="inline mr-2" /> All Broadcasts
          </button>
          <button onClick={() => setActiveTab('analytics')} className={`flex-1 md:flex-none md:px-8 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'analytics' ? 'bg-indigo-500 text-white shadow' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
            <FiBarChart2 className="inline mr-2" /> Delivery Analytics
          </button>
        </div>
        
        {activeTab === 'list' && (
          <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <button onClick={() => setOwnershipFilter('all')} className={`px-4 py-2 text-xs font-bold transition-colors ${ownershipFilter === 'all' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}>All</button>
            <button onClick={() => setOwnershipFilter('mine')} className={`px-4 py-2 text-xs font-bold border-l border-gray-200 transition-colors ${ownershipFilter === 'mine' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}>My Broadcasts</button>
            <button onClick={() => setOwnershipFilter('others')} className={`px-4 py-2 text-xs font-bold border-l border-gray-200 transition-colors ${ownershipFilter === 'others' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}>Others</button>
          </div>
        )}
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        
        {/* LIST TAB */}
        {activeTab === 'list' && (
          <motion.div key="list" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            {paginatedData.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <FiBell className="mx-auto text-4xl text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium">No announcements found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {paginatedData.map((ann, index) => {
                  const isHighlighted = newlyAddedId ? ann._id === newlyAddedId : (index === 0 && new Date() - new Date(ann.createdAt) < 60000);
                  
                  // Priority-based background colors
                  const priorityBg = ann.priority === 'Urgent' ? 'bg-rose-50/80 border-rose-200' : 
                                     ann.priority === 'Important' ? 'bg-amber-50/80 border-amber-200' : 
                                     'bg-white border-slate-100';

                  return (
                    <motion.div 
                      key={ann._id} 
                      initial={isHighlighted ? { scale: 0.95, opacity: 0 } : {}}
                      animate={isHighlighted ? { scale: 1, opacity: 1 } : {}}
                      transition={{ duration: 0.4 }}
                      className={`rounded-2xl border ${isHighlighted ? 'border-saffron-300 shadow-saffron-100 bg-saffron-50/50 ring-2 ring-saffron-400' : priorityBg} p-6 flex flex-col md:flex-row gap-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden group`}
                    >
                      <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${ann.priority === 'Urgent' ? 'bg-rose-500' : ann.priority === 'Important' ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
                      
                      <div className="flex-1 pl-4">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          {isHighlighted && (
                            <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-md bg-saffron-500 text-white shadow-sm animate-pulse">
                              NEW
                            </span>
                          )}
                          <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-md ${
                            ann.status === 'Published' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 
                            ann.status === 'Scheduled' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 
                            'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}>
                            {ann.status === 'Published' ? <FiCheckCircle className="inline mr-1" /> : <FiClock className="inline mr-1" />}
                            {ann.status}
                          </span>
                          <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-md bg-purple-50 text-purple-700 border border-purple-100">
                            <FiUsers className="inline mr-1" /> {ann.audienceType}
                          </span>
                          <span className="text-xs text-slate-400 font-medium ml-2">{new Date(ann.publishDate).toLocaleDateString()}</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-1">{ann.title}</h3>
                        <p className="text-sm text-slate-500 mb-4 font-medium">{ann.subject || 'No Subject Provided'}</p>
                        
                        {/* Display Targeting Summary */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {ann.targetBranches && ann.targetBranches.length > 0 && (
                            <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-1 rounded font-bold border border-slate-200">
                              {ann.targetBranches.length} Branches
                            </span>
                          )}
                          {ann.targetRoles && ann.targetRoles.length > 0 && (
                            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-1 rounded font-bold border border-indigo-200">
                              {ann.targetRoles.length} Roles
                            </span>
                          )}
                          {ann.targetUsers && ann.targetUsers.length > 0 && (
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-1 rounded font-bold border border-emerald-200">
                              {ann.targetUsers.length} Users
                            </span>
                          )}
                        </div>

                        <div className="text-sm text-slate-600 whitespace-pre-wrap">{ann.message}</div>
                        
                        {/* Channels & Author */}
                        <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-4 border-t border-slate-50">
                          <div className="flex items-center gap-4">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Channels:</span>
                            <div className="flex gap-2">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${ann.dashboardNotification ? 'bg-blue-50 text-blue-500' : 'bg-gray-50 text-gray-300'}`} title="Dashboard"><FiBell /></div>
                              
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${ann.emailIntegration ? 'bg-indigo-50 text-indigo-500' : 'bg-gray-50 text-gray-300'}`} title="Email"><FiMail /></div>
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${ann.smsIntegration ? 'bg-orange-50 text-orange-500' : 'bg-gray-50 text-gray-300'}`} title="SMS"><FiSmartphone /></div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                              <FiEye /> {ann.totalRead || 0} Reads
                            </div>
                            {ann.createdBy && (
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                <FiUser className="text-slate-400" /> By Admin
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="md:w-32 flex flex-row md:flex-col items-center justify-center border-t md:border-t-0 md:border-l border-slate-100 gap-2 pt-4 md:pt-0">
                        <button onClick={() => handleEdit(ann)} className="w-full py-2.5 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">Edit</button>
                        <button onClick={() => handleDelete(ann._id)} className="w-full py-2.5 rounded-lg text-sm font-bold text-rose-500 hover:bg-rose-50 transition-colors">Delete</button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
            
            {paginatedData.length > 0 && (
              <div className="mt-6 rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                <TablePagination 
                  currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage}
                  totalItems={totalItems} itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage}
                />
              </div>
            )}
          </motion.div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-10 text-center">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-500 text-3xl">
              <FiBarChart2 />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Delivery Analytics</h3>
            <p className="text-slate-500 font-medium max-w-md mx-auto">Track Dashboard Read Status, Email settings across your enterprise notifications.</p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-10">
              <div className="p-6 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Total Sent</p>
                <p className="text-4xl font-black text-slate-900">{announcements.length}</p>
              </div>
              
              <div className="p-6 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-1">Email Enabled</p>
                <p className="text-4xl font-black text-blue-700">{announcements.filter(a => a.emailIntegration).length}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CREATE ANNOUNCEMENT MODAL */}
      {createPortal(
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50 shrink-0">
                <div>
                  <h3 className="text-xl font-black text-slate-900">{editingId ? 'Edit Broadcast' : 'Compose New Broadcast'}</h3>
                  <p className="text-sm text-slate-500 mt-1">{editingId ? 'Update the details below.' : 'Fill out the details below to distribute your message.'}</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 transition-colors">
                  <FiX className="text-xl" />
                </button>
              </div>
              
              {/* Modal Body (Scrollable) */}
              <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                <form id="announcementForm" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Left Column: Content */}
                  <div className="lg:col-span-2 space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Announcement Title *</label>
                      <input required type="text" value={formData.title} onChange={(e)=>setFormData({...formData, title: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" placeholder="e.g., Upcoming Temple Renovation" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Subject (Optional)</label>
                      <input type="text" value={formData.subject} onChange={(e)=>setFormData({...formData, subject: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" placeholder="Short description for notifications..." />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Message Content *</label>
                      <textarea required rows="8" value={formData.message} onChange={(e)=>setFormData({...formData, message: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all resize-none" placeholder="Write your full announcement here..." />
                    </div>
                  </div>

                  {/* Right Column: Settings */}
                  <div className="space-y-6">
                    {/* Priority & Status */}
                    <div className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <h4 className="font-bold text-slate-900 flex items-center gap-2"><FiClock className="text-indigo-500"/> Publishing</h4>
                      
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Status</label>
                        <select value={formData.status} onChange={(e)=>setFormData({...formData, status: e.target.value})} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500">
                          <option value="Draft">Draft</option>
                          <option value="Scheduled">Scheduled</option>
                          <option value="Published">Published (Immediate)</option>
                          <option value="Expired">Expired</option>
                        </select>
                      </div>

                      {formData.status === 'Scheduled' && (
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Publish Date</label>
                          <input type="date" value={formData.publishDate} onChange={(e)=>setFormData({...formData, publishDate: e.target.value})} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500" />
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Priority</label>
                        <select value={formData.priority} onChange={(e)=>setFormData({...formData, priority: e.target.value})} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500">
                          <option value="Normal">Normal</option>
                          <option value="Important">Important</option>
                          <option value="Urgent">Urgent</option>
                        </select>
                      </div>
                    </div>

                    {/* Audience Selection */}
                    <div className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <h4 className="font-bold text-slate-900 flex items-center gap-2"><FiUsers className="text-saffron-500"/> Audience Targeting</h4>
                      <p className="text-xs text-slate-500">Select any combination of broader audiences, specific roles, branches, or individual users. The announcement will be sent to anyone who matches <b>any</b> of your selections.</p>
                      
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Broad Audiences</label>
                        <div className="grid grid-cols-2 gap-2">
                          {['All Users', 'All Devotees', 'All Trust Members', 'All Branches'].map(type => (
                            <label key={type} className="flex items-center gap-2 cursor-pointer text-sm hover:bg-slate-100 p-2 rounded border border-transparent hover:border-slate-200 transition-colors bg-white shadow-sm">
                              <input type="checkbox" checked={formData.audienceType?.includes(type)} onChange={() => toggleAudienceType(type)} className="rounded text-saffron-500 focus:ring-saffron-500 w-4 h-4" />
                              <span className="text-slate-700 font-medium">{type}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200">
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Target Specific Branches</label>
                        <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar p-2 bg-white border border-slate-200 rounded-lg">
                          {branches.map(b => (
                            <label key={b._id} className="flex items-center gap-2 cursor-pointer text-sm hover:bg-slate-50 p-1 rounded">
                              <input type="checkbox" checked={formData.targetBranches.includes(b._id)} onChange={() => toggleBranch(b._id)} className="rounded text-saffron-500 focus:ring-saffron-500" />
                              <span className="text-slate-700">{b.name} ({b.location})</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200">
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Target Specific Roles</label>
                        <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar p-2 bg-white border border-slate-200 rounded-lg">
                          {availableRoles.map(role => (
                            <label key={role} className="flex items-center gap-2 cursor-pointer text-sm hover:bg-slate-50 p-1 rounded">
                              <input type="checkbox" checked={formData.targetRoles.includes(role)} onChange={() => toggleRole(role)} className="rounded text-saffron-500 focus:ring-saffron-500" />
                              <span className="text-slate-700">{role}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200">
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Target Individual Users</label>
                        <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar p-2 bg-white border border-slate-200 rounded-lg">
                          {trustees.map(t => (
                            <label key={t._id} className="flex items-center gap-2 cursor-pointer text-sm hover:bg-slate-50 p-1 rounded">
                              <input type="checkbox" checked={formData.targetUsers?.includes(t._id)} onChange={() => toggleUser(t._id)} className="rounded text-saffron-500 focus:ring-saffron-500" />
                              <span className="text-slate-700">{t.name} <span className="text-xs text-slate-400">({t.systemRole})</span></span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Multichannel Distribution */}
                    <div className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <h4 className="font-bold text-slate-900 flex items-center gap-2"><FiMessageCircle className="text-emerald-500"/> Channels</h4>
                      
                      <div className="space-y-2">
                        <label className="flex items-center justify-between cursor-pointer p-2.5 bg-white border border-slate-200 rounded-lg hover:border-blue-300 transition-colors">
                          <span className="flex items-center gap-2 text-xs font-bold text-slate-700"><FiBell className="text-blue-500"/> Dashboard Push</span>
                          <input type="checkbox" checked={formData.dashboardNotification} onChange={(e)=>setFormData({...formData, dashboardNotification: e.target.checked})} className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500" />
                        </label>
                        
                        <label className="flex items-center justify-between cursor-pointer p-2.5 bg-white border border-slate-200 rounded-lg hover:border-indigo-300 transition-colors">
                          <span className="flex items-center gap-2 text-xs font-bold text-slate-700"><FiMail className="text-indigo-500"/> Email</span>
                          <input type="checkbox" checked={formData.emailIntegration} onChange={(e)=>setFormData({...formData, emailIntegration: e.target.checked})} className="w-4 h-4 rounded border-gray-300 text-indigo-500 focus:ring-indigo-500" />
                        </label>
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-slate-100 bg-white shrink-0 flex justify-end gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl text-slate-500 hover:bg-slate-50 font-bold transition-colors">Cancel</button>
                <button form="announcementForm" disabled={submitting || !formData.title || !formData.message} type="submit" className="flex items-center gap-2 px-8 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all disabled:opacity-50">
                  {submitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><FiSend /> {editingId ? 'Update Broadcast' : 'Dispatch Broadcast'}</>}
                </button>
              </div>
            </motion.div>
          </div>
          )}
        </AnimatePresence>,
        document.body
      )}

    </div>
  );
};

export default Announcements;
