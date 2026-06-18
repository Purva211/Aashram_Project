import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { FiMapPin, FiPlus, FiEdit2, FiTrash2, FiX, FiSave, FiMap, FiSearch, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import { useTableFeatures } from '../../hooks/useTableFeatures';
import TablePagination from '../../components/TablePagination';

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
          <h1 className="text-2xl font-bold flex flex-wrap items-center gap-2 text-slate-900"><FiMap className="text-saffron-500" /> Branch Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage spiritual centers, ashrams, and their contact information.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search branches..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500 w-full sm:w-64 shadow-sm transition-all"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex-1 overflow-hidden relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
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
            <tbody className="divide-y divide-gray-100 text-sm">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-16 text-gray-500">
                    <FiMap className="mx-auto text-4xl mb-4 text-gray-300" />
                    No branches found. Add your first branch.
                  </td>
                </tr>
              ) : (
                paginatedData.map((branch) => (
                  <tr key={branch._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-5">
                      <div className="font-bold text-slate-900 text-base">{branch.name}</div>
                    </td>
                    <td className="p-5 text-gray-600">
                      <div className="flex items-start gap-2 font-medium">
                        <FiMapPin className="text-saffron-500 mt-0.5 shrink-0" /> {branch.location}
                      </div>
                    </td>
                    <td className="p-5 text-gray-500 font-medium">{branch.contact || 'N/A'}</td>
                  </tr>
                ))
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
