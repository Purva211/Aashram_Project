import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiLock, FiShield, FiSave, FiBell, FiGlobe, FiClock, FiActivity, FiMoon, FiSun } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';

const DocumentAdminProfile = () => {
  const { user, login } = useAuth();
  const { i18n } = useTranslation();
  
  const [formData, setFormData] = useState({
    contactNo: user?.contactNo || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [preferences, setPreferences] = useState({
    language: 'English', theme: 'Light',
    showActivities: true, showBranches: true, showDonations: true, showEvents: true
  });

  useEffect(() => {
    // Load preferences from global adminPreferences for consistency
    const savedPrefs = localStorage.getItem('adminPreferences');
    if (savedPrefs) {
      try {
        const parsed = JSON.parse(savedPrefs);
        setPreferences(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error("Failed to parse preferences", e);
      }
    }
  }, []);

  const handleTogglePref = (key) => {
    setPreferences(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem('adminPreferences', JSON.stringify(updated));
      window.dispatchEvent(new Event('preferencesUpdated'));
      return updated;
    });
  };

  const handleThemeChange = (newTheme) => {
    setPreferences(prev => {
      const updated = { ...prev, theme: newTheme };
      localStorage.setItem('adminPreferences', JSON.stringify(updated));
      return updated;
    });
    window.dispatchEvent(new Event('preferencesUpdated'));
  };
  
  const Toggle = ({ enabled, onChange }) => (
    <div 
      onClick={onChange}
      className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${enabled ? 'bg-indigo-500' : 'bg-slate-300'}`}
    >
      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${enabled ? 'translate-x-6' : ''}`} />
    </div>
  );

  const [profileImageFile, setProfileImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const dataToUpdate = new FormData();
      dataToUpdate.append('contactNo', formData.contactNo);
      if (profileImageFile) {
        dataToUpdate.append('profileImage', profileImageFile);
      }

      const res = await api.put('/document-admin/profile', dataToUpdate, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        login(sessionStorage.getItem('token') || localStorage.getItem('token'), res.data.data);
      }
      setMessage({ type: 'success', text: res.data.message });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    setPasswordLoading(true);
    setPasswordMessage({ type: '', text: '' });

    try {
      const res = await api.put('/document-admin/password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      setPasswordMessage({ type: 'success', text: res.data.message });
      setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    } catch (err) {
      setPasswordMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update password' });
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">My Profile</h1>
        <p className="text-slate-500 mt-1">Manage your document handler account settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info Card */}
        <div className="lg:col-span-1">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center"
          >
            <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-4xl mb-4 shadow-inner relative overflow-hidden group">
              {(imagePreview || user?.profilePhoto) ? (
                <img src={imagePreview || `${API_URL}${user.profilePhoto}`} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <FiUser />
              )}
              <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <span className="text-white text-xs font-bold uppercase tracking-wider">Change</span>
                <input type="file" onChange={handleImageChange} accept="image/*" className="hidden" />
              </label>
            </div>
            <h2 className="text-xl font-bold text-slate-800">{user.email.split('@')[0]}</h2>
            <div className="flex items-center gap-1 text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mt-2 mb-4">
              <FiShield className="text-indigo-500" /> Document Handler
            </div>
            
            <div className="w-full space-y-3 mt-4 text-left">
              <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-xl">
                <FiMail className="text-slate-400" />
                <span className="text-sm truncate" title={user.email}>{user.email}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-xl">
                <FiPhone className="text-slate-400" />
                <span className="text-sm">{user.contactNo || 'No contact provided'}</span>
              </div>
            </div>
            
            <p className="text-xs text-slate-400 mt-6 bg-slate-50 p-3 rounded-xl italic">
              Email address is managed by the Trustee and cannot be changed here.
            </p>
          </motion.div>
        </div>

        {/* Update Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Details Form */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100"
          >
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <FiUser className="text-indigo-500" /> Profile Details
            </h3>
            
            {message.text && (
              <div className={`p-3 rounded-xl mb-4 text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={user.email} 
                  disabled
                  className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contact Number</label>
                <input 
                  type="text" 
                  name="contactNo"
                  value={formData.contactNo}
                  onChange={handleChange}
                  placeholder="Enter contact number"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                />
              </div>
              
              <div className="flex justify-end pt-2">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors disabled:opacity-70 shadow-lg shadow-indigo-200"
                >
                  {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiSave />}
                  Update Profile
                </button>
              </div>
            </form>
          </motion.div>

          {/* Password Form */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100"
          >
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <FiLock className="text-indigo-500" /> Change Password
            </h3>
            
            {passwordMessage.text && (
              <div className={`p-3 rounded-xl mb-4 text-sm font-medium ${passwordMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                {passwordMessage.text}
              </div>
            )}

            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                <input 
                  type="password" 
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  required
                  placeholder="Enter current password"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                  <input 
                    type="password" 
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    required
                    placeholder="Enter new password"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                  <input 
                    type="password" 
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="Confirm new password"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                  />
                </div>
              </div>
              
              <div className="flex justify-end pt-2">
                <button 
                  type="submit" 
                  disabled={passwordLoading}
                  className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors disabled:opacity-70 shadow-lg shadow-slate-200"
                >
                  {passwordLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiLock />}
                  Update Password
                </button>
              </div>
            </form>
          </motion.div>
          {/* Preferences Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mt-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FiBell className="text-indigo-500" /> Preferences
              </h3>
            </div>
            
            <div className="space-y-6">
              
              {/* Dashboard Items */}
              <div>
                <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2"><FiActivity className="text-indigo-500" /> Dashboard Items</h4>
                <div className="bg-slate-50 rounded-xl p-5 space-y-4 border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Show Recent Activities</span>
                    <Toggle enabled={preferences.showActivities} onChange={() => handleTogglePref('showActivities')} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Show Branch Statistics</span>
                    <Toggle enabled={preferences.showBranches} onChange={() => handleTogglePref('showBranches')} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Show Donation Analytics</span>
                    <Toggle enabled={preferences.showDonations} onChange={() => handleTogglePref('showDonations')} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Show Upcoming Events</span>
                    <Toggle enabled={preferences.showEvents} onChange={() => handleTogglePref('showEvents')} />
                  </div>
                </div>
              </div>

              {/* Localization */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-slate-800 flex items-center gap-2"><FiGlobe className="text-indigo-500" /> Localization</h4>
                  <button 
                    onClick={() => {
                      let lngCode = 'en';
                      if (preferences.language === 'Hindi') lngCode = 'hi';
                      if (preferences.language === 'Marathi') lngCode = 'mr';
                      i18n.changeLanguage(lngCode);
                      document.cookie = `googtrans=/en/${lngCode}; path=/;`;
                      document.cookie = `googtrans=/en/${lngCode}; path=/; domain=${window.location.hostname};`;
                      setMessage({ type: 'success', text: 'Language saved.' });
                      setTimeout(() => { setMessage({ type: '', text: '' }); window.location.reload(); }, 1000);
                    }}
                    className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  >
                    Save Language
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Display Language</label>
                    <select 
                      value={preferences.language} 
                      onChange={(e) => setPreferences({...preferences, language: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none"
                    >
                      <option value="English">English</option>
                      <option value="Hindi">Hindi (हिंदी)</option>
                      <option value="Marathi">Marathi (मराठी)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Theme</label>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleThemeChange('Light')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border font-medium transition-all ${preferences.theme === 'Light' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                      >
                        <FiSun className="text-lg" /> Light
                      </button>
                      <button 
                        onClick={() => handleThemeChange('Dark')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border font-medium transition-all ${preferences.theme === 'Dark' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                      >
                        <FiMoon className="text-lg" /> Dark
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DocumentAdminProfile;
