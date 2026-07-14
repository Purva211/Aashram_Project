import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { FiMapPin, FiPlus, FiEdit2, FiTrash2, FiX, FiSave, FiMap, FiSearch, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import { useTableFeatures } from '../../hooks/useTableFeatures';
import TablePagination from '../../components/TablePagination';

const branchColors = [
  'border-emerald-500 text-emerald-500 bg-emerald-50',
  'border-blue-500 text-blue-500 bg-blue-50',
  'border-purple-500 text-purple-500 bg-purple-50',
  'border-orange-500 text-orange-500 bg-orange-50',
  'border-pink-500 text-pink-500 bg-pink-50',
  'border-teal-500 text-teal-500 bg-teal-50',
  'border-indigo-500 text-indigo-500 bg-indigo-50'
];

const getBranchColor = (str) => {
  if (!str) return branchColors[0];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return branchColors[Math.abs(hash) % branchColors.length];
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ManageBranches = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBranch, setCurrentBranch] = useState(null);
  const [formData, setFormData] = useState({ name: '', location: '', contact: '', description: '' });
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    searchTerm, setSearchTerm, sortConfig, handleSort,
    currentPage, setCurrentPage, itemsPerPage, setItemsPerPage,
    totalPages, paginatedData, totalItems
  } = useTableFeatures(branches, ['name', 'location', 'contact']);

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const response = await api.get('/branches');
      setBranches(response.data.branches);
    } catch (error) {
      console.error('Error fetching branches:', error);
    } finally {
      setLoading(false);
    }
  };



  if (loading) return <div className="h-64 flex items-center justify-center"><div className="w-8 h-8 border-4 border-saffron-500 rounded-full border-t-transparent animate-spin"></div></div>;

  return (
    <div className="w-full space-y-6 text-gray-800 pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold flex items-center gap-2 text-slate-900 tracking-tight"><FiMap className="text-saffron-500" /> Branch Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage spiritual centers, ashrams, and their contact information.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto mt-4 md:mt-0">
          <div className="relative w-full sm:w-auto">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search branches..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500 w-full sm:w-full sm:w-full sm:w-64 shadow-sm transition-all"
            />
          </div>
        </div>
      </div>

      <div className="md:bg-white md:rounded-2xl md:shadow-sm md:border md:border-gray-100 flex-1 overflow-hidden relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse block md:table">
            <thead className="hidden md:table-header-group">
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider font-bold">
                <th className="p-5 w-1/3 cursor-pointer hover:bg-gray-200 transition-colors" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-1">Branch Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? <FiChevronUp/> : <FiChevronDown/>)}</div>
                </th>
                <th className="p-5 w-1/3 cursor-pointer hover:bg-gray-200 transition-colors" onClick={() => handleSort('location')}>
                  <div className="flex items-center gap-1">Location {sortConfig.key === 'location' && (sortConfig.direction === 'asc' ? <FiChevronUp/> : <FiChevronDown/>)}</div>
                </th>
                <th className="p-5 w-1/4 cursor-pointer hover:bg-gray-200 transition-colors" onClick={() => handleSort('contact')}>
                  <div className="flex items-center gap-1">Contact Info {sortConfig.key === 'contact' && (sortConfig.direction === 'asc' ? <FiChevronUp/> : <FiChevronDown/>)}</div>
                </th>
              </tr>
            </thead>
            <tbody className="block md:table-row-group w-full divide-y divide-gray-100 text-sm">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-16 text-gray-500">
                    <FiMap className="mx-auto text-4xl mb-4 text-gray-300" />
                    No branches found. Add your first branch.
                  </td>
                </tr>
              ) : (
                paginatedData.map((branch) => {
                  const colorSet = getBranchColor(branch.name).split(' ');
                  const borderColor = colorSet[0];
                  const textColor = colorSet[1];
                  const bgColor = colorSet[2];
                  return (
                  <tr key={branch._id} className={`block md:table-row bg-white md:bg-transparent border border-gray-100 md:border-b md:border-x-0 md:border-t-0 md:border-gray-50 rounded-xl md:rounded-none mb-4 md:mb-0 shadow-sm md:shadow-none hover:bg-gray-50/50 border-l-4 md:border-l-0 ${borderColor}`}>
                    {/* Mobile Card Top & Desktop Branch Name */}
                    <td className="p-4 md:p-5 block md:table-cell border-b border-gray-50 md:border-none">
                      {/* Mobile Only View */}
                      <div className="md:hidden flex flex-col gap-1 mb-2">
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Branch Name</span>
                        <div className="font-bold text-slate-900 text-lg">{branch.name}</div>
                      </div>
                      <div className="md:hidden text-gray-600 mb-3">
                        <div className="flex items-start gap-2 font-medium text-sm">
                          <FiMapPin className={`${textColor} mt-0.5 shrink-0`} /> {branch.location}
                        </div>
                      </div>
                      <div className="md:hidden text-gray-500 font-medium text-sm bg-gray-50 -mx-4 -mb-4 p-3 px-4 border-t border-gray-100 rounded-b-xl">
                        Contact: <span className="font-semibold text-gray-700">{branch.contact || 'N/A'}</span>
                      </div>
                      {/* Desktop Content */}
                      <div className="hidden md:block font-bold text-slate-900 text-base">{branch.name}</div>
                    </td>
                    <td className="hidden md:table-cell p-5 text-gray-600">
                      <div className="flex items-start gap-2 font-medium">
                        <FiMapPin className={`${textColor} mt-0.5 shrink-0`} /> {branch.location}
                      </div>
                    </td>
                    <td className="hidden md:table-cell p-5 text-gray-500 font-medium">
                      {branch.contact || 'N/A'}
                    </td>
                  </tr>
                  );
                })
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

export default ManageBranches;



