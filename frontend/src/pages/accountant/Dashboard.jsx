import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { DollarSign, Clock, CheckCircle, XCircle, TrendingUp, Activity, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AnimatedCounter from '../../components/dashboard/AnimatedCounter';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0, uniqueDonors: 0, pending: 0, approved: 0, rejected: 0, amount: 0
  });
  const [recentDonations, setRecentDonations] = useState([]);
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
        let statsRes;
        try {
          statsRes = await api.get('/stats');
        } catch(e) {
          console.warn("Stats API unavailable, will calculate manually");
        }
        
        const fullDonationsRes = await api.get('/donations');
        const fullList = fullDonationsRes.data.data || [];
        
        let pending = 0, approved = 0, rejected = 0, amount = 0;
        
        const uniqueDonorsSet = new Set();

        fullList.forEach(d => {
          if (d.donorName) uniqueDonorsSet.add(d.donorName);
          if (d.status === 'PENDING_PAYMENT' || d.status === 'PENDING_VERIFICATION') pending++;
          if (d.status === 'APPROVED') {
            approved++;
            amount += d.amount;
          }
          if (d.status === 'REJECTED') rejected++;
        });

        setStats({
          total: fullList.length,
          uniqueDonors: uniqueDonorsSet.size,
          pending,
          approved,
          rejected,
          amount
        });

        setRecentDonations(fullList.slice(0, 5));

        // Fetch audit logs for the last 3 hours, scoped to current user
        if (user && user._id) {
          const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
          const logsRes = await api.get(`/audit-logs?userId=${user._id}&startDate=${threeHoursAgo}`);
          if (logsRes.data && logsRes.data.logs) {
            setActivities(logsRes.data.logs);
          }
        }

      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user]);

  const statCards = [
    { title: 'Total Donations', value: <AnimatedCounter value={stats.total} />, icon: <Activity className="text-blue-500" />, bg: 'bg-blue-50' },
    { title: 'Unique Donors', value: <AnimatedCounter value={stats.uniqueDonors} />, icon: <Activity className="text-purple-500" />, bg: 'bg-purple-50' },
    { title: 'Pending Verifications', value: <AnimatedCounter value={stats.pending} />, icon: <Clock className="text-orange-500" />, bg: 'bg-orange-50' },
    { title: 'Approved Donations', value: <AnimatedCounter value={stats.approved} />, icon: <CheckCircle className="text-green-500" />, bg: 'bg-green-50' },
    { title: 'Total Amount', value: <AnimatedCounter value={stats.amount} prefix="₹" />, icon: <TrendingUp className="text-indigo-500" />, bg: 'bg-indigo-50' },
  ];

  if (loading) {
    return <div className="p-8 text-center text-gray-500 animate-pulse">Loading dashboard...</div>;
  }

  return (
    <div className="p-6 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.fullName || user?.name || 'Accountant'}!</h1>
        <p className="text-gray-500 mt-2">Here is the overview of the temple's donation finances.</p>
      </div>

      {preferences.showDonations && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
            {statCards.map((card, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100 flex items-center gap-4">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${card.bg}`}>
                  {card.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-1">{card.title}</p>
                  <h3 className="text-2xl font-bold text-gray-900">{card.value}</h3>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recent Donation Updates</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                    <th className="py-3 px-4 font-semibold rounded-tl-lg">Donation ID</th>
                    <th className="py-3 px-4 font-semibold">Donor Name</th>
                    <th className="py-3 px-4 font-semibold">Amount</th>
                    <th className="py-3 px-4 font-semibold">Date</th>
                    <th className="py-3 px-4 font-semibold rounded-tr-lg">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentDonations.length === 0 ? (
                    <tr><td colSpan="5" className="text-center py-8 text-gray-400">No recent activity</td></tr>
                  ) : (
                    recentDonations.map(don => (
                      <tr key={don._id} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="py-4 px-4 font-medium text-gray-900">{don.donationReference || don._id.substring(0,8)}</td>
                        <td className="py-4 px-4 text-gray-600">{don.donorName}</td>
                        <td className="py-4 px-4 font-bold text-gray-900">₹{don.amount.toLocaleString()}</td>
                        <td className="py-4 px-4 text-gray-500">{new Date(don.createdAt).toLocaleDateString()}</td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            don.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                            don.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {don.status.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Recent Activity Section */}
      {preferences.showActivities && activities.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-bold text-gray-700 mb-6 flex items-center gap-2 border-b border-gray-100 pb-2 uppercase tracking-wide">
            <Activity className="text-emerald-500 w-5 h-5" /> My Recent Activity (Last 3 Hours)
          </h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
              {activities.map((log, idx) => (
                <div key={idx} className="p-4 sm:px-6 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    <Shield className="text-slate-500 w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 font-medium">
                      <span className="font-bold">{log.role}</span> performed action: <span className="font-bold text-sky-600">{log.action}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">IP: {log.ipAddress} {log.details && log.details.method ? `| Method: ${log.details.method}` : ''}</p>
                  </div>
                  <div className="text-xs text-gray-400 font-medium shrink-0 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> {new Date(log.timestamp || log.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {preferences.showActivities && activities.length === 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-bold text-gray-700 mb-6 flex items-center gap-2 border-b border-gray-100 pb-2 uppercase tracking-wide">
            <Activity className="text-emerald-500 w-5 h-5" /> My Recent Activity (Last 3 Hours)
          </h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)] p-8 text-center text-gray-500 font-medium">
            You have no activity in the last 3 hours.
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
