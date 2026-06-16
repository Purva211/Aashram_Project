import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiMapPin, FiShield, FiSave, FiEdit2, FiCamera, FiLock, FiBell, FiEye, FiEyeOff } from 'react-icons/fi';
import api from '../../utils/api';

const Profile = () => {
  const { user, login } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const fileInputRef = useRef(null);

  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    address: ''
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const [preferences, setPreferences] = useState({
    emailAlerts: true,
    smsAlerts: false,
    twoFactorAuth: false
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        mobile: user.mobile || user.phone || '',
        address: user.address || ''
      });
      if (user.profilePhoto) {
        setImagePreview(`${API_URL}${user.profilePhoto}`);
      }
    }
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
      setIsEditing(true); // Auto enable edit mode if they change photo
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    try {
      const dataToUpdate = new FormData();
      dataToUpdate.append('name', formData.name);
      dataToUpdate.append('email', formData.email);
      dataToUpdate.append('mobile', formData.mobile);
      dataToUpdate.append('address', formData.address);
      if (profileImage) {
        dataToUpdate.append('profileImage', profileImage);
      }

      const res = await api.put('/branch-managers/profile', dataToUpdate, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        login(sessionStorage.getItem('token') || localStorage.getItem('token'), res.data.user);
        setSuccessMsg('Profile information updated successfully!');
        setIsEditing(false);
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSecurity = async (e) => {
    e.preventDefault();
    if (securityData.newPassword !== securityData.confirmPassword) {
      return alert("Passwords do not match");
    }
    setLoading(true);
    setSuccessMsg('');
    try {
      const res = await api.put('/branch-managers/profile', { password: securityData.newPassword });
      if (res.data.success) {
        setSuccessMsg('Security settings updated successfully!');
        setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to update security settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePreferences = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    try {
      await new Promise(res => setTimeout(res, 800)); 
      setSuccessMsg('Preferences saved successfully!');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = () => {
    return user?.name ? user.name.charAt(0).toUpperCase() : 'A';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 text-gray-800 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-900">
            <FiUser className="text-sky-500" /> Branch Manager Profile
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage your manager identity and security preferences.</p>
        </div>
        {activeTab === 'personal' && !isEditing && (
          <button 
            onClick={() => setIsEditing(true)} 
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold shadow-md transition-colors"
          >
            <FiEdit2 /> Edit Profile
          </button>
        )}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 bg-gray-50 border-r border-gray-100 p-6 shrink-0">
          <div className="flex flex-col items-center mb-8">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full border-4 border-white bg-slate-800 flex items-center justify-center shadow-md overflow-hidden relative">
                {imagePreview ? (
                  <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl text-white font-bold">{getInitials()}</span>
                )}
                
                {/* Overlay for image upload */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <FiCamera className="text-white text-xl mb-1" />
                  <span className="text-white text-[10px] font-bold uppercase tracking-wider">Change</span>
                </div>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
            </div>
            <h3 className="mt-4 font-bold text-slate-900 text-center">{user?.name}</h3>
            <span className="px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-xs font-bold uppercase tracking-wider mt-2 flex items-center gap-1">
              <FiShield /> {user?.role || 'Branch Manager'}
            </span>
          </div>

          <nav className="space-y-2">
            <button 
              onClick={() => {setActiveTab('personal'); setSuccessMsg('');}}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${activeTab === 'personal' ? 'bg-sky-50 text-sky-600' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
            >
              <FiUser className="text-lg" /> Personal Info
            </button>
            <button 
              onClick={() => {setActiveTab('security'); setSuccessMsg(''); setIsEditing(false);}}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${activeTab === 'security' ? 'bg-sky-50 text-sky-600' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
            >
              <FiLock className="text-lg" /> Security
            </button>
            <button 
              onClick={() => {setActiveTab('preferences'); setSuccessMsg(''); setIsEditing(false);}}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${activeTab === 'preferences' ? 'bg-sky-50 text-sky-600' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
            >
              <FiBell className="text-lg" /> Preferences
            </button>
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 md:p-10 relative">
          
          <AnimatePresence mode="wait">
            {successMsg && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute top-6 left-10 right-10 p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 font-bold text-sm z-10 shadow-sm">
                {successMsg}
              </motion.div>
            )}
          </AnimatePresence>

          <div className={successMsg ? "mt-16" : ""}>
            {/* Personal Info Tab */}
            {activeTab === 'personal' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
                <h2 className="text-xl font-bold text-slate-900 mb-6 border-b border-gray-100 pb-4">Personal Information</h2>
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">Full Name</label>
                      <div className="relative">
                        <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" disabled={!isEditing} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-gray-800 focus:outline-none focus:border-sky-500 focus:bg-white focus:ring-1 focus:ring-sky-500 transition-all disabled:opacity-70 disabled:bg-gray-100 font-medium" required />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">Email Address</label>
                      <div className="relative">
                        <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="email" disabled={!isEditing} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-gray-800 focus:outline-none focus:border-sky-500 focus:bg-white focus:ring-1 focus:ring-sky-500 transition-all disabled:opacity-70 disabled:bg-gray-100 font-medium" required />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">Mobile Number</label>
                      <div className="relative">
                        <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="tel" disabled={!isEditing} value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-gray-800 focus:outline-none focus:border-sky-500 focus:bg-white focus:ring-1 focus:ring-sky-500 transition-all disabled:opacity-70 disabled:bg-gray-100 font-medium" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">Location / Address</label>
                      <div className="relative">
                        <FiMapPin className="absolute left-4 top-3 text-gray-400" />
                        <textarea disabled={!isEditing} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-gray-800 focus:outline-none focus:border-sky-500 focus:bg-white focus:ring-1 focus:ring-sky-500 transition-all disabled:opacity-70 disabled:bg-gray-100 font-medium resize-none h-24" />
                      </div>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                      <button type="button" onClick={() => { setIsEditing(false); setSuccessMsg(''); setImagePreview(null); setProfileImage(null); }} className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors">
                        Cancel
                      </button>
                      <button type="submit" disabled={loading} className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold shadow-lg transition-colors flex items-center gap-2 disabled:opacity-50">
                        {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><FiSave /> Save Changes</>}
                      </button>
                    </div>
                  )}
                </form>
              </motion.div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
                <h2 className="text-xl font-bold text-slate-900 mb-6 border-b border-gray-100 pb-4">Security Settings</h2>
                <form onSubmit={handleUpdateSecurity} className="max-w-md space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Current Password</label>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} required value={securityData.currentPassword} onChange={e => setSecurityData({...securityData, currentPassword: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-sky-500 focus:bg-white focus:ring-1 focus:ring-sky-500 transition-all" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">New Password</label>
                    <input type={showPassword ? "text" : "password"} required minLength={6} value={securityData.newPassword} onChange={e => setSecurityData({...securityData, newPassword: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-sky-500 focus:bg-white focus:ring-1 focus:ring-sky-500 transition-all" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Confirm New Password</label>
                    <input type={showPassword ? "text" : "password"} required minLength={6} value={securityData.confirmPassword} onChange={e => setSecurityData({...securityData, confirmPassword: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-sky-500 focus:bg-white focus:ring-1 focus:ring-sky-500 transition-all" />
                  </div>

                  <div className="pt-4">
                    <button type="submit" disabled={loading} className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-md transition-colors flex justify-center items-center gap-2 disabled:opacity-50">
                      {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Update Password'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
                <h2 className="text-xl font-bold text-slate-900 mb-6 border-b border-gray-100 pb-4">System Preferences</h2>
                <form onSubmit={handleUpdatePreferences} className="max-w-2xl space-y-6">
                  
                  <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                    <div>
                      <h4 className="font-bold text-slate-800">Email Notifications</h4>
                      <p className="text-xs text-gray-500 mt-0.5">Receive daily summaries and critical alerts via email.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={preferences.emailAlerts} onChange={e => setPreferences({...preferences, emailAlerts: e.target.checked})} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                    <div>
                      <h4 className="font-bold text-slate-800">SMS Alerts</h4>
                      <p className="text-xs text-gray-500 mt-0.5">Get text messages for immediate high-priority system events.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={preferences.smsAlerts} onChange={e => setPreferences({...preferences, smsAlerts: e.target.checked})} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                    <div>
                      <h4 className="font-bold text-slate-800">Two-Factor Authentication (2FA)</h4>
                      <p className="text-xs text-gray-500 mt-0.5">Require an additional OTP step during login.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={preferences.twoFactorAuth} onChange={e => setPreferences({...preferences, twoFactorAuth: e.target.checked})} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <button type="submit" disabled={loading} className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-md transition-colors flex items-center gap-2 disabled:opacity-50">
                      {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><FiSave /> Save Preferences</>}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
