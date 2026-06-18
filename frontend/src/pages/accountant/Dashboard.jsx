import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { DollarSign, Clock, CheckCircle, XCircle, TrendingUp, Activity } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AnimatedCounter from '../../components/dashboard/AnimatedCounter';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0, uniqueDonors: 0, pending: 0, approved: 0, rejected: 0, amount: 0
  });
  const [recentDonations, setRecentDonations] = useState([]);
  const [loading, setLoading] = useState(true);

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
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

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
    <div className="p-4 md:p-6 w-full">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Welcome, {user?.fullName || user?.name || 'Accountant'}!</h1>
        <p className="text-sm md:text-base text-gray-500 mt-2">Here is the overview of the temple's donation finances.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6 mb-8">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-5 md:p-6 shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100 flex items-center gap-4">
            <div className={`w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-full flex items-center justify-center ${card.bg}`}>
              {card.icon}
            </div>
            <div className="min-w-0">
              <p className="text-xs md:text-sm font-semibold text-gray-500 mb-1 truncate">{card.title}</p>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 truncate">{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100 p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg md:text-xl font-bold text-gray-900">Recent Donation Updates</h2>
        </div>
        
        <div className="overflow-x-auto pb-4">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs md:text-sm border-b border-gray-100 uppercase tracking-wider">
                <th className="py-3 px-4 font-semibold rounded-tl-lg whitespace-nowrap">Donation ID</th>
                <th className="py-3 px-4 font-semibold whitespace-nowrap">Donor Name</th>
                <th className="py-3 px-4 font-semibold whitespace-nowrap">Amount</th>
                <th className="py-3 px-4 font-semibold whitespace-nowrap">Date</th>
                <th className="py-3 px-4 font-semibold rounded-tr-lg whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentDonations.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-8 text-gray-400">No recent activity</td></tr>
              ) : (
                recentDonations.map(don => (
                  <tr key={don._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors text-sm">
                    <td className="py-4 px-4 font-medium text-gray-900 whitespace-nowrap">{don.donationReference || don._id.substring(0,8)}</td>
                    <td className="py-4 px-4 text-gray-600 whitespace-nowrap">{don.donorName}</td>
                    <td className="py-4 px-4 font-bold text-gray-900 whitespace-nowrap">₹{don.amount.toLocaleString()}</td>
                    <td className="py-4 px-4 text-gray-500 whitespace-nowrap">{new Date(don.createdAt).toLocaleDateString()}</td>
                    <td className="py-4 px-4 whitespace-nowrap">
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
    </div>
  );
};

export default Dashboard;
