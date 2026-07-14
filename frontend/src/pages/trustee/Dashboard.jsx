import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaRupeeSign, FaSpinner, FaBuilding, FaFileAlt, FaUsers, FaCalendarAlt, FaBullhorn, FaUserShield, FaHandHoldingHeart } from 'react-icons/fa';
import { FiActivity, FiShield, FiClock } from 'react-icons/fi';
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import AnimatedCounter from '../../components/dashboard/AnimatedCounter';

const StatCard = ({ title, value, icon, colorClass, delay }) => (
  <div 
    className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group"
  >
    <div className="flex items-center justify-between mb-6 relative z-10">
      <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">{title}</h3>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorClass} text-xl transform group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
    </div>
    <p className="text-4xl font-black text-gray-900 relative z-10">{value}</p>
  </div>
);

const TrusteeDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  
  const [preferences, setPreferences] = useState({
    showActivities: true, showBranches: true, showDonations: true, showEvents: true
  });

  const loadPreferences = () => {
    const saved = localStorage.getItem('adminPreferences');
    if (saved) {
      try {
        setPreferences(prev => ({...prev, ...JSON.parse(saved)}));
      } catch (e) {}
    }
  };

  useEffect(() => {
    loadPreferences();
    window.addEventListener('preferencesUpdated', loadPreferences);
    return () => window.removeEventListener('preferencesUpdated', loadPreferences);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsRes = await api.get('/trustees/stats');
        setStats(statsRes.data.stats);
        
        // Fetch audit logs for the last 3 hours, scoped to current user
        if (user && user._id) {
          const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
          const logsRes = await api.get(`/audit-logs?userId=${user._id}&startDate=${threeHoursAgo}`);
          if (logsRes.data && logsRes.data.logs) {
            setActivities(logsRes.data.logs);
          }
        }
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user]);

  if (loading) return <div className="h-full flex items-center justify-center py-20"><FaSpinner className="text-5xl text-saffron-500 animate-spin" /></div>;

  return (
    <div className="space-y-6 md:space-y-8 p-4 md:p-6 lg:p-8 pb-12 w-full bg-transparent text-gray-900 font-sans overflow-hidden">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3 tracking-tight">
          <FaUserShield className="text-gray-700" /> Trustee Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-2">Overview of trust activities and performance.</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard title="Total Devotees" value={<AnimatedCounter value={stats.totalDevotees || 0} />} icon={<FaUsers />} colorClass="bg-blue-50 text-blue-500" delay={0.1} />
        {preferences.showDonations && <StatCard title="Total Donations" value={<AnimatedCounter value={stats.totalDonations || 0} prefix="₹ " />} icon={<FaRupeeSign />} colorClass="bg-green-50 text-green-500" delay={0.2} />}
        {preferences.showEvents && <StatCard title="Total Events" value={<AnimatedCounter value={stats.totalEvents || 0} />} icon={<FaCalendarAlt />} colorClass="bg-purple-50 text-purple-500" delay={0.3} />}
        {preferences.showEvents && <StatCard title="Total Announcements" value={<AnimatedCounter value={stats.totalAnnouncements || 0} />} icon={<FaBullhorn />} colorClass="bg-yellow-50 text-yellow-500" delay={0.4} />}
        {preferences.showBranches && <StatCard title="Total Branches" value={<AnimatedCounter value={stats.totalBranches || 0} />} icon={<FaBuilding />} colorClass="bg-indigo-50 text-indigo-500" delay={0.5} />}
        <StatCard title="Total Documents" value={<AnimatedCounter value={stats.totalDocuments || 0} />} icon={<FaFileAlt />} colorClass="bg-gray-100 text-gray-500" delay={0.6} />
        <StatCard title="Trust Members" value={<AnimatedCounter value={stats.totalTrustMembers || 0} />} icon={<FaUserShield />} colorClass="bg-red-50 text-red-500" delay={0.7} />
        <StatCard title="Annadan Records" value={<AnimatedCounter value={stats.totalAnnadanRecords || 0} />} icon={<FaHandHoldingHeart />} colorClass="bg-pink-50 text-pink-500" delay={0.8} />
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

export default TrusteeDashboard;
