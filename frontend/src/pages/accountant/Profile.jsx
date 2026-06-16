import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { User, Phone, MapPin, Mail, Shield, Lock, Save, Camera } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Profile = () => {
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: ''
  });
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || user.name || '',
        phone: user.phone || '',
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
      setProfileImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dataToUpdate = new FormData();
      dataToUpdate.append('fullName', formData.fullName);
      dataToUpdate.append('phone', formData.phone);
      dataToUpdate.append('address', formData.address);
      if (profileImageFile) {
        dataToUpdate.append('profileImage', profileImageFile);
      }

      const res = await api.put('/accountants/profile/me', dataToUpdate, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success("Profile updated successfully");
      
      // Update AuthContext user
      login(sessionStorage.getItem('token') || localStorage.getItem('token'), res.data.user);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-500 mt-1">Manage your personal information and preferences.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-indigo-50/50 p-6 border-b border-indigo-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 bg-white rounded-full border-4 border-indigo-100 shadow-sm flex items-center justify-center overflow-hidden">
              {(imagePreview || user?.profilePhoto) ? (
                <img src={imagePreview || `${API_URL}${user.profilePhoto}`} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-indigo-300">{formData.fullName.charAt(0) || 'A'}</span>
              )}
              <label className="absolute bottom-0 right-0 bg-indigo-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-indigo-700 transition">
                 <Camera size={12} />
                 <input type="file" onChange={handleImageChange} className="hidden" accept="image/*" />
              </label>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{formData.fullName || 'Accountant'}</h2>
              <p className="text-sm font-medium text-indigo-600 flex items-center gap-1 mt-1">
                <Shield size={14} /> Managed by Trustee
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Editable Fields */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <User size={16} className="text-gray-400" /> Full Name
              </label>
              <input 
                type="text" required
                value={formData.fullName}
                onChange={e => setFormData({...formData, fullName: e.target.value})}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Phone size={16} className="text-gray-400" /> Phone Number
              </label>
              <input 
                type="text" required
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <MapPin size={16} className="text-gray-400" /> Residential Address
              </label>
              <textarea 
                required rows="3"
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
            </div>

            {/* Read Only Fields */}
            <div className="col-span-1 md:col-span-2 pt-6 border-t border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">System Information</h3>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Mail size={16} className="text-gray-400" /> Email Address (Read Only)
              </label>
              <input 
                type="email" disabled
                value={user?.email || ''}
                className="w-full border border-gray-200 bg-gray-50 text-gray-500 rounded-lg p-3 outline-none cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Shield size={16} className="text-gray-400" /> System Role (Read Only)
              </label>
              <input 
                type="text" disabled
                value={user?.role || 'Accountant'}
                className="w-full border border-gray-200 bg-gray-50 text-gray-500 rounded-lg p-3 outline-none cursor-not-allowed"
              />
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Lock size={16} className="text-gray-400" /> Password (Read Only)
              </label>
              <div className="relative">
                <input 
                  type="password" disabled
                  value="****************"
                  className="w-full border border-gray-200 bg-gray-50 text-gray-500 rounded-lg p-3 outline-none cursor-not-allowed"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 bg-gray-200 px-2 py-1 rounded">Managed by Trustee</span>
              </div>
            </div>

          </div>

          <div className="flex justify-end pt-6 border-t border-gray-100">
            <button 
              type="submit" 
              disabled={loading}
              className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] disabled:opacity-70"
            >
              <Save size={18} /> {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
