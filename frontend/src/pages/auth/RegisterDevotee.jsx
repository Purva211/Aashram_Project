import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { UserCircle, Mail, Phone, Lock, ArrowLeft, Loader2, Key, Eye, EyeOff } from 'lucide-react';
import api from '../../utils/api';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { validateName, validateMobile, getPasswordError, getMobileError } from '../../utils/validationUtils';

const RegisterDevotee = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const returnUrl = location.state?.returnUrl;
  const [step, setStep] = useState(1); // 1 = Details, 2 = OTP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: ''
  });
  
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegisterSubmit = async (e) => {
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

    setLoading(true);
    setError('');

    try {
      await api.post('/auth/register', formData);
      setStep(2); // Move to OTP verification
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
      navigate('/login', { state: { returnUrl } });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-stone-100 to-orange-50 flex flex-col font-sans relative overflow-x-hidden">
      
      {/* Background Animated Elements (Slightly different from login) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-5%] left-[10%] w-[400px] h-[400px] bg-red-400/10 rounded-full blur-[100px] animate-[pulse_9s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-[10%] right-[-5%] w-[500px] h-[500px] bg-orange-400/10 rounded-full blur-[120px] animate-[pulse_11s_ease-in-out_infinite_reverse]"></div>
        <div className="absolute top-[30%] left-[70%] w-[250px] h-[250px] bg-amber-300/10 rounded-full blur-[80px] animate-[pulse_7s_ease-in-out_infinite]"></div>
      </div>

      <Navbar />
      
      <div className="flex-1 relative flex items-center justify-center py-32 px-4 sm:px-6 z-10">
        <div className="w-full max-w-lg mx-auto">
          
          {step === 1 && (
            <button onClick={() => navigate('/login', { state: { returnUrl } })} className="text-slate-500 hover:text-orange-600 flex items-center gap-2 mb-6 font-bold transition-colors uppercase tracking-wider text-xs">
              <ArrowLeft size={16} /> Back to Login
            </button>
          )}

          <div className="bg-white/90 backdrop-blur-2xl border border-white shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05),0_0_30px_rgba(255,165,0,0.05)] p-6 sm:p-8 md:p-12 rounded-[2.5rem] relative overflow-hidden group">
            
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-200/40 to-transparent rounded-full blur-[20px] pointer-events-none transform translate-x-1/3 -translate-y-1/3"></div>

            <div className="flex flex-col items-center mb-10 relative z-10">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 border border-orange-200 rounded-full flex items-center justify-center text-orange-600 shadow-[0_0_15px_rgba(255,165,0,0.2)] mb-5 transform hover:scale-110 transition-transform duration-300">
                {step === 1 ? <UserCircle size={40} /> : <Key size={40} />}
              </div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tight text-center">
                {step === 1 ? 'Devotee Registration' : 'Verify Email'}
              </h2>
              <p className="text-slate-500 font-bold text-sm mt-2 text-center uppercase tracking-wider">
                {step === 1 ? 'Join the temple community' : `OTP sent to ${formData.email}`}
              </p>
            </div>

            {error && (
              <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-600 px-4 py-3.5 rounded-2xl mb-8 text-sm text-center font-bold animate-[fadeIn_0.3s_ease-out]">
                {error}
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={handleRegisterSubmit} className="space-y-5 relative z-10">
                <div>
                  <label className="block text-slate-700 text-xs font-black mb-1.5 uppercase tracking-wider ml-1">Full Name</label>
                  <div className="relative">
                    <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input required type="text" pattern="[A-Za-z\s]+" title="Name must contain only alphabets and spaces" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value.replace(/[^A-Za-z\s]/g, '')})} className="w-full bg-slate-50/50 backdrop-blur-sm border border-slate-200 text-slate-800 rounded-2xl pl-11 pr-4 py-4 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-400/10 focus:bg-white transition-all placeholder:text-slate-400 font-bold shadow-sm" placeholder="Enter full name" />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 text-xs font-black mb-1.5 uppercase tracking-wider ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50/50 backdrop-blur-sm border border-slate-200 text-slate-800 rounded-2xl pl-11 pr-4 py-4 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-400/10 focus:bg-white transition-all placeholder:text-slate-400 font-bold shadow-sm" placeholder="Enter email address" />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 text-xs font-black mb-1.5 uppercase tracking-wider ml-1">Mobile Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input required type="tel" pattern="\d{10}" title="Mobile number must be exactly 10 digits" maxLength={10} value={formData.mobile} onChange={(e) => setFormData({...formData, mobile: e.target.value.replace(/\D/g, '')})} className="w-full bg-slate-50/50 backdrop-blur-sm border border-slate-200 text-slate-800 rounded-2xl pl-11 pr-4 py-4 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-400/10 focus:bg-white transition-all placeholder:text-slate-400 font-bold shadow-sm" placeholder="Enter mobile number" />
                  </div>
                </div>

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

                <button disabled={loading} type="submit" className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-black py-4 px-6 rounded-2xl uppercase tracking-widest text-xs hover:shadow-[0_10px_20px_rgba(255,165,0,0.3)] transform transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 mt-8 disabled:opacity-70 disabled:transform-none">
                  {loading ? <Loader2 className="animate-spin" /> : 'Register & Send OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleOtpSubmit} className="space-y-6 relative z-10 animate-[fadeIn_0.4s_ease-out]">
                <div>
                  <label className="block text-slate-700 text-sm font-black mb-3 text-center uppercase tracking-widest">Enter 6-Digit OTP</label>
                  <input required type="text" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} className="w-full bg-slate-50/50 backdrop-blur-sm border border-slate-200 text-slate-800 rounded-2xl px-4 py-5 text-center text-3xl tracking-[0.75em] font-black outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-400/10 focus:bg-white transition-all placeholder:text-slate-300 shadow-sm" placeholder="------" />
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
