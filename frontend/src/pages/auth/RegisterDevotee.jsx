import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { UserCircle, Mail, Phone, Lock, ArrowLeft, Loader2, Key, Eye, EyeOff, Search, ChevronRight, Check } from 'lucide-react';
import { FaCrown, FaVenusMars } from 'react-icons/fa';
import api from '../../utils/api';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { validateName, validateMobile, getPasswordError, getMobileError } from '../../utils/validationUtils';

const RegisterDevotee = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const returnUrl = location.state?.returnUrl;
  
  const [step, setStep] = useState(1); // 1 = Account Info, 2 = Vanshawal Info, 3 = OTP Verification
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form Data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    gender: 'Male',
    dob: '',
    aadhaar: '',
    gotra: '',
    kuldevta: '',
    bloodGroup: 'A+',
    maritalStatus: 'Single',
    address: '',
    village: '',
    taluka: '',
    district: '',
    state: '',
    registerOption: 'newFamily', // 'newFamily' or 'joinFamily'
    relativeId: '',
    relationshipType: 'Son'
  });

  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Search relatives state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchState, setSearchState] = useState('');
  const [searchVillage, setSearchVillage] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedRelative, setSelectedRelative] = useState(null);

  const handleSearchRelatives = async () => {
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
      setError('Failed to search family members.');
    } finally {
      setLoading(false);
    }
  };

  const selectRelative = (relative) => {
    setSelectedRelative(relative);
    setSearchResults([]);
    
    // Automatically prefill gotra, kuldevta, and address from relative
    setFormData(prev => ({
      ...prev,
      relativeId: relative._id,
      gotra: relative.gotra || prev.gotra,
      kuldevta: relative.kuldevta || prev.kuldevta,
      address: relative.address || prev.address,
      village: relative.village || prev.village,
      taluka: relative.taluka || prev.taluka,
      district: relative.district || prev.district,
      state: relative.state || prev.state
    }));
  };

  const handleRelationshipChange = (relType) => {
    let computedGender = formData.gender;
    if (['Son', 'Father', 'Brother'].includes(relType)) {
      computedGender = 'Male';
    } else if (['Daughter', 'Mother', 'Sister'].includes(relType)) {
      computedGender = 'Female';
    } else if (relType === 'Spouse' && selectedRelative) {
      computedGender = selectedRelative.gender === 'Male' ? 'Female' : 'Male';
    }

    setFormData(prev => ({
      ...prev,
      relationshipType: relType,
      gender: computedGender
    }));
  };

  const handleStep1Submit = (e) => {
    e.preventDefault();
    if (!validateName(formData.name)) {
      return setError('Name must contain only alphabets and spaces.');
    }
    const mobileError = getMobileError(formData.mobile);
    if (mobileError) {
      return setError(mobileError);
    }
    const pwdError = getPasswordError(formData.password);
    if (pwdError) {
      return setError(pwdError);
    }
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    setError('');
    setStep(2);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (formData.registerOption === 'joinFamily' && !formData.relativeId) {
      return setError('Please search and select a relative family member to join.');
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/auth/register', formData);
      setStep(3); // Move to OTP verification
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/auth/verify-otp', { email: formData.email, otp });
      setSuccess('Account verified successfully!');
      setTimeout(() => {
        navigate('/login', { state: { returnUrl } });
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-stone-100 to-orange-50 flex flex-col font-sans relative overflow-x-hidden">
      
      {/* Background elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-5%] left-[10%] w-[400px] h-[400px] bg-red-400/10 rounded-full blur-[100px] animate-[pulse_9s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-[10%] right-[-5%] w-[500px] h-[500px] bg-orange-400/10 rounded-full blur-[120px] animate-[pulse_11s_ease-in-out_infinite_reverse]"></div>
      </div>

      <Navbar />
      
      <div className="flex-1 relative flex items-center justify-center py-32 px-4 sm:px-6 z-10">
        <div className="w-full max-w-xl mx-auto">
          
          {step > 1 && step < 3 && (
            <button onClick={() => setStep(step - 1)} className="text-slate-500 hover:text-orange-600 flex items-center gap-2 mb-6 font-bold transition-colors uppercase tracking-wider text-xs">
              <ArrowLeft size={16} /> Back to Step {step - 1}
            </button>
          )}

          <div className="bg-white/90 backdrop-blur-2xl border border-white shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05),0_0_30px_rgba(255,165,0,0.05)] p-6 sm:p-8 md:p-12 rounded-[2.5rem] relative overflow-hidden group">
            
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-200/40 to-transparent rounded-full blur-[20px] pointer-events-none transform translate-x-1/3 -translate-y-1/3"></div>

            <div className="flex flex-col items-center mb-8 relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 border border-orange-200 rounded-full flex items-center justify-center text-orange-600 shadow-md mb-4">
                {step === 1 ? <UserCircle size={32} /> : step === 2 ? <FaVenusMars size={28} /> : <Key size={32} />}
              </div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight text-center">
                {step === 1 ? 'Devotee Registration' : step === 2 ? 'Vanshawal Configuration' : 'Verify Email'}
              </h2>
              <p className="text-slate-500 font-bold text-xs mt-2 text-center uppercase tracking-wider">
                {step === 1 ? 'Step 1 of 2: Setup Credentials' : step === 2 ? 'Step 2 of 2: Link Lineage' : `OTP sent to ${formData.email}`}
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3.5 rounded-2xl mb-6 text-xs text-center font-bold">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3.5 rounded-2xl mb-6 text-xs text-center font-bold">
                {success}
              </div>
            )}

            {step === 1 && (
              <form onSubmit={handleStep1Submit} className="space-y-4 relative z-10">
                <div>
                  <label className="block text-slate-700 text-[10px] font-black mb-1.5 uppercase tracking-wider ml-1">Full Name</label>
                  <div className="relative">
                    <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input required type="text" pattern="[A-Za-z\s]+" title="Name must contain only alphabets and spaces" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value.replace(/[^A-Za-z\s]/g, '')})} className="w-full bg-slate-50/50 backdrop-blur-sm border border-slate-200 text-slate-800 rounded-2xl pl-11 pr-4 py-4 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-400/10 focus:bg-white transition-all placeholder:text-slate-400 font-bold shadow-sm" placeholder="Enter full name" />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 text-[10px] font-black mb-1.5 uppercase tracking-wider ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 rounded-2xl pl-11 pr-4 py-3.5 outline-none focus:border-orange-400 focus:bg-white text-xs font-bold transition-all shadow-sm" placeholder="Enter email address" />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 text-[10px] font-black mb-1.5 uppercase tracking-wider ml-1">Mobile Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input required type="tel" pattern="\d{10}" title="Mobile number must be exactly 10 digits" maxLength={10} value={formData.mobile} onChange={(e) => setFormData({...formData, mobile: e.target.value.replace(/\D/g, '')})} className="w-full bg-slate-50/50 backdrop-blur-sm border border-slate-200 text-slate-800 rounded-2xl pl-11 pr-4 py-4 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-400/10 focus:bg-white transition-all placeholder:text-slate-400 font-bold shadow-sm" placeholder="Enter mobile number" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 text-xs font-black mb-1.5 uppercase tracking-wider ml-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10" size={18} />
                      <input required type={showPassword ? "text" : "password"} pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}" title="Password must be at least 8 chars long with 1 uppercase, 1 lowercase, 1 number, and 1 special character" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full bg-slate-50/50 backdrop-blur-sm border border-slate-200 text-slate-800 rounded-2xl pl-11 pr-12 py-4 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-400/10 focus:bg-white transition-all placeholder:text-slate-400 font-bold shadow-sm" placeholder="Create password" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-500 transition-colors z-10 p-1">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 text-xs font-black mb-1.5 uppercase tracking-wider ml-1">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10" size={18} />
                      <input required type={showConfirmPassword ? "text" : "password"} value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} className="w-full bg-slate-50/50 backdrop-blur-sm border border-slate-200 text-slate-800 rounded-2xl pl-11 pr-12 py-4 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-400/10 focus:bg-white transition-all placeholder:text-slate-400 font-bold shadow-sm" placeholder="Confirm password" />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-500 transition-colors z-10 p-1">
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>

                <button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-black py-4 px-6 rounded-2xl uppercase tracking-widest text-xs hover:shadow-md transform transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 mt-6">
                  Continue to Family Setup <ChevronRight size={16} />
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4 relative z-10 max-h-[60vh] overflow-y-auto pr-2">
                
                {/* Selection between family creation modes */}
                <div className="grid grid-cols-2 gap-4 pb-2">
                  <button 
                    type="button"
                    onClick={() => setFormData({ ...formData, registerOption: 'newFamily' })}
                    className={`p-4 border rounded-2xl text-left transition-all ${formData.registerOption === 'newFamily' ? 'border-orange-500 bg-orange-50/30' : 'border-slate-200 bg-slate-50'}`}
                  >
                    <p className="text-xs font-black text-slate-800 uppercase">Option 1</p>
                    <p className="text-[10px] font-bold text-slate-500 mt-1">Register New Family</p>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setFormData({ ...formData, registerOption: 'joinFamily' })}
                    className={`p-4 border rounded-2xl text-left transition-all ${formData.registerOption === 'joinFamily' ? 'border-orange-500 bg-orange-50/30' : 'border-slate-200 bg-slate-50'}`}
                  >
                    <p className="text-xs font-black text-slate-800 uppercase">Option 2</p>
                    <p className="text-[10px] font-bold text-slate-500 mt-1">Join Existing Family</p>
                  </button>
                </div>

                {formData.registerOption === 'joinFamily' ? (
                  <div className="space-y-4 bg-orange-50/20 p-4 border border-orange-100 rounded-2xl">
                    <label className="block text-slate-700 text-[10px] font-black uppercase tracking-wider">Search and link to relative family member:</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by relative head name, mobile, devotee ID..."
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                      />
                      <button 
                        type="button"
                        onClick={handleSearchRelatives}
                        className="px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-black uppercase"
                      >
                        Search
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        type="text" 
                        value={searchState}
                        onChange={(e) => setSearchState(e.target.value)}
                        placeholder="Filter by State"
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-[11px] font-bold focus:outline-none"
                      />
                      <input 
                        type="text" 
                        value={searchVillage}
                        onChange={(e) => setSearchVillage(e.target.value)}
                        placeholder="Filter by Village"
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-[11px] font-bold focus:outline-none"
                      />
                    </div>

                    {searchResults.length > 0 && (
                      <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-36 overflow-y-auto">
                        {searchResults.map(rel => (
                          <div 
                            key={rel._id}
                            onClick={() => selectRelative(rel)}
                            className="p-2.5 flex justify-between items-center cursor-pointer hover:bg-orange-50"
                          >
                            <div>
                              <p className="text-xs font-black text-slate-700">{rel.name} ({rel.devoteeId})</p>
                              <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Gotra: {rel.gotra || 'N/A'} • Branch: {rel.branch?.name || 'N/A'}</p>
                            </div>
                            <ChevronRight size={14} className="text-slate-400" />
                          </div>
                        ))}
                      </div>
                    )}

                    {selectedRelative && (
                      <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl flex items-center justify-between text-xs font-black">
                        <span>Selected Relative: {selectedRelative.name} ({selectedRelative.devoteeId})</span>
                        <Check size={16} className="text-emerald-600" />
                      </div>
                    )}

                    {selectedRelative && (
                      <div>
                        <label className="block text-slate-700 text-[10px] font-black mb-1.5 uppercase tracking-wider ml-1">Relationship to {selectedRelative.name}</label>
                        <select 
                          value={formData.relationshipType}
                          onChange={(e) => handleRelationshipChange(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none"
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
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-orange-500/10 border border-orange-200 text-orange-800 rounded-xl text-xs font-bold">
                    You will be registered as a standalone family head. You can add more parents, kids, or spouses once your profile is active.
                  </div>
                )}

                {/* Personal & Address fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 text-[10px] font-black mb-1.5 uppercase tracking-wider ml-1">Gender</label>
                    <select 
                      disabled={formData.registerOption === 'joinFamily' && formData.relationshipType !== 'Spouse'}
                      value={formData.gender} 
                      onChange={(e) => setFormData({...formData, gender: e.target.value})} 
                      className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 rounded-2xl px-4 py-3 text-xs font-bold outline-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 text-[10px] font-black mb-1.5 uppercase tracking-wider ml-1">Date of Birth</label>
                    <input type="date" value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})} className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 rounded-2xl px-4 py-3 text-xs font-bold outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 text-[10px] font-black mb-1.5 uppercase tracking-wider ml-1">Gotra</label>
                    <input type="text" value={formData.gotra} onChange={(e) => setFormData({...formData, gotra: e.target.value})} className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 rounded-2xl px-4 py-3 text-xs font-bold outline-none" placeholder="Gotra name" />
                  </div>

                  <div>
                    <label className="block text-slate-700 text-[10px] font-black mb-1.5 uppercase tracking-wider ml-1">Kuldevta</label>
                    <input type="text" value={formData.kuldevta} onChange={(e) => setFormData({...formData, kuldevta: e.target.value})} className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 rounded-2xl px-4 py-3 text-xs font-bold outline-none" placeholder="Family Deity" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 text-[10px] font-black mb-1.5 uppercase tracking-wider ml-1">Blood Group</label>
                    <select value={formData.bloodGroup} onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})} className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 rounded-2xl px-4 py-3 text-xs font-bold outline-none">
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 text-[10px] font-black mb-1.5 uppercase tracking-wider ml-1">Marital Status</label>
                    <select value={formData.maritalStatus} onChange={(e) => setFormData({...formData, maritalStatus: e.target.value})} className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 rounded-2xl px-4 py-3 text-xs font-bold outline-none">
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 text-[10px] font-black mb-1.5 uppercase tracking-wider ml-1">Permanent Address</label>
                  <input type="text" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 rounded-2xl px-4 py-3 text-xs font-bold outline-none" placeholder="Permanent address details" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 text-[10px] font-black mb-1.5 uppercase tracking-wider ml-1">Village</label>
                    <input type="text" value={formData.village} onChange={(e) => setFormData({...formData, village: e.target.value})} className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 rounded-2xl px-4 py-3 text-xs font-bold outline-none" placeholder="Village" />
                  </div>
                  <div>
                    <label className="block text-slate-700 text-[10px] font-black mb-1.5 uppercase tracking-wider ml-1">Taluka</label>
                    <input type="text" value={formData.taluka} onChange={(e) => setFormData({...formData, taluka: e.target.value})} className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 rounded-2xl px-4 py-3 text-xs font-bold outline-none" placeholder="Taluka" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 text-[10px] font-black mb-1.5 uppercase tracking-wider ml-1">District</label>
                    <input type="text" value={formData.district} onChange={(e) => setFormData({...formData, district: e.target.value})} className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 rounded-2xl px-4 py-3 text-xs font-bold outline-none" placeholder="District" />
                  </div>
                  <div>
                    <label className="block text-slate-700 text-[10px] font-black mb-1.5 uppercase tracking-wider ml-1">State</label>
                    <input type="text" value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 rounded-2xl px-4 py-3 text-xs font-bold outline-none" placeholder="State" />
                  </div>
                </div>

                <button disabled={loading} type="submit" className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-black py-4 px-6 rounded-2xl uppercase tracking-widest text-xs hover:shadow-md transform transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 mt-8 disabled:opacity-70 disabled:transform-none">
                  {loading ? <Loader2 className="animate-spin animate-pulse" /> : 'Register & Send OTP'}
                </button>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleOtpSubmit} className="space-y-6 relative z-10 animate-[fadeIn_0.4s_ease-out]">
                <div>
                  <label className="block text-slate-700 text-sm font-black mb-3 text-center uppercase tracking-widest">Enter 6-Digit OTP</label>
                  <input required type="text" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 rounded-2xl px-4 py-5 text-center text-3xl tracking-[0.75em] font-black outline-none focus:border-orange-400 focus:bg-white transition-all placeholder:text-slate-300 shadow-sm" placeholder="------" />
                </div>

                <button disabled={loading || otp.length !== 6} type="submit" className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-black py-4 px-6 rounded-2xl uppercase tracking-widest text-xs hover:shadow-[0_10px_20px_rgba(255,165,0,0.3)] transform transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-8">
                  {loading ? <Loader2 className="animate-spin" /> : 'Verify Account'}
                </button>
              </form>
            )}

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RegisterDevotee;
