import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiShield, FiX, FiCheck, FiSearch, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import api from "../../utils/api";
import { useTableFeatures } from '../../hooks/useTableFeatures';
import TablePagination from '../../components/TablePagination';

const availablePermissions = [
  'Dashboard', 'Devotees', 'Donations', 'Events', 
  'Announcements', 'Branches', 'Documents', 'Annadan',
  'Sansthan Updates', 'Gallery', 'Monastery History', 'Lineage', 'Accountants'
];

const systemRoles = ['Chairman', 'Vice Chairman', 'Secretary', 'Treasurer', 'Trust Member'];

const defaultPermissions = availablePermissions.map(p => ({ module: p, level: 'View' }));

const ManageTrustees = () => {
  const [trustees, setTrustees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '', email: '', mobile: '', designation: '', address: '', password: '', confirmPassword: '',
    systemRole: 'Trust Member', permissions: defaultPermissions, status: 'Active'
  });

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [verifiedToken, setVerifiedToken] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    searchTerm, setSearchTerm, sortConfig, handleSort,
    currentPage, setCurrentPage, itemsPerPage, setItemsPerPage,
    totalPages, paginatedData, totalItems
  } = useTableFeatures(trustees, ['name', 'email', 'mobile', 'designation', 'systemRole']);

  const fetchTrustees = async () => {
    try {
      const res = await api.get('/admins/trustees');
      setTrustees(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrustees();
  }, []);

  const handlePermissionChange = (moduleName, level) => {
    setFormData(prev => {
      const newPerms = (prev.permissions || []).filter(p => {
        if (typeof p === 'string') return p !== moduleName;
        return p.module !== moduleName;
      });
      newPerms.push({ module: moduleName, level });
      return { ...prev, permissions: newPerms };
    });
  };

  const handleSendOtp = async () => {
    if (!formData.email || !formData.name) {
      alert("Name and Email are required to send OTP");
      return;
    }
    try {
      await api.post('/admins/trustees/send-otp', { email: formData.email, name: formData.name });
      setOtpSent(true);
      alert("OTP sent to email");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send OTP");
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const res = await api.post('/admins/trustees/verify-otp', { email: formData.email, otp });
      setVerifiedToken(res.data.verifiedToken);
      setOtpVerified(true);
      alert("Email verified successfully");
    } catch (err) {
      alert(err.response?.data?.message || "Invalid OTP");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        if (formData.password && formData.password !== formData.confirmPassword) {
           alert("Passwords do not match");
           return;
        }
        await api.put(`/admins/trustees/${editingId}`, formData);
      } else {
        if (!otpVerified) {
          alert("Please verify email first");
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          alert("Passwords do not match");
          return;
        }
        await api.post('/admins/trustees', { ...formData, verifiedToken });
      }
      setIsModalOpen(false);
      setEditingId(null);
      fetchTrustees();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving trustee');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this Trust Member?")) {
      try {
        await api.delete(`/admins/trustees/${id}`);
        fetchTrustees();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const openEdit = (trustee) => {
    setOtpSent(false);
    setOtpVerified(false);
    setOtp('');
    setVerifiedToken('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setFormData({
      name: trustee.name,
      email: trustee.email,
      mobile: trustee.mobile,
      designation: trustee.designation,
      address: trustee.address,
      systemRole: trustee.systemRole || 'Trust Member',
      permissions: trustee.permissions && trustee.permissions.length > 0 
        ? trustee.permissions.map(p => typeof p === 'string' ? { module: p, level: 'View' } : p)
        : defaultPermissions,
      status: trustee.status || 'Active',
      password: '',
      confirmPassword: ''
    });
    setEditingId(trustee._id);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setOtpSent(false);
    setOtpVerified(false);
    setOtp('');
    setVerifiedToken('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setFormData({
      name: '', email: '', mobile: '', designation: '', address: '', password: '', confirmPassword: '',
      systemRole: 'Trust Member', permissions: defaultPermissions, status: 'Active'
    });
    setEditingId(null);
  };

  if (loading) return <div className="h-64 flex items-center justify-center"><div className="w-8 h-8 border-4 border-saffron-500 rounded-full border-t-transparent animate-spin"></div></div>;

  return (
    <div className="w-full space-y-6 text-gray-800 pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-900"><FiShield className="text-saffron-500" /> Trust Members Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage hierarchy, roles, and system access permissions.</p>
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
          <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="w-full sm:w-auto bg-gray-900 hover:bg-black text-white px-6 py-2.5 rounded-xl font-black transition-colors shadow-lg flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <FiPlus /> Add Member
          </button>
        </div>
      </div>

      {/* Visual Hierarchy */}
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
        <h2 className="text-lg font-bold mb-4 text-slate-900 border-b border-gray-100 pb-2">Trust Hierarchy</h2>
        <div className="flex flex-wrap gap-4">
          {systemRoles.map(role => {
            const count = trustees.filter(t => {
              const assignedRole = t.systemRole || 'Trust Member';
              return assignedRole.trim().toLowerCase() === role.trim().toLowerCase();
            }).length;
            return (
              <div key={role} className="flex-1 min-w-[150px] bg-gray-50 hover:bg-white hover:shadow-md transition-all rounded-xl p-4 border border-gray-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-saffron-100 rounded-bl-full opacity-50 group-hover:bg-saffron-200 transition-colors"></div>
                <h3 className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1 relative z-10">{role}</h3>
                <p className="text-2xl font-bold text-slate-900 relative z-10">{count}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* List */}
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                <th className="p-4 font-bold cursor-pointer hover:bg-gray-200 transition-colors" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-1">Member {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? <FiChevronUp/> : <FiChevronDown/>)}</div>
                </th>
                <th className="p-4 font-bold cursor-pointer hover:bg-gray-200 transition-colors" onClick={() => handleSort('systemRole')}>
                  <div className="flex items-center gap-1">Role / Designation {sortConfig.key === 'systemRole' && (sortConfig.direction === 'asc' ? <FiChevronUp/> : <FiChevronDown/>)}</div>
                </th>
                <th className="p-4 font-bold cursor-pointer hover:bg-gray-200 transition-colors" onClick={() => handleSort('email')}>
                  <div className="flex items-center gap-1">Contact {sortConfig.key === 'email' && (sortConfig.direction === 'asc' ? <FiChevronUp/> : <FiChevronDown/>)}</div>
                </th>
                <th className="p-4 font-bold cursor-pointer hover:bg-gray-200 transition-colors" onClick={() => handleSort('status')}>
                  <div className="flex items-center gap-1">Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? <FiChevronUp/> : <FiChevronDown/>)}</div>
                </th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {paginatedData.map(t => (
                <tr key={t._id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-slate-900">{t.name}</div>
                    <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-1">
                      {t.permissions?.slice(0, 3).map((p, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 bg-saffron-50 text-saffron-700 border border-saffron-100 rounded text-[10px] font-semibold">{p.module || p}</span>
                      ))}
                      {t.permissions?.length > 3 && <span className="text-[10px] text-gray-500 font-semibold">+{t.permissions.length - 3}</span>}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-slate-800 font-semibold">{t.systemRole || 'Trust Member'}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{t.designation}</div>
                  </td>
                  <td className="p-4 text-gray-600">
                    <div className="font-medium">{t.email}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{t.mobile}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${t.status === 'Active' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                      {t.status || 'Active'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(t)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><FiEdit2 /></button>
                      <button onClick={() => handleDelete(t._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedData.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">No Trust Members found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <TablePagination 
          currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage}
          totalItems={totalItems} itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage}
        />
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10 custom-scrollbar border border-gray-100">
              <div className="sticky top-0 bg-white p-6 border-b border-gray-100 flex justify-between items-center z-20">
                <h2 className="text-xl font-bold text-slate-900">{editingId ? 'Edit Trust Member' : 'Add Trust Member'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors"><FiX size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Full Name</label>
                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:border-saffron-500 focus:bg-white focus:ring-1 focus:ring-saffron-500 transition-all" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Email Address</label>
                    <div className="flex gap-2">
                      <input 
                        required 
                        type="email" 
                        value={formData.email} 
                        onChange={e => setFormData({...formData, email: e.target.value})} 
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:border-saffron-500 focus:bg-white focus:ring-1 focus:ring-saffron-500 transition-all disabled:bg-gray-100" 
                        disabled={!!editingId || otpVerified}
                      />
                      {!editingId && !otpVerified && (
                        <button 
                          type="button" 
                          onClick={handleSendOtp} 
                          className="bg-gray-800 text-white px-4 rounded-xl text-sm hover:bg-blue-900 hover:bg-blue-800 transition whitespace-nowrap font-bold"
                        >
                          {otpSent ? 'Resend OTP' : 'Send OTP'}
                        </button>
                      )}
                    </div>
                    {!editingId && otpVerified && (
                      <p className="text-green-600 text-xs font-bold mt-2 flex items-center gap-1"><FiCheck size={14}/> Email Verified Successfully</p>
                    )}
                  </div>

                  {!editingId && otpSent && !otpVerified && (
                    <div className="md:col-span-2 bg-saffron-50 p-4 rounded-xl border border-saffron-100">
                      <label className="block text-sm font-semibold text-saffron-900 mb-2">Enter Verification Code</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={otp} 
                          onChange={e => setOtp(e.target.value)}
                          placeholder="Enter OTP sent to email"
                          className="w-full px-4 py-2 rounded-xl border border-saffron-200 focus:border-saffron-500 focus:ring-2 focus:ring-saffron-200 outline-none transition-all bg-white" 
                        />
                        <button 
                          type="button" 
                          onClick={handleVerifyOtp} 
                          className="bg-blue-900 hover:bg-blue-800 text-white px-6 rounded-xl text-sm transition font-bold"
                        >
                          Verify
                        </button>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Mobile Number</label>
                    <input required type="text" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:border-saffron-500 focus:bg-white focus:ring-1 focus:ring-saffron-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Public Designation</label>
                    <input required type="text" value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:border-saffron-500 focus:bg-white focus:ring-1 focus:ring-saffron-500 transition-all" placeholder="e.g. Chief Trustee" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Address</label>
                  <input required type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:border-saffron-500 focus:bg-white focus:ring-1 focus:ring-saffron-500 transition-all" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">
                      {editingId ? 'New Password (Optional)' : 'Password'}
                    </label>
                    <input required={!editingId} type={showPassword ? "text" : "password"} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:border-saffron-500 focus:bg-white focus:ring-1 focus:ring-saffron-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">
                      {editingId ? 'Confirm New Password' : 'Confirm Password'}
                    </label>
                    <input required={!editingId || (editingId && formData.password.length > 0)} type={showConfirmPassword ? "text" : "password"} value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:border-saffron-500 focus:bg-white focus:ring-1 focus:ring-saffron-500 transition-all" />
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <h3 className="text-sm font-bold text-slate-900 mb-4">System Access & Roles</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">System Hierarchy Role</label>
                      <select value={formData.systemRole} onChange={e => setFormData({...formData, systemRole: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:border-saffron-500 focus:bg-white focus:ring-1 focus:ring-saffron-500 transition-all appearance-none">
                        {systemRoles.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Account Status</label>
                      <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:border-saffron-500 focus:bg-white focus:ring-1 focus:ring-saffron-500 transition-all appearance-none">
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>

                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Module Permissions</label>
                  <div className="flex flex-col gap-3">
                    {availablePermissions.map(perm => {
                      const modulePerm = (formData.permissions || []).find(p => p.module === perm || p === perm);
                      const level = modulePerm ? (modulePerm.level || 'View') : 'View';
                      return (
                        <div key={perm} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl gap-4">
                          <span className="font-bold text-gray-800 sm:w-1/3 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-saffron-500"></div> {perm}
                          </span>
                          <div className="flex flex-wrap sm:flex-nowrap gap-3 sm:w-2/3 sm:justify-end">
                            <label className={`flex-1 sm:flex-none flex items-center justify-center gap-2 cursor-pointer px-4 py-2.5 rounded-xl border transition-all ${level === 'View' ? 'bg-blue-50 border-blue-300 text-blue-800 font-bold shadow-sm' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                              <input type="radio" name={`perm-${perm}`} checked={level === 'View'} onChange={() => handlePermissionChange(perm, 'View')} className="hidden" /> View Only
                            </label>
                            <label className={`flex-1 sm:flex-none flex items-center justify-center gap-2 cursor-pointer px-4 py-2.5 rounded-xl border transition-all ${level === 'Manage' ? 'bg-blue-600 border-blue-600 text-white font-bold shadow-sm' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                              <input type="radio" name={`perm-${perm}`} checked={level === 'Manage'} onChange={() => handlePermissionChange(perm, 'Manage')} className="hidden" /> Manage
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-6 flex justify-end gap-3 border-t border-gray-100">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 font-bold transition-colors">Cancel</button>
                  <button type="submit" className="bg-blue-900 hover:bg-blue-800 text-white px-8 py-2.5 rounded-xl font-black transition-colors shadow-lg">
                    {editingId ? 'Save Changes' : 'Create Trust Member'}
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

export default ManageTrustees;
