import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUsers, FiPlusCircle, FiSearch, FiAlertCircle, FiCheck, FiChevronRight } from 'react-icons/fi';
import { FaCrown } from 'react-icons/fa';
import api from '../../utils/api';

const VanshawalPrompt = ({ user, onSetupComplete }) => {
  const [showOptions, setShowOptions] = useState(false);
  const [mode, setMode] = useState(null); // 'create' or 'join'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Search state for joining
  const [searchQuery, setSearchQuery] = useState('');
  const [searchState, setSearchState] = useState('');
  const [searchVillage, setSearchVillage] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [relationshipType, setRelationshipType] = useState('Son');

  // New family state
  const [kuldevta, setKuldevta] = useState('');
  const [addressFields, setAddressFields] = useState({
    village: '',
    taluka: '',
    district: '',
    state: ''
  });

  if (user?.familyRootId) return null; // Devotee already has a family root

  const handleCreateFamily = async () => {
    setLoading(true);
    setError('');
    try {
      // Devotee creating a new family tree for themselves makes them the head
      const res = await api.post('/family/create-self-root', {
        kuldevta,
        ...addressFields
      });
      if (res.data.success) {
        setSuccess('Family tree created successfully!');
        if (onSetupComplete) onSetupComplete(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create family tree');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchFamilies = async () => {
    if (!searchQuery.trim() && !searchState.trim() && !searchVillage.trim()) return;
    setLoading(true);
    setError('');
    try {
      let queryParams = [];
      if (searchQuery.trim()) queryParams.push(`q=${encodeURIComponent(searchQuery.trim())}`);
      if (searchState.trim()) queryParams.push(`state=${encodeURIComponent(searchState.trim())}`);
      if (searchVillage.trim()) queryParams.push(`village=${encodeURIComponent(searchVillage.trim())}`);
      
      const res = await api.get(`/family/search?${queryParams.join('&')}`);
      setSearchResults(res.data.data || []);
    } catch (err) {
      setError('Error searching families');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinFamily = async () => {
    if (!selectedFamily) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/family/join-self', {
        relativeId: selectedFamily._id,
        relationshipType
      });
      if (res.data.success) {
        setSuccess('Successfully joined family tree!');
        if (onSetupComplete) onSetupComplete(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join family');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-8 relative overflow-hidden bg-gradient-to-r from-orange-50 via-amber-50 to-orange-100/50 border border-orange-200/60 rounded-[2rem] p-6 sm:p-8 shadow-sm">
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200/20 rounded-full blur-2xl pointer-events-none"></div>
      
      {!showOptions ? (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-orange-500/10 text-orange-600 rounded-2xl flex items-center justify-center text-xl shrink-0">
              <FiUsers />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800 tracking-wide uppercase">Complete Your Vanshawal Setup</h3>
              <p className="text-slate-500 font-bold text-xs mt-1">You haven't linked or created a family tree yet. Integrate your lineage and donations history now.</p>
            </div>
          </div>
          <button 
            onClick={() => setShowOptions(true)}
            className="px-6 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-xs tracking-wider uppercase rounded-2xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all text-center"
          >
            Setup Vanshawal
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-orange-200/30">
            <h3 className="text-base font-black text-slate-800 tracking-wide uppercase">Setup Family Tree (Vanshawal)</h3>
            <button 
              onClick={() => { setShowOptions(false); setMode(null); }}
              className="text-xs font-black text-slate-400 hover:text-slate-600 uppercase"
            >
              Cancel
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3.5 rounded-2xl text-xs font-bold flex items-center gap-2">
              <FiAlertCircle className="shrink-0" /> {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 animate-pulse">
              <FiCheck className="shrink-0" /> {success}
            </div>
          )}

          {!mode && !success && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={() => setMode('create')}
                className="flex items-start gap-4 p-6 bg-white border border-slate-200 hover:border-orange-300 rounded-[2rem] hover:shadow-md transition-all text-left group"
              >
                <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                  <FiPlusCircle />
                </div>
                <div>
                  <h4 className="font-black text-slate-800 text-sm uppercase">Create New Family Lineage</h4>
                  <p className="text-slate-400 font-semibold text-[10px] mt-1">Start a fresh family register. You will register as the initial Family Head node.</p>
                </div>
              </button>

              <button 
                onClick={() => setMode('join')}
                className="flex items-start gap-4 p-6 bg-white border border-slate-200 hover:border-orange-300 rounded-[2rem] hover:shadow-md transition-all text-left group"
              >
                <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                  <FiSearch />
                </div>
                <div>
                  <h4 className="font-black text-slate-800 text-sm uppercase">Join Existing Lineage</h4>
                  <p className="text-slate-400 font-semibold text-[10px] mt-1">Search and connect to an existing family group created by relatives.</p>
                </div>
              </button>
            </div>
          )}

          {mode === 'create' && !success && (
            <div className="space-y-4 max-w-xl">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Enter root family details to create a new Vanshawal:</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 text-[10px] font-black uppercase tracking-wider mb-1">Kuldevta (Optional)</label>
                  <input 
                    type="text" 
                    value={kuldevta} 
                    onChange={(e) => setKuldevta(e.target.value)}
                    placeholder="e.g. Shri Rudra" 
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-400/5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 text-[10px] font-black uppercase tracking-wider mb-1">Village</label>
                  <input 
                    type="text" 
                    value={addressFields.village} 
                    onChange={(e) => setAddressFields({...addressFields, village: e.target.value})}
                    placeholder="Village" 
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-[10px] font-black uppercase tracking-wider mb-1">Taluka</label>
                  <input 
                    type="text" 
                    value={addressFields.taluka} 
                    onChange={(e) => setAddressFields({...addressFields, taluka: e.target.value})}
                    placeholder="Taluka" 
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 text-[10px] font-black uppercase tracking-wider mb-1">District</label>
                  <input 
                    type="text" 
                    value={addressFields.district} 
                    onChange={(e) => setAddressFields({...addressFields, district: e.target.value})}
                    placeholder="District" 
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-[10px] font-black uppercase tracking-wider mb-1">State</label>
                  <input 
                    type="text" 
                    value={addressFields.state} 
                    onChange={(e) => setAddressFields({...addressFields, state: e.target.value})}
                    placeholder="State" 
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={handleCreateFamily}
                  disabled={loading}
                  className="px-5 py-3 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs tracking-wider uppercase rounded-xl transition-all shadow-sm flex items-center gap-2"
                >
                  {loading && <span className="animate-spin text-sm">🔄</span>} Create Family Root
                </button>
                <button 
                  onClick={() => setMode(null)}
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-xs tracking-wider uppercase rounded-xl transition-all"
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {mode === 'join' && !success && (
            <div className="space-y-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Search and select an existing relative in the database:</p>
              
              <div className="flex gap-2 max-w-md">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Head Name, mobile, Devotee ID..."
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold focus:outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchFamilies()}
                />
                <button 
                  onClick={handleSearchFamilies}
                  disabled={loading}
                  className="px-5 py-3 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs tracking-wider uppercase rounded-xl transition-all shadow-sm"
                >
                  Search
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 max-w-md">
                <input 
                  type="text" 
                  value={searchState}
                  onChange={(e) => setSearchState(e.target.value)}
                  placeholder="Filter by State"
                  className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none"
                />
                <input 
                  type="text" 
                  value={searchVillage}
                  onChange={(e) => setSearchVillage(e.target.value)}
                  placeholder="Filter by Village"
                  className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none"
                />
              </div>

              {searchResults.length > 0 && (
                <div className="max-w-xl bg-white border border-slate-150 rounded-2xl overflow-hidden divide-y divide-slate-100 max-h-48 overflow-y-auto shadow-inner">
                  {searchResults.map(fam => (
                    <div 
                      key={fam._id}
                      onClick={() => setSelectedFamily(fam)}
                      className={`p-3.5 flex justify-between items-center cursor-pointer transition-all hover:bg-amber-50/50 ${selectedFamily?._id === fam._id ? 'bg-amber-50 border-l-4 border-amber-500' : ''}`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-black text-slate-700 uppercase">{fam.name}</p>
                          {fam.isFamilyHead && <FaCrown className="text-amber-500 text-[10px]" />}
                        </div>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Devotee ID: {fam.devoteeId}</p>
                      </div>
                      <FiChevronRight className="text-slate-400" />
                    </div>
                  ))}
                </div>
              )}

              {selectedFamily && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 bg-white border border-amber-100 rounded-2xl max-w-xl space-y-4 shadow-sm"
                >
                  <p className="text-xs font-black text-slate-700 uppercase">Selected Relative: {selectedFamily.name}</p>
                  
                  <div>
                    <label className="block text-slate-600 text-[10px] font-black uppercase tracking-wider mb-2">Select your relationship to {selectedFamily.name}</label>
                    <select 
                      value={relationshipType}
                      onChange={(e) => setRelationshipType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 focus:outline-none"
                    >
                      <option value="Son">Son</option>
                      <option value="Daughter">Daughter</option>
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Brother">Brother</option>
                      <option value="Sister">Sister</option>
                    </select>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={handleJoinFamily}
                      disabled={loading}
                      className="px-5 py-3 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs tracking-wider uppercase rounded-xl transition-all shadow-sm"
                    >
                      Confirm and Join Family
                    </button>
                    <button 
                      onClick={() => setSelectedFamily(null)}
                      className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-xs tracking-wider uppercase rounded-xl transition-all"
                    >
                      Clear selection
                    </button>
                  </div>
                </motion.div>
              )}

              <div className="pt-2">
                <button 
                  onClick={() => setMode(null)}
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-xs tracking-wider uppercase rounded-xl transition-all"
                >
                  Back
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VanshawalPrompt;
