import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiDollarSign, FiDownload, FiFilter, FiTrendingUp, FiUsers, FiSearch, FiChevronUp, FiChevronDown, FiPrinter, FiX } from 'react-icons/fi';
import api from "../../utils/api";
import { useTableFeatures } from '../../hooks/useTableFeatures';
import TablePagination from '../../components/TablePagination';
import { exportToCSV } from '../../utils/exportUtils';
import { generateFinancialReport } from '../../utils/reportGenerator';

const Donations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  // Filters
  const [filterYear, setFilterYear] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterMinAmount, setFilterMinAmount] = useState('');
  const [filterMaxAmount, setFilterMaxAmount] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [branches, setBranches] = useState([]);

  // Filtering first
  const filteredByCustom = donations.filter((d) => {
    let match = true;
    const dDate = new Date(d.date);
    
    if (filterYear && dDate.getFullYear() !== parseInt(filterYear)) match = false;
    if (filterMonth && dDate.getMonth() !== parseInt(filterMonth)) match = false;
    if (filterStatus && d.status !== filterStatus) match = false;
    if (filterMinAmount && d.amount < parseInt(filterMinAmount)) match = false;
    if (filterMaxAmount && d.amount > parseInt(filterMaxAmount)) match = false;
    if (filterBranch && d.branchId && (typeof d.branchId === 'string' ? d.branchId : d.branchId._id) !== filterBranch) match = false;

    return match;
  });

  const {
    searchTerm, setSearchTerm, sortConfig, handleSort,
    currentPage, setCurrentPage, itemsPerPage, setItemsPerPage,
    totalPages, paginatedData, totalItems
  } = useTableFeatures(filteredByCustom, ['donorName', 'donationReference', 'status', 'branchId.name']);

  useEffect(() => {
    fetchBranches();
    fetchDonations();
  }, []);

  const fetchBranches = async () => {
    try {
      const res = await api.get('/branches');
      setBranches(res.data?.branches || []);
    } catch (err) {
      console.error('Failed to fetch branches:', err);
    }
  };

  const fetchDonations = async () => {
    try {
      const res = await api.get('/donations');
      setDonations(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredApproved = filteredByCustom.filter(d => d.status === 'APPROVED');
  const totalDonations = filteredApproved.reduce((sum, d) => sum + d.amount, 0);
  
  const currentMonth = new Date().getMonth();
  const thisMonthDonations = filteredApproved
    .filter(d => new Date(d.date).getMonth() === currentMonth)
    .reduce((sum, d) => sum + d.amount, 0);

  const totalDonors = new Set(filteredApproved.map(d => d.donorName)).size;

  const handleExport = () => {
    const exportData = filteredByCustom.map(d => ({
      Reference: d.donationReference || "N/A",
      DonorName: d.donorName,
      Branch: d.branchId?.name || "Main Trust",
      Status: d.status || 'PENDING_VERIFICATION',
      Date: new Date(d.date).toISOString().split('T')[0],
      Amount: d.amount
    }));

    // Add summary row
    exportData.push({
      Reference: "TOTAL APPROVED",
      DonorName: "",
      Branch: "",
      Status: "",
      Date: "",
      Amount: totalDonations
    });

    exportToCSV(exportData, 'donations_export');
  };

  const handleGenerateReport = () => {
    const branchName = branches.find(b => b._id === filterBranch)?.name || '';
    generateFinancialReport(filteredByCustom, {
      year: filterYear,
      month: filterMonth,
      branchName: branchName,
      status: filterStatus
    });
  };

  if (loading) return <div className="h-64 flex items-center justify-center"><div className="w-8 h-8 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div></div>;

  return (
    <div className="w-full space-y-6 text-gray-800 pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-900"><FiDollarSign className="text-emerald-500" /> Donation Management</h1>
          <p className="text-slate-600 font-medium text-sm mt-1">Track financial contributions and generate reports.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search donations..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 w-48 lg:w-64 shadow-sm transition-all"
            />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-4 py-2.5 bg-transparent text-black hover:bg-gray-100 rounded-xl text-sm font-black transition-colors`}>
            <FiFilter /> Filter
          </button>
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl text-sm font-black shadow-md transition-colors">
            <FiDownload /> Export
          </button>
          <button onClick={handleGenerateReport} className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-black shadow-md transition-colors">
            <FiDownload /> Report
          </button>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-2xl text-white shadow-lg shadow-emerald-500/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-bl-full blur-xl group-hover:bg-white/30 transition-colors"></div>
          <h3 className="text-sm font-bold opacity-90 mb-2 relative z-10 uppercase tracking-wider">Total Received</h3>
          <p className="text-4xl font-bold flex items-center gap-1 relative z-10">₹ {totalDonations.toLocaleString()}</p>
        </motion.div>
        
        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.1}} className="bg-white border border-gray-100 shadow-sm p-6 rounded-2xl relative overflow-hidden hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">This Month</h3>
            <FiTrendingUp className="text-emerald-500 text-xl" />
          </div>
          <p className="text-3xl font-bold text-slate-900 flex items-center gap-1">₹ {thisMonthDonations.toLocaleString()}</p>
        </motion.div>
        
        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.2}} className="bg-white border border-gray-100 shadow-sm p-6 rounded-2xl relative overflow-hidden hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Unique Donors</h3>
            <FiUsers className="text-blue-500 text-xl" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{totalDonors}</p>
        </motion.div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Year</label>
              <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500">
                <option value="">All Years</option>
                {Array.from({ length: new Date().getFullYear() - 2000 + 1 }, (_, i) => new Date().getFullYear() - i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Status</label>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500">
                <option value="">All</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="PENDING_VERIFICATION">Pending</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Month</label>
              <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500">
                <option value="">All Months</option>
                <option value="0">January</option>
                <option value="1">February</option>
                <option value="2">March</option>
                <option value="3">April</option>
                <option value="4">May</option>
                <option value="5">June</option>
                <option value="6">July</option>
                <option value="7">August</option>
                <option value="8">September</option>
                <option value="9">October</option>
                <option value="10">November</option>
                <option value="11">December</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Min Amount (₹)</label>
              <input type="number" value={filterMinAmount} onChange={(e) => setFilterMinAmount(e.target.value)} placeholder="0" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Max Amount (₹)</label>
              <input type="number" value={filterMaxAmount} onChange={(e) => setFilterMaxAmount(e.target.value)} placeholder="Any" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Branch</label>
              <select value={filterBranch} onChange={(e) => setFilterBranch(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500">
                <option value="">All Branches</option>
                {branches.map(b => (
                  <option key={b._id} value={b._id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button onClick={() => { setFilterYear(''); setFilterMonth(''); setFilterStatus(''); setFilterMinAmount(''); setFilterMaxAmount(''); setFilterBranch(''); }} className="text-sm font-bold text-gray-500 hover:text-gray-700">Clear Filters</button>
          </div>
        </motion.div>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-700">
                <th className="p-4 font-bold cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => handleSort('donorName')}>
                  <div className="flex items-center gap-1">Donor Name {sortConfig.key === 'donorName' && (sortConfig.direction === 'asc' ? <FiChevronUp/> : <FiChevronDown/>)}</div>
                </th>
                <th className="p-4 font-bold cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => handleSort('donationReference')}>
                  <div className="flex items-center gap-1">Reference {sortConfig.key === 'donationReference' && (sortConfig.direction === 'asc' ? <FiChevronUp/> : <FiChevronDown/>)}</div>
                </th>
                <th className="p-4 font-bold cursor-pointer hover:bg-slate-200 transition-colors">
                  <div className="flex items-center gap-1">Branch</div>
                </th>
                <th className="p-4 font-bold cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => handleSort('status')}>
                  <div className="flex items-center gap-1">Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? <FiChevronUp/> : <FiChevronDown/>)}</div>
                </th>
                <th className="p-4 font-bold cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => handleSort('date')}>
                  <div className="flex items-center gap-1">Date {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? <FiChevronUp/> : <FiChevronDown/>)}</div>
                </th>
                <th className="p-4 font-bold text-right cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => handleSort('amount')}>
                  <div className="flex items-center justify-end gap-1">Amount {sortConfig.key === 'amount' && (sortConfig.direction === 'asc' ? <FiChevronUp/> : <FiChevronDown/>)}</div>
                </th>
                <th className="p-4 font-bold text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {paginatedData.map((donation, idx) => (
                <motion.tr 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.02 }}
                  className="hover:bg-gray-50 transition-colors"
                  key={donation._id}
                >
                  <td className="p-4 font-bold text-slate-900">
                    {donation.donorName}
                  </td>
                  <td className="p-4 font-mono text-xs font-bold text-slate-700">
                    {donation.donationReference || "N/A"}
                  </td>
                  <td className="p-4 text-sm font-medium text-slate-600">
                    {donation.branchId?.name || "Main Trust"}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border ${
                      donation.status === 'APPROVED' ? 'text-green-700 bg-green-50 border-green-200' :
                      donation.status === 'REJECTED' ? 'text-red-700 bg-red-50 border-red-200' :
                      'text-amber-700 bg-amber-50 border-amber-200'
                    }`}>
                      {donation.status || 'PENDING_VERIFICATION'}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600 font-medium">
                    {new Date(donation.date).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right font-bold text-emerald-600 text-base">
                    ₹ {donation.amount.toLocaleString()}
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => {
                        if (donation.receiptPdfUrl) {
                          window.open(donation.receiptPdfUrl, '_blank');
                        } else {
                          alert('This is a legacy donation. The old receipt format has been removed.');
                        }
                      }}
                      className="p-2 bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-700 rounded-lg transition-colors"
                      title="View Receipt"
                    >
                      <FiPrinter size={16} />
                    </button>
                  </td>
                </motion.tr>
              ))}
              {paginatedData.length === 0 && (
                 <tr><td colSpan="5" className="text-center py-8 text-slate-500">No donations found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <TablePagination 
          currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage}
          totalItems={totalItems} itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage}
        />
      </div>


    </div>
  );
};

export default Donations;
