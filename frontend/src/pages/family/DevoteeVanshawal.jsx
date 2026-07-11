import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSearch, FiPlus, FiTrash2, FiEdit, FiUser, FiHome, FiMapPin, 
  FiActivity, FiCheck, FiChevronRight, FiChevronLeft, FiX, FiLayers
} from 'react-icons/fi';
import { FaUserFriends, FaCrown } from 'react-icons/fa';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import VanshawalTree from '../../components/family/VanshawalTree';
import DevoteeProfileDetail from '../../components/family/DevoteeProfileDetail';

const DevoteeVanshawal = () => {
  const { user } = useAuth();
  const isBranchManager = user?.role === 'BranchManager';
  const isDevotee = user?.role === 'Devotee';

  const [activeFamilyRoot, setActiveFamilyRoot] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // Forms state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddRelativeModalOpen, setIsAddRelativeModalOpen] = useState(false);
  const [selectedRelative, setSelectedRelative] = useState(null);

  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const initialFormState = {
    name: "",
    gender: "Male",
    dob: "",
    mobile: "",
    email: "",
    aadhaar: "",
    address: "",
    branch: "",
    gotra: "",
    kuldevta: "",
    bloodGroup: "",
    maritalStatus: "Single"
  };

  const [formData, setFormData] = useState(initialFormState);
  const [relationType, setRelationType] = useState("Son");

  useEffect(() => {
    fetchBranches();
    if (isDevotee) {
      loadDevoteeOwnFamily();
    }
  }, []);

  const fetchBranches = async () => {
    try {
      const res = await api.get('/branches');
      setBranches(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadDevoteeOwnFamily = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/family/search?q=${user.email || user.mobile}`);
      if (res.data.data && res.data.data.length > 0) {
        const rootId = res.data.data[0]._id;
        setActiveFamilyRoot(rootId);
        fetchFamilyMembers(rootId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFamilyMembers = async (rootId) => {
    try {
      setLoading(true);
      const res = await api.get(`/family/tree/${rootId}`);
      setFamilyMembers(res.data.data || []);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to fetch family tree members.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      setSearching(true);
      const res = await api.get(`/family/search?q=${searchQuery}`);
      setSearchResults(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const selectFamily = (rootId) => {
    setActiveFamilyRoot(rootId);
    fetchFamilyMembers(rootId);
    setSearchResults([]);
    setSearchQuery("");
  };

  // Option 1: Create New Vanshawal
  const handleCreateFamily = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      
      const payload = { ...formData };
      if (isBranchManager) {
        payload.branch = user.branch;
      }

      const res = await api.post('/family/create', payload);
      const newHead = res.data.data;
      
      setIsCreateModalOpen(false);
      setFormData(initialFormState);
      selectFamily(newHead._id);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create family.");
    } finally {
      setSubmitting(false);
    }
  };

  // Option 2: Add Relative Member
  const handleAddRelative = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      
      const payload = {
        devoteeData: { ...formData },
        relationshipType: relationType,
        relativeId: selectedRelative._id
      };

      if (isBranchManager) {
        payload.devoteeData.branch = user.branch;
      }

      await api.post('/family/add-member', payload);
      setIsAddRelativeModalOpen(false);
      setFormData(initialFormState);
      
      // Reload active tree
      fetchFamilyMembers(activeFamilyRoot);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add family member.");
    } finally {
      setSubmitting(false);
    }
  };

  const triggerAddRelative = (relative, type = "Son") => {
    setSelectedRelative(relative);
    setRelationType(type);
    
    let defaultGender = "Male";
    if (["Daughter", "Mother", "Sister"].includes(type)) {
      defaultGender = "Female";
    } else if (type === "Spouse") {
      defaultGender = relative.gender === "Male" ? "Female" : "Male";
    }

    setFormData({
      ...initialFormState,
      gender: defaultGender,
      gotra: relative.gotra || "",
      kuldevta: relative.kuldevta || "",
      address: relative.address || "",
      village: relative.village || "",
      taluka: relative.taluka || "",
      district: relative.district || "",
      state: relative.state || "",
      branch: relative.branch?._id || relative.branch || ""
    });
    setIsAddRelativeModalOpen(true);
  };

  return (
    <div className="w-full space-y-8 pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FaUserFriends className="text-saffron-500" /> Devotee Vanshawal Module
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1">
            Redesigned devotee registry centered around hierarchical family trees and lineages.
          </p>
        </div>
        
        {!isDevotee && (
          <button 
            onClick={() => {
              setFormData(initialFormState);
              setIsCreateModalOpen(true);
            }}
            className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-black text-white text-xs font-black rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            <FiPlus /> Create New Vanshawal
          </button>
        )}
      </div>

      {error && <div className="bg-red-50 text-red-600 font-bold p-4 rounded-xl text-sm border border-red-100">{error}</div>}

      {/* Main UI layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left column: Search / Actions / Root Selection */}
        {!isDevotee && !activeFamilyRoot && (
          <div className="lg:col-span-12 bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm text-center max-w-xl mx-auto space-y-6">
            <div className="w-16 h-16 rounded-full bg-saffron-50 flex items-center justify-center text-saffron-500 text-2xl mx-auto"><FaUserFriends /></div>
            <div>
              <h2 className="text-xl font-black text-slate-800">Select or Create a Family Tree</h2>
              <p className="text-slate-500 font-medium text-xs mt-1">To view or edit a Vanshawal, search for an existing family or create a new lineage register.</p>
            </div>
            
            <form onSubmit={handleSearch} className="flex gap-2">
              <input 
                type="text"
                placeholder="Search by Head, Mobile, Devotee ID, Surname, Gotra..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-saffron-500/20 focus:border-saffron-500 outline-none transition-all text-slate-700"
              />
              <button disabled={searching} type="submit" className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black shadow-md">
                {searching ? "Searching..." : "Search"}
              </button>
            </form>

            <AnimatePresence>
              {searchResults.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-100 max-h-60 overflow-y-auto">
                  {searchResults.map(head => (
                    <div key={head._id} onClick={() => selectFamily(head._id)} className="p-4 flex justify-between items-center hover:bg-slate-50 cursor-pointer text-left transition-colors">
                      <div>
                        <p className="font-bold text-xs text-slate-800 flex items-center gap-1.5"><FaCrown className="text-saffron-500" /> {head.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5">ID: {head.devoteeId} • Mobile: {head.mobile || "N/A"}</p>
                      </div>
                      <FiChevronRight className="text-slate-400" />
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Tree Visualizer & Profile Drawer */}
        {activeFamilyRoot && (
          <>
            <div className={`lg:col-span-12 ${selectedMemberId ? 'lg:col-span-8' : 'lg:col-span-12'} transition-all`}>
              
              <div className="flex justify-between items-center mb-4">
                <button 
                  onClick={() => {
                    setActiveFamilyRoot(null);
                    setFamilyMembers([]);
                    setSelectedMemberId(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition-colors"
                >
                  <FiChevronLeft /> Back to Search
                </button>
                <div className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  Active Vanshawal Head: {familyMembers.find(m => m.isFamilyHead)?.name || "Head"}
                </div>
              </div>

              {loading ? (
                <div className="h-[400px] flex items-center justify-center bg-[#FAF9F5] rounded-[2rem] border border-slate-200/50">
                  <div className="w-10 h-10 border-4 border-slate-200 border-t-saffron-500 rounded-full animate-spin"></div>
                </div>
              ) : (
                <VanshawalTree 
                  members={familyMembers}
                  onSelectMember={setSelectedMemberId}
                  selectedMemberId={selectedMemberId}
                  onAddRelative={isDevotee ? null : triggerAddRelative}
                />
              )}
            </div>

            {/* Profile Drawer column */}
            {selectedMemberId && (
              <div className="lg:col-span-4 h-[600px]">
                <DevoteeProfileDetail 
                  devoteeId={selectedMemberId}
                  onClose={() => setSelectedMemberId(null)}
                  onSelectMember={setSelectedMemberId}
                />
              </div>
            )}
          </>
        )}

      </div>

      {/* Premium Create Family Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden relative border-t-8 border-t-saffron-500 max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50">
                <div>
                  <h3 className="text-lg font-black text-slate-800 uppercase tracking-wide">Create New Family Register</h3>
                  <p className="text-slate-400 font-bold text-xs mt-0.5">The first devotee registered will become the Family Head.</p>
                </div>
                <button onClick={() => setIsCreateModalOpen(false)} className="p-2 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"><FiX size={18} /></button>
              </div>

              <form onSubmit={handleCreateFamily} className="p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Full Name *</label>
                    <input required type="text" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-saffron-500" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Gender *</label>
                    <select required value={formData.gender} onChange={e=>setFormData({...formData, gender: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-saffron-500">
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Date of Birth</label>
                    <input type="date" value={formData.dob} onChange={e=>setFormData({...formData, dob: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-saffron-500" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Mobile Number</label>
                    <input type="tel" value={formData.mobile} onChange={e=>setFormData({...formData, mobile: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-saffron-500" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                    <input type="email" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-saffron-500" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Aadhaar Number</label>
                    <input type="text" value={formData.aadhaar} onChange={e=>setFormData({...formData, aadhaar: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-saffron-500" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Gotra</label>
                    <input type="text" value={formData.gotra} onChange={e=>setFormData({...formData, gotra: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-saffron-500" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Kuldevta</label>
                    <input type="text" value={formData.kuldevta} onChange={e=>setFormData({...formData, kuldevta: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-saffron-500" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Blood Group</label>
                    <input type="text" value={formData.bloodGroup} onChange={e=>setFormData({...formData, bloodGroup: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-saffron-500" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Marital Status</label>
                    <select value={formData.maritalStatus} onChange={e=>setFormData({...formData, maritalStatus: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-saffron-500">
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                      <option value="Separated">Separated</option>
                    </select>
                  </div>
                </div>

                {!isBranchManager && (
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Branch</label>
                    <select value={formData.branch} onChange={e=>setFormData({...formData, branch: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-saffron-500">
                      <option value="">Main Trust</option>
                      {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Address</label>
                  <textarea value={formData.address} onChange={e=>setFormData({...formData, address: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-saffron-500 resize-none h-16" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Village</label>
                    <input type="text" value={formData.village} onChange={e=>setFormData({...formData, village: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-saffron-500" placeholder="Village" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Taluka</label>
                    <input type="text" value={formData.taluka} onChange={e=>setFormData({...formData, taluka: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-saffron-500" placeholder="Taluka" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">District</label>
                    <input type="text" value={formData.district} onChange={e=>setFormData({...formData, district: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-saffron-500" placeholder="District" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">State</label>
                    <input type="text" value={formData.state} onChange={e=>setFormData({...formData, state: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-saffron-500" placeholder="State" />
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                  <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100">Cancel</button>
                  <button disabled={submitting} type="submit" className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black shadow-lg">
                    {submitting ? "Creating..." : "Create Family"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Premium Add Relative Modal */}
      <AnimatePresence>
        {isAddRelativeModalOpen && selectedRelative && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden relative border-t-8 border-t-saffron-500 max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50">
                <div>
                  <h3 className="text-lg font-black text-slate-800 uppercase tracking-wide">Add Family Member</h3>
                  <p className="text-slate-400 font-bold text-xs mt-0.5">Adding relative to member: <span className="text-saffron-600 font-black">{selectedRelative.name}</span></p>
                </div>
                <button onClick={() => setIsAddRelativeModalOpen(false)} className="p-2 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"><FiX size={18} /></button>
              </div>

              <form onSubmit={handleAddRelative} className="p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
                
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Relationship Type *</label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {["Son", "Daughter", "Father", "Mother", "Spouse", "Brother", "Sister"].map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setRelationType(type)}
                        className={`py-2 text-xs font-black rounded-lg border text-center transition-colors ${
                          relationType === type ? 'bg-saffron-500 border-saffron-500 text-white shadow-md' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Full Name *</label>
                    <input required type="text" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Gender (Will auto-configure based on role)</label>
                    <select value={formData.gender} onChange={e=>setFormData({...formData, gender: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none">
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Date of Birth</label>
                    <input type="date" value={formData.dob} onChange={e=>setFormData({...formData, dob: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Mobile Number</label>
                    <input type="tel" value={formData.mobile} onChange={e=>setFormData({...formData, mobile: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                    <input type="email" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Aadhaar Number</label>
                    <input type="text" value={formData.aadhaar} onChange={e=>setFormData({...formData, aadhaar: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Gotra</label>
                    <input type="text" value={formData.gotra} onChange={e=>setFormData({...formData, gotra: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Kuldevta</label>
                    <input type="text" value={formData.kuldevta} onChange={e=>setFormData({...formData, kuldevta: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Blood Group</label>
                    <input type="text" value={formData.bloodGroup} onChange={e=>setFormData({...formData, bloodGroup: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Marital Status</label>
                    <select value={formData.maritalStatus} onChange={e=>setFormData({...formData, maritalStatus: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none">
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                      <option value="Separated">Separated</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Address</label>
                  <input type="text" value={formData.address} onChange={e=>setFormData({...formData, address: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-saffron-500" placeholder="Address" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Village</label>
                    <input type="text" value={formData.village} onChange={e=>setFormData({...formData, village: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-saffron-500" placeholder="Village" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Taluka</label>
                    <input type="text" value={formData.taluka} onChange={e=>setFormData({...formData, taluka: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-saffron-500" placeholder="Taluka" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">District</label>
                    <input type="text" value={formData.district} onChange={e=>setFormData({...formData, district: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-saffron-500" placeholder="District" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">State</label>
                    <input type="text" value={formData.state} onChange={e=>setFormData({...formData, state: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-saffron-500" placeholder="State" />
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                  <button type="button" onClick={() => setIsAddRelativeModalOpen(false)} className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100">Cancel</button>
                  <button disabled={submitting} type="submit" className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black shadow-lg">
                    {submitting ? "Adding..." : "Add Member"}
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

export default DevoteeVanshawal;
