import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, Users, UserCircle, Building, FileText, Loader2, Calculator, Eye, EyeOff, Key } from 'lucide-react';
import api from '../../utils/api';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { GoogleLogin } from '@react-oauth/google';

const initialRoles = [
  { id: 'Devotee', title: 'Devotee', icon: <UserCircle size={32} /> },
  { id: 'Other', title: 'Other Roles', icon: <Shield size={32} /> }
];

const adminRoles = [
  { id: 'Admin', title: 'Main Admin', icon: <Shield size={32} /> },
  { id: 'Trustee', title: 'Main Trustee', icon: <Users size={32} /> },
  { id: 'BranchManager', title: 'Branch Manager', icon: <Building size={32} /> },
  { id: 'DocumentHandler', title: 'Document Handler', icon: <FileText size={32} /> },
  { id: 'Accountant', title: 'Accountant', icon: <Calculator size={32} /> }
];

const LoginSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const returnUrl = location.state?.returnUrl;
  const { login } = useAuth();
  
  const [selectedRole, setSelectedRole] = useState('Devotee');
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [pinEntry, setPinEntry] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [verifyingPin, setVerifyingPin] = useState(false);
  const [pinError, setPinError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    managerId: '',
    branchId: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [branches, setBranches] = useState([]);
  
  // Reset state when role changes
  useEffect(() => {
    setError('');
    setSuccessMsg('');
    setPinError('');
  }, [selectedRole]);

  useEffect(() => {
    if (selectedRole === 'BranchManager' && branches.length === 0) {
      api.get('/branches').then(res => setBranches(res.data.branches)).catch(console.error);
    }
  }, [selectedRole, branches.length]);

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
    setError('');
    setPinError('');
  };

  const handlePinSubmit = async (e) => {
    e.preventDefault();
    setVerifyingPin(true);
    setPinError('');
    try {
      const res = await api.post('/auth/verify-pin', { pin: pinEntry });
      if (res.data.success) {
         setIsAdminUnlocked(true);
         setSelectedRole('Admin'); // default to Admin once unlocked
      }
    } catch (err) {
      setPinError(err.response?.data?.message || 'Incorrect PIN');
    } finally {
      setVerifyingPin(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      // Proceed with standard auth for all roles

      const payload = { role: selectedRole, password: formData.password };
      
      if (selectedRole === 'BranchManager') {
        payload.managerId = formData.managerId;
        payload.branchId = formData.branchId;
      } else {
        payload.email = formData.email;
      }

      const res = await api.post('/auth/login', payload);
      login(res.data.token, res.data.user);
      
      // Navigate based on role
      if (selectedRole === 'Admin') navigate('/admin/dashboard');
      else if (selectedRole === 'Trustee') navigate('/trustee/dashboard');
      else if (selectedRole === 'Devotee') {
        if (returnUrl) navigate(returnUrl);
        else navigate('/devotee/dashboard');
      }
      else if (selectedRole === 'BranchManager') navigate('/branch/dashboard');
      else if (selectedRole === 'DocumentHandler') navigate('/document-handler/dashboard');
      else if (selectedRole === 'Accountant') navigate('/accountant/dashboard');

    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/google-login', {
        credential: credentialResponse.credential,
        selectedRole: selectedRole
      });
      if (res.data.success) {
        login(res.data.token, res.data.user);
        
        const role = res.data.role;
        if (role === 'Admin') navigate('/admin/dashboard');
        else if (role === 'Trustee') navigate('/trustee/dashboard');
        else if (role === 'Devotee') {
          if (returnUrl) navigate(returnUrl);
          else navigate('/devotee/dashboard');
        }
        else if (role === 'BranchManager') navigate('/branch/dashboard');
        else if (role === 'Accountant') navigate('/accountant/dashboard');
        else navigate('/');
      }
    } catch (err) {
      console.error("Google Login Error:", err);
      setError(err.response?.data?.message || 'Google Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google Sign-In failed or was cancelled.');
  };

  const activeRoles = isAdminUnlocked ? adminRoles : initialRoles;
  const currentRoleConfig = activeRoles.find(r => r.id === selectedRole) || (isAdminUnlocked ? adminRoles[0] : initialRoles[0]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-light via-cream to-amber-50 flex flex-col font-sans selection:bg-gold selection:text-caramel-deep overflow-x-hidden relative">
      
      {/* Background Animated Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[100px] animate-[pulse_8s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-red-500/10 rounded-full blur-[120px] animate-[pulse_10s_ease-in-out_infinite_reverse]"></div>
        <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] bg-orange-400/10 rounded-full blur-[80px] animate-[pulse_6s_ease-in-out_infinite]"></div>
      </div>

      <Navbar />
      
      <div className="flex-1 relative flex items-center justify-center py-32 px-4 sm:px-6 z-10">
        <div className="w-full max-w-xl mx-auto">
          
          <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-6 sm:p-8 md:p-12 border border-white/60 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1),0_0_20px_rgba(255,165,0,0.1)] relative overflow-hidden group transition-all duration-500 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1),0_0_40px_rgba(255,165,0,0.15)]">
            
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-amber-200/40 to-transparent rounded-full blur-[30px] pointer-events-none transform translate-x-1/3 -translate-y-1/3 transition-colors duration-500"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-orange-200/40 to-transparent rounded-full blur-[20px] pointer-events-none transform -translate-x-1/4 translate-y-1/4"></div>

            <div className="flex flex-col items-center text-center mb-10 relative z-10">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-50 to-orange-100 rounded-full border border-orange-200/50 flex items-center justify-center mb-5 text-orange-600 shadow-[0_0_15px_rgba(255,165,0,0.2)] hover:scale-110 transition-transform duration-300 cursor-default">
                 {currentRoleConfig?.icon}
              </div>
              <h2 className="text-orange-600/80 font-black uppercase tracking-[0.25em] text-xs mb-2 flex items-center gap-3 justify-center">
                <span className="w-10 h-px bg-gradient-to-r from-transparent to-orange-400/50"></span>
                Secure Login
                <span className="w-10 h-px bg-gradient-to-l from-transparent to-orange-400/50"></span>
              </h2>
              <h3 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">Access Portal</h3>
            </div>

            {error && (
              <div className="bg-red-50/80 backdrop-blur-sm text-red-600 px-4 py-3.5 rounded-2xl mb-8 text-sm text-center border border-red-200/50 flex items-center justify-center gap-2 font-medium animate-[fadeIn_0.3s_ease-out]">
                <Shield size={16} className="shrink-0" />
                {error}
              </div>
            )}

            {successMsg && (
              <div className="bg-emerald-50/80 backdrop-blur-sm text-emerald-600 px-4 py-3.5 rounded-2xl mb-8 text-sm text-center border border-emerald-200/50 font-medium animate-[fadeIn_0.3s_ease-out]">
                {successMsg}
              </div>
            )}

            {!isAdminUnlocked && selectedRole === 'Other' ? (
              // PIN Entry Form
              <form onSubmit={handlePinSubmit} className="space-y-5 relative z-10 animate-[fadeIn_0.4s_ease-out]">
                
                <div className="group/field mb-4">
                  <label className="block text-slate-700 text-xs font-bold mb-1.5 uppercase tracking-wider ml-1">Select Role</label>
                  <div className="relative">
                    <select 
                      value={selectedRole} 
                      onChange={handleRoleChange} 
                      className="w-full bg-slate-50/50 backdrop-blur-sm border border-slate-200 text-slate-800 rounded-2xl px-5 py-4 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-400/10 focus:bg-white transition-all appearance-none [&>option]:bg-white shadow-sm font-medium cursor-pointer"
                    >
                      {initialRoles.map(r => (
                        <option key={r.id} value={r.id}>{r.title}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-slate-400">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>
                </div>

                {pinError && (
                  <div className="bg-red-50/80 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm text-center border border-red-200/50 font-medium animate-[pulse_0.3s_ease-out]">
                    {pinError}
                  </div>
                )}

                <div>
                  <label className="block text-slate-700 text-xs font-bold mb-1.5 uppercase tracking-wider ml-1">Admin Access PIN</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <Key size={18} />
                    </div>
                    <input 
                      required 
                      type={showPin ? "text" : "password"} 
                      value={pinEntry} 
                      onChange={(e) => setPinEntry(e.target.value)} 
                      className="w-full bg-slate-50/50 backdrop-blur-sm border border-slate-200 text-slate-800 rounded-2xl pl-12 pr-12 py-4 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-400/10 focus:bg-white transition-all placeholder:text-slate-400 shadow-sm font-bold tracking-widest" 
                      placeholder="••••••••" 
                      autoFocus
                    />
                    <button type="button" onClick={() => setShowPin(!showPin)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-500 transition-colors p-1">
                      {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 ml-2 font-medium">Please enter the security PIN to access administrative roles.</p>
                </div>

                <button disabled={verifyingPin} type="submit" className="w-full mt-8 bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-black text-white font-bold py-4 px-6 rounded-2xl uppercase tracking-widest text-xs hover:shadow-[0_10px_20px_rgba(0,0,0,0.2)] transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:transform-none">
                  {verifyingPin ? <Loader2 className="animate-spin" /> : 'Unlock Access'}
                </button>
              </form>
            ) : (
              // Standard Login Form
              <form onSubmit={handleSubmit} className="space-y-5 relative z-10 animate-[fadeIn_0.4s_ease-out]">
                
                <div className="group/field">
                  <label className="block text-slate-700 text-xs font-bold mb-1.5 uppercase tracking-wider ml-1">Select Role</label>
                  <div className="relative">
                    <select 
                      value={selectedRole} 
                      onChange={handleRoleChange} 
                      className="w-full bg-slate-50/50 backdrop-blur-sm border border-slate-200 text-slate-800 rounded-2xl px-5 py-4 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-400/10 focus:bg-white transition-all appearance-none [&>option]:bg-white shadow-sm font-medium cursor-pointer"
                    >
                      {activeRoles.map(r => (
                        <option key={r.id} value={r.id}>{r.title}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-slate-400 group-hover/field:text-orange-500 transition-colors">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>
                </div>

                {selectedRole === 'BranchManager' && (
                  <div className="space-y-5 animate-[fadeIn_0.4s_ease-out]">
                    <div>
                      <label className="block text-slate-700 text-xs font-bold mb-1.5 uppercase tracking-wider ml-1">Branch</label>
                      <div className="relative">
                        <select required value={formData.branchId} onChange={(e) => setFormData({...formData, branchId: e.target.value})} className="w-full bg-slate-50/50 backdrop-blur-sm border border-slate-200 text-slate-800 rounded-2xl px-5 py-4 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-400/10 focus:bg-white transition-all appearance-none [&>option]:bg-white shadow-sm font-medium">
                          <option value="">Select Branch</option>
                          {branches.map(b => (
                            <option key={b._id} value={b._id}>{b.name}</option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-slate-400">
                          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-700 text-xs font-bold mb-1.5 uppercase tracking-wider ml-1">Manager ID</label>
                      <input required type="text" value={formData.managerId} onChange={(e) => setFormData({...formData, managerId: e.target.value})} className="w-full bg-slate-50/50 backdrop-blur-sm border border-slate-200 text-slate-800 rounded-2xl px-5 py-4 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-400/10 focus:bg-white transition-all placeholder:text-slate-400 shadow-sm font-medium" placeholder="Enter your Manager ID" />
                    </div>
                  </div>
                )}

                {['Admin', 'Trustee', 'Devotee', 'DocumentHandler', 'Accountant'].includes(selectedRole) && (
                  <div className="animate-[fadeIn_0.4s_ease-out]">
                    <label className="block text-slate-700 text-xs font-bold mb-1.5 uppercase tracking-wider ml-1">Email Address</label>
                    <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50/50 backdrop-blur-sm border border-slate-200 text-slate-800 rounded-2xl px-5 py-4 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-400/10 focus:bg-white transition-all placeholder:text-slate-400 shadow-sm font-medium" placeholder="Enter your email" />
                  </div>
                )}

                <div className="animate-[fadeIn_0.4s_ease-out]">
                  <div className="flex items-center justify-between mb-1.5 ml-1 mr-1">
                    <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider">Password</label>
                    {selectedRole === 'Devotee' && (
                      <Link to="/forgot-password" className="text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors">Forgot?</Link>
                    )}
                  </div>
                  <div className="relative">
                    <input required autoComplete="current-password" type={showPassword ? "text" : "password"} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full bg-slate-50/50 backdrop-blur-sm border border-slate-200 text-slate-800 rounded-2xl px-5 py-4 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-400/10 focus:bg-white transition-all placeholder:text-slate-400 shadow-sm font-medium" placeholder="Enter your password" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-500 transition-colors p-1">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button disabled={loading} type="submit" className="w-full mt-8 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-2xl uppercase tracking-widest text-xs hover:shadow-[0_10px_20px_rgba(255,165,0,0.3)] transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:transform-none">
                  {loading ? <Loader2 className="animate-spin" /> : 'Sign In Securely'}
                </button>

              </form>
            )}

            {selectedRole === 'Devotee' && (
              <>
                <div className="flex items-center my-8 relative z-10">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 to-slate-200"></div>
                  <span className="px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Or</span>
                  <div className="flex-1 h-px bg-gradient-to-l from-transparent via-slate-200 to-slate-200"></div>
                </div>

                {/* Google Login Section */}
                <div className="mb-8 relative z-10 flex justify-center transform hover:scale-[1.02] transition-transform duration-300">
                  <GoogleLogin 
                    onSuccess={handleGoogleSuccess} 
                    onError={handleGoogleError} 
                    shape="pill" 
                    theme="outline" 
                    size="large"
                    text="continue_with"
                  />
                </div>

                <div className="mt-8 text-center pt-6 border-t border-slate-200 relative z-10">
                  <p className="text-slate-500 text-sm mb-2 font-medium">New to the Sansthan?</p>
                  <Link to="/register" state={{ returnUrl }} className="inline-flex items-center gap-2 text-slate-800 hover:text-orange-600 font-extrabold text-sm uppercase tracking-wider transition-colors group">
                    Create Devotee Account
                    <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LoginSelection;
