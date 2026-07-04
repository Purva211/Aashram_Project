import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { FaUserShield, FaPlus, FaTrash, FaTimes, FaSave, FaBuilding, FaEdit, FaEye, FaEyeSlash } from 'react-icons/fa';
import { FiSearch, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import { CheckCircle } from 'lucide-react';
import { useTableFeatures } from '../../hooks/useTableFeatures';
import TablePagination from '../../components/TablePagination';
import { motion, AnimatePresence } from 'framer-motion';

const ManageBranchManagers = () => {
  const [managers, setManagers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedManager, setSelectedManager] = useState(null);
  
  const [formData, setFormData] = useState({ name: '', managerId: '', email: '', mobile: '', address: '', branch: '', password: '', confirmPassword: '' });
  const [submitting, setSubmitting] = useState(false);

  // OTP Verification States
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [verifiedToken, setVerifiedToken] = useState('');
  const [otp, setOtp] = useState('');

  // Password Visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    searchTerm, setSearchTerm, sortConfig, handleSort,
    currentPage, setCurrentPage, itemsPerPage, setItemsPerPage,
    totalPages, paginatedData, totalItems
  } = useTableFeatures(managers, ['name', 'managerId', 'email', 'branch.name']);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [managersRes, branchRes] = await Promise.all([
        api.get('/admins/branch-managers'),
        api.get('/branches')
      ]);
      setManagers(managersRes.data.data || []);
      setBranches(branchRes.data.branches || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mode, manager = null) => {
    setModalMode(mode);
    setOtpSent(false);
    setOtpVerified(false);
    setOtp('');
    setVerifiedToken('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    
    if (mode === 'edit' && manager) {
      setSelectedManager(manager);
      setFormData({ 
        name: manager.name, 
        managerId: manager.managerId, 
        email: manager.email, 
        mobile: manager.mobile, 
        address: manager.address, 
        branch: manager.branch ? manager.branch._id : '', 
        password: '', 
        confirmPassword: '' 
      });
    } else {
      setSelectedManager(null);
      setFormData({ name: '', managerId: '', email: '', mobile: '', address: '', branch: '', password: '', confirmPassword: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSendOtp = async () => {
    if (!formData.email || !formData.name) {
      alert("Name and Email are required to send OTP");
      return;
    }
    try {
      await api.post('/admins/branch-managers/send-otp', { email: formData.email, name: formData.name });
      setOtpSent(true);
      alert("OTP sent to email");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send OTP");
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const res = await api.post('/admins/branch-managers/verify-otp', { email: formData.email, otp });
      setVerifiedToken(res.data.verifiedToken);
      setOtpVerified(true);
      alert("Email verified successfully");
    } catch (err) {
      alert(err.response?.data?.message || "Invalid OTP");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (modalMode === 'add') {
        if (!otpVerified) {
          alert("Please verify email first");
          setSubmitting(false);
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          alert("Passwords do not match");
          setSubmitting(false);
          return;
        }
        await api.post('/admins/branch-managers', { ...formData, verifiedToken });
      } else {
        // Edit mode
        if (formData.password && formData.password !== formData.confirmPassword) {
           alert("Passwords do not match");
           setSubmitting(false);
           return;
        }
        await api.put(`/admins/branch-managers/${selectedManager._id}`, formData);
      }
      fetchData();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving branch manager:', error);
      alert(error.response?.data?.message || 'Error saving Branch Manager.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this Branch Manager?')) {
      try {
        await api.delete(`/admins/branch-managers/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting branch manager:', error);
        alert('Error deleting branch manager.');
      }
    }
  };

  return (
    <div className="h-full flex flex-col relative z-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 font-serif">Branch Managers</h1>
          <p className="text-gray-500">Manage branch managers and assign them to specific branches.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto mt-4 md:mt-0">
          <div className="relative w-full sm:w-auto">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search managers..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500 w-full sm:w-full sm:w-full sm:w-64 shadow-sm transition-all"
            />
          </div>
          <button
            onClick={() => handleOpenModal('add')}
            className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-xl shadow-lg transition-colors font-black whitespace-nowrap"
          >
            <FaPlus /> Add Manager
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 flex-1 overflow-hidden flex flex-col relative z-20">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm uppercase tracking-wider">
                <th className="p-6 font-semibold cursor-pointer hover:bg-gray-200 transition-colors" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-1">Manager Info {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? <FiChevronUp/> : <FiChevronDown/>)}</div>
                </th>
                <th className="p-6 font-semibold cursor-pointer hover:bg-gray-200 transition-colors" onClick={() => handleSort('branch.name')}>
                  <div className="flex items-center gap-1">Assigned Branch {sortConfig.key === 'branch.name' && (sortConfig.direction === 'asc' ? <FiChevronUp/> : <FiChevronDown/>)}</div>
                </th>
                <th className="p-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="3" className="text-center py-12 text-gray-500">Loading branch managers...</td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center py-12 text-gray-500">No branch managers found.</td>
                </tr>
              ) : (
                paginatedData.map((manager) => (
                  <tr key={manager._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-6">
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                          <FaUserShield />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{manager.name}</p>
                          <p className="text-xs text-gray-500">{manager.email} | ID: {manager.managerId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 text-gray-600">
                      {manager.branch ? (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 font-bold rounded-full text-sm inline-flex items-center gap-1">
                          <FaBuilding /> {manager.branch.name}
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-red-100 text-red-700 font-bold rounded-full text-sm">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal('edit', manager)}
                          className="w-10 h-10 inline-flex rounded-lg bg-orange-50 text-orange-600 items-center justify-center hover:bg-orange-600 hover:text-white transition-colors"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(manager._id)}
                          className="w-10 h-10 inline-flex rounded-lg bg-red-50 text-red-600 items-center justify-center hover:bg-red-600 hover:text-white transition-colors"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && totalItems > 0 && (
          <TablePagination 
            currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage}
            totalItems={totalItems} itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage}
          />
        )}
      </div>

      {/* Modal for Add/Edit Branch Manager */}
      <AnimatePresence>
      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={handleCloseModal}
            ></motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 p-6 text-white flex justify-between items-center">
                <h3 className="text-xl font-bold font-serif">{modalMode === 'add' ? 'Create Branch Manager' : 'Edit Branch Manager'}</h3>
                <button onClick={handleCloseModal} className="text-white/80 hover:text-white transition-colors">
                  <FaTimes className="text-xl" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                      placeholder="e.g. Rahul Sharma"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Manager ID</label>
                    <input
                      type="text"
                      value={formData.managerId}
                      onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all disabled:bg-gray-100"
                      placeholder="e.g. BM001"
                      required
                      disabled={modalMode === 'edit'}
                    />
                  </div>

                  {/* Email & OTP Section */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all disabled:bg-gray-100"
                        placeholder="manager@branch.com"
                        required
                        disabled={modalMode === 'edit' || otpVerified}
                      />
                      {modalMode === 'add' && !otpVerified && (
                        <button 
                          type="button" 
                          onClick={handleSendOtp} 
                          className="bg-gray-800 text-white px-4 rounded-xl text-sm hover:bg-blue-900 hover:bg-blue-800 transition whitespace-nowrap font-bold"
                        >
                          {otpSent ? 'Resend OTP' : 'Send OTP'}
                        </button>
                      )}
                    </div>
                    {modalMode === 'add' && otpVerified && (
                      <p className="text-green-600 text-xs font-bold mt-2 flex items-center gap-1"><CheckCircle size={14}/> Email Verified Successfully</p>
                    )}
                  </div>

                  {modalMode === 'add' && otpSent && !otpVerified && (
                    <div className="md:col-span-2 bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                      <label className="block text-sm font-semibold text-emerald-900 mb-2">Enter Verification Code</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={otp} 
                          onChange={e => setOtp(e.target.value)}
                          placeholder="Enter OTP sent to email"
                          className="w-full px-4 py-2 rounded-xl border border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all" 
                        />
                        <button 
                          type="button" 
                          onClick={handleVerifyOtp} 
                          className="bg-emerald-600 text-white px-6 rounded-xl text-sm hover:bg-emerald-700 transition font-bold"
                        >
                          Verify
                        </button>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Mobile Number</label>
                    <input
                      type="text"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                      placeholder="10-digit number"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Assign to Branch</label>
                    <select
                      value={formData.branch}
                      onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                      required
                    >
                      <option value="">Select a Branch</option>
                      {branches.map(b => {
                        const isAssigned = managers.some(m => m.branch?._id === b._id && m._id !== selectedManager?._id);
                        if (isAssigned) return null;
                        return <option key={b._id} value={b._id}>{b.name}</option>;
                      })}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                      placeholder="Manager's residential address"
                      required
                    />
                  </div>

                  {/* Passwords */}
                  <div className="md:col-span-2 pt-4 mt-2 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {modalMode === 'edit' ? 'New Password (Optional)' : 'Password'}
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                          placeholder="Enter a secure password"
                          required={modalMode === 'add'}
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {modalMode === 'edit' ? 'Confirm New Password' : 'Confirm Password'}
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                          placeholder="Confirm password"
                          required={modalMode === 'add' || (modalMode === 'edit' && formData.password.length > 0)}
                        />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-6 py-3 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 rounded-xl font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-lg"
                  >
                    <FaSave /> {submitting ? 'Saving...' : (modalMode === 'add' ? 'Create Manager' : 'Save Changes')}
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

export default ManageBranchManagers;
