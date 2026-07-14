import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiDollarSign, FiCalendar, FiBell, FiMapPin, FiFileText, FiShield, FiHeart, FiClock, FiPlus, FiActivity } from 'react-icons/fi';
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import AnimatedCounter from '../../components/dashboard/AnimatedCounter';

const StatCard = ({ title, value, icon, gradient, delay }) => (
  <div 
    className="bg-white p-4 md:p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300 flex items-center gap-4 md:gap-5"
  >
    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} rounded-bl-full opacity-10 group-hover:opacity-20 transition-opacity duration-300 blur-xl`}></div>
    <div className={`w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-xl md:rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md text-white text-xl md:text-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 relative z-10`}>
      {icon}
    </div>
    <div className="relative z-10 flex-1">
      <h3 className="text-slate-500 font-semibold text-xs md:text-sm tracking-wide uppercase mb-1">{title}</h3>
      <p className="text-xl md:text-3xl font-bold tracking-tight text-slate-900 leading-none">{value}</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [preferences, setPreferences] = useState({ showActivities: true, showBranches: true, showDonations: true });
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Load local preferences
    const savedPrefs = localStorage.getItem('adminPreferences');
    if (savedPrefs) {
      try {
        setPreferences(prev => ({ ...prev, ...JSON.parse(savedPrefs) }));
      } catch (e) {}
    }

    Promise.all([
      api.get('/admins/stats'),
      api.get('/audit-logs').catch(() => ({ data: { logs: [] } }))
    ]).then(([statsRes, logsRes]) => {
      setStats(statsRes.data.stats);
      
      // Filter logs for the last 3 hours and ONLY for the current admin
      const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
      const recent = (logsRes.data.logs || []).filter(log => {
        const isRecent = new Date(log.timestamp || log.createdAt) >= threeHoursAgo;
        const isOwnActivity = String(log.userId) === String(user?._id || user?.id);
        return isRecent && isOwnActivity;
      });
      setActivities(recent);
      
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });

    const handlePrefChange = () => {
      const p = localStorage.getItem('adminPreferences');
      if (p) setPreferences(prev => ({ ...prev, ...JSON.parse(p) }));
    };
    window.addEventListener('preferencesUpdated', handlePrefChange);
    return () => window.removeEventListener('preferencesUpdated', handlePrefChange);
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 p-4 md:p-6 lg:p-8 pb-12 w-full font-sans overflow-hidden">
      
      {/* Profile Card & Welcome Section */}
      <div 
        className="bg-white rounded-xl p-4 md:p-10 border border-gray-100 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center gap-4 md:gap-8"
      >
        <div className="relative z-10 shrink-0">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-slate-50 p-1 shadow-md bg-white">
            <div className="w-full h-full bg-slate-800 rounded-full flex items-center justify-center text-3xl md:text-4xl font-bold text-white">
               {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
          </div>
        </div>

        <div className="relative z-10 flex-1 text-center md:text-left">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2 flex items-center tracking-tight">Welcome back, {user?.name || 'Administrator'}</h1>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-4 text-xs md:text-sm text-gray-500">
            <span className="flex items-center gap-1.5 bg-slate-50 px-4 py-1.5 rounded-full border border-slate-200 font-bold text-slate-700">
              <FiShield className="text-blue-500" />
              {user?.role || 'Super Admin'}
            </span>
            <span className="flex items-center gap-1.5 bg-slate-50 px-4 py-1.5 rounded-full border border-slate-200 font-medium">
              <FiClock className="text-emerald-500" />
              Last Login: {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>


      </div>

      {/* Stats Grid */}
      <div>
        <h2 className="text-base md:text-lg font-bold text-gray-700 mb-4 md:mb-6 flex items-center gap-2 border-b border-gray-100 pb-2 uppercase tracking-wide">
          <FiCalendar className="text-blue-500" /> System Metrics Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatCard 
            title="Total Devotees" 
            value={<AnimatedCounter value={stats?.totalDevotees || 0} />} 
            icon={<FiUsers />} 
            gradient="from-blue-400 to-indigo-600"
            delay={0.1} 
          />
          
          {preferences.showDonations && (
            <>
              <StatCard 
                title="Total Donations" 
                value={<AnimatedCounter value={stats?.totalDonations || 0} prefix="₹ " />} 
                icon={<FiDollarSign />} 
                gradient="from-emerald-400 to-teal-600"
                delay={0.2} 
              />
              <StatCard 
                title="Total Donors" 
                value={<AnimatedCounter value={stats?.totalDonors || 0} />} 
                icon={<FiUsers />} 
                gradient="from-cyan-400 to-blue-500"
                delay={0.25} 
              />
              <StatCard 
                title="Unique Donors" 
                value={<AnimatedCounter value={stats?.totalUniqueDonors || 0} />} 
                icon={<FiHeart />} 
                gradient="from-fuchsia-400 to-purple-600"
                delay={0.28} 
              />
            </>
          )}

          <StatCard 
            title="Total Events" 
            value={<AnimatedCounter value={stats?.totalEvents || 0} />} 
            icon={<FiCalendar />} 
            gradient="from-orange-400 to-red-500"
            delay={0.3} 
          />
          <StatCard 
            title="Announcements" 
            value={<AnimatedCounter value={stats?.totalAnnouncements || 0} />} 
            icon={<FiBell />} 
            gradient="from-purple-400 to-pink-600"
            delay={0.4} 
          />

          {preferences.showBranches && (
            <StatCard 
              title="Total Branches" 
              value={<AnimatedCounter value={stats?.totalBranches || 0} />} 
              icon={<FiMapPin />} 
              gradient="from-rose-400 to-red-600"
              delay={0.5} 
            />
          )}

          <StatCard 
            title="Total Documents" 
            value={<AnimatedCounter value={stats?.totalDocuments || 0} />} 
            icon={<FiFileText />} 
            gradient="from-slate-500 to-gray-700"
            delay={0.6} 
          />
          <StatCard 
            title="Trust Members" 
            value={<AnimatedCounter value={stats?.totalTrustees || 0} />} 
            icon={<FiShield />} 
            gradient="from-indigo-400 to-blue-600"
            delay={0.7} 
          />
          <StatCard 
            title="Annadan Records" 
            value={<AnimatedCounter value={stats?.totalAnnadan || 0} />} 
            icon={<FiHeart />} 
            gradient="from-pink-400 to-rose-500"
            delay={0.8} 
          />
        </div>
      </div>

      {/* Recent Activity Section */}
      {preferences.showActivities && activities.length > 0 && (
        <div className="mt-8 md:mt-10">
          <h2 className="text-base md:text-lg font-bold text-gray-700 mb-4 md:mb-6 flex items-center gap-2 border-b border-gray-100 pb-2 uppercase tracking-wide">
            <FiActivity className="text-emerald-500" /> My Recent Activity (Last 3 Hours)
          </h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-100 max-h-64 md:max-h-96 overflow-y-auto">
              {activities.map((log, idx) => (
                <div key={idx} className="p-4 sm:px-6 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    <FiShield className="text-slate-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 font-medium">
                      <span className="font-bold">{log.role}</span> performed action: <span className="font-bold text-sky-600">{log.action}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">IP: {log.ipAddress} {log.details && log.details.method ? `| Method: ${log.details.method}` : ''}</p>
                  </div>
                  <div className="text-xs text-gray-400 font-medium shrink-0 flex items-center gap-1.5">
                    <FiClock /> {new Date(log.timestamp || log.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {preferences.showActivities && activities.length === 0 && (
        <div className="mt-8 md:mt-10">
          <h2 className="text-base md:text-lg font-bold text-gray-700 mb-4 md:mb-6 flex items-center gap-2 border-b border-gray-100 pb-2 uppercase tracking-wide">
            <FiActivity className="text-emerald-500" /> My Recent Activity (Last 3 Hours)
          </h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 text-center text-gray-500 font-medium">
            You have no activity in the last 3 hours.
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
