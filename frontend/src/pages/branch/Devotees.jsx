import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiTrash2, FiPlus, FiX, FiUsers, FiTrendingUp, FiPhone, FiMail, FiMapPin, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import api from "../../utils/api";
import { useAuth } from '../../context/AuthContext';
import { useTableFeatures } from '../../hooks/useTableFeatures';
import TablePagination from '../../components/TablePagination';

const Devotees = () => {
  const [devotees, setDevotees] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const {
    searchTerm, setSearchTerm, sortConfig, handleSort,
    currentPage, setCurrentPage, itemsPerPage, setItemsPerPage,
    totalPages, paginatedData, totalItems
  } = useTableFeatures(devotees, ['name', 'mobile', 'email']);

  useEffect(() => {
    fetchDevotees();
  }, []);

  const fetchDevotees = async () => {
    try {
      setLoading(true);
      const res = await api.get('/devotees');
      setDevotees(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };



  const getGradient = (name) => {
    const defaultGradients = [
      'from-saffron-400 to-orange-500', 
      'from-emerald-400 to-teal-500', 
      'from-blue-400 to-indigo-500', 
      'from-purple-400 to-pink-500',
      'from-rose-400 to-red-500'
    ];
    let sum = 0;
    for(let i=0; i<name.length; i++) sum += name.charCodeAt(i);
    return defaultGradients[sum % defaultGradients.length];
  };

  if (loading) return <div className="h-64 flex items-center justify-center"><div className="w-8 h-8 border-4 border-saffron-500 rounded-full border-t-transparent animate-spin"></div></div>;

  return (
    <div className="w-full space-y-6 text-gray-800 pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold flex items-center gap-2 text-slate-900 tracking-tight"><FiUsers className="text-saffron-500" /> Devotee Management</h1>
          <p className="text-slate-600 font-medium text-sm mt-1">Manage devotee records, contact information, and registry.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto mt-4 md:mt-0">
          <div className="relative w-full sm:w-auto">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name or mobile..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500 w-full sm:w-64 shadow-sm transition-all"
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full opacity-50"></div>
          <div className="flex justify-between items-center mb-2 relative z-10">
            <p className="text-sm text-slate-700 font-bold uppercase tracking-wider">Total Registered</p>
            <FiUsers className="text-blue-500 text-xl" />
          </div>
          <p className="text-3xl font-bold text-slate-900 relative z-10">{devotees.length}</p>
        </div>
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full opacity-50"></div>
          <div className="flex justify-between items-center mb-2 relative z-10">
            <p className="text-sm text-slate-700 font-bold uppercase tracking-wider">Recent Growth</p>
            <FiTrendingUp className="text-emerald-500 text-xl" />
          </div>
          <div className="flex items-center gap-3 relative z-10">
            <p className="text-3xl font-bold text-slate-900">
              {devotees.filter(d => new Date(d.registrationDate || Date.now()) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
            </p>
            <span className="text-xs bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-1 rounded-md font-bold">New this week</span>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="bg-transparent md:bg-white border-0 md:border border-gray-100 md:shadow-sm rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse block md:table">
            <thead className="hidden md:table-header-group">
              <tr className="bg-slate-100 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-700">
                <th className="p-4 font-bold w-1/3 cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-1">Devotee Profile {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? <FiChevronUp/> : <FiChevronDown/>)}</div>
                </th>
                <th className="p-4 font-bold w-1/4 cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => handleSort('mobile')}>
                  <div className="flex items-center gap-1">Contact Info {sortConfig.key === 'mobile' && (sortConfig.direction === 'asc' ? <FiChevronUp/> : <FiChevronDown/>)}</div>
                </th>
                <th className="p-4 font-bold w-1/3">Location</th>
              </tr>
            </thead>
            <tbody className="block md:table-row-group w-full divide-y divide-gray-100 text-sm">
              {paginatedData.map(d => (
                <tr key={d._id} className="flex flex-col md:table-row w-full bg-white md:bg-transparent border border-gray-100 md:border-b md:border-x-0 md:border-t-0 md:border-gray-50 rounded-xl md:rounded-none mb-4 md:mb-0 shadow-sm md:shadow-none hover:bg-gray-50 transition-colors">
                  <td className="p-4 md:px-4 md:py-4 block md:table-cell border-b border-gray-50 md:border-none">
                    <div className="flex md:hidden justify-between items-start mb-3">
                      <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded">Devotee Profile</span>
                    </div>
                    <div className="flex flex-row items-center gap-4 w-full md:w-auto">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getGradient(d.name)} flex items-center justify-center font-bold text-white shadow-inner shrink-0`}>
                        {d.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-lg md:text-base">{d.name}</div>
                        <div className="text-xs text-slate-600 font-medium mt-0.5">Joined {new Date(d.registrationDate || Date.now()).toLocaleDateString()}</div>
                        <div className="md:hidden mt-3 flex flex-col gap-1.5">
                          <div className="text-gray-700 font-medium flex items-center gap-2 text-sm"><FiPhone className="text-gray-400" /> {d.mobile}</div>
                          {d.email && <div className="text-xs text-slate-600 font-medium flex items-center gap-2"><FiMail className="text-slate-400" /> {d.email}</div>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="hidden md:table-cell p-4">
                    <div className="text-gray-700 font-medium flex items-center gap-2 mb-1"><FiPhone className="text-gray-400" /> {d.mobile}</div>
                    {d.email && <div className="text-xs text-slate-600 font-medium flex items-center gap-2"><FiMail className="text-slate-400" /> {d.email}</div>}
                  </td>
                  <td className="p-3 md:p-4 block md:table-cell bg-slate-50 md:bg-transparent rounded-b-xl md:rounded-none">
                    <span className="md:hidden text-xs text-slate-500 uppercase tracking-wider block mb-1 font-semibold px-1">Location</span>
                    <div className="flex items-start gap-2 text-slate-700 font-medium text-sm md:max-w-[200px] truncate px-1 md:px-0" title={d.address}>
                      <FiMapPin className="mt-0.5 shrink-0 text-saffron-500" /> {d.address || 'Not Provided'}
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedData.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-500">No devotees found matching your search.</td>
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



    </div>
  );
};

export default Devotees;


