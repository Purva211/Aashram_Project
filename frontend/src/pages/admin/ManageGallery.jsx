import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaTrash, FaSpinner, FaImage, FaVideo, FaEdit, FaSearch, FaFilter } from 'react-icons/fa';
import api from "../../utils/api";
import { useTableFeatures } from '../../hooks/useTableFeatures';
import TablePagination from '../../components/TablePagination';

const ASSETS_URL = import.meta.env.VITE_ASSETS_URL || "http://localhost:5000";

const getImageUrl = (url) => {
  if (!url) return "https://images.unsplash.com/photo-1514222709107-a180c68d72b4?q=80&w=2000";
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) return `${ASSETS_URL}${url}`;
  return `${ASSETS_URL}/${url}`;
};

const ManageGallery = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', url: '', type: 'image', category: 'Blessings' });
  const [submitting, setSubmitting] = useState(false);
  const [editId, setEditId] = useState(null);
  const [filterCategory, setFilterCategory] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const categories = ["Blessings", "Festivals", "Pooja", "Pravachan", "Monastery", "Maharaj"];

  const filteredByCustom = items.filter(i => {
    let match = true;
    if (filterCategory && i.category !== filterCategory) match = false;
    return match;
  });

  const {
    searchTerm, setSearchTerm, sortConfig, handleSort,
    currentPage, setCurrentPage, itemsPerPage, setItemsPerPage,
    totalPages, paginatedData, totalItems
  } = useTableFeatures(filteredByCustom, ['title', 'category']);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await api.get('/gallery');
      setItems(res.data.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch gallery items.");
    } finally {
      setLoading(false);
    }
  };

  const [mediaFile, setMediaFile] = useState(null);

  const openModal = (item = null) => {
    if (item) {
      setFormData({ title: item.title, url: item.url || '', type: item.type || 'image', category: item.category });
      setEditId(item._id);
    } else {
      setFormData({ title: '', url: '', type: 'image', category: 'Blessings' });
      setEditId(null);
    }
    setMediaFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditId(null);
    setMediaFile(null);
  };

  const handleFileChange = (e) => {
    setMediaFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      
      const data = new FormData();
      data.append('title', formData.title);
      data.append('type', formData.type);
      data.append('category', formData.category);
      if (formData.url) data.append('url', formData.url);
      if (mediaFile) data.append('mediaFile', mediaFile);

      if (editId) {
        await api.put(`/gallery/${editId}`, data);
      } else {
        await api.post('/gallery', data);
      }
      closeModal();
      fetchItems();
    } catch (err) {
      setError("Failed to save gallery item.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm("Are you sure you want to delete this media item?")) {
      try {
        await api.delete(`/gallery/${id}`);
        fetchItems();
      } catch (err) {
        setError("Failed to delete.");
      }
    }
  };


  return (
    <div className="min-h-screen bg-transparent text-gray-900 pb-12">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black mb-2 text-slate-900 flex items-center tracking-tight">Gallery Management</h1>
          <p className="text-gray-500">Upload and manage images and video links for the public gallery.</p>
        </div>
        <button onClick={() => openModal()} className="bg-gray-900 hover:bg-black transition-colors px-6 py-3 rounded-xl text-white font-black flex items-center gap-2 shadow-lg">
          <FaPlus /> Add Media
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-500 p-3 rounded-xl text-sm font-bold mb-6">{error}</div>}

      {/* SEARCH AND FILTERS */}
      <div className="flex flex-wrap items-center gap-4 mb-10">
        <div className="relative flex-1 min-w-[250px]">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search gallery by title..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-3 outline-none focus:border-saffron-500 shadow-sm" />
        </div>
        
        <select 
          onChange={(e) => {
            if(e.target.value) handleSort(e.target.value);
          }} 
          className="px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-saffron-500 shadow-sm"
        >
          <option value="">Sort By...</option>
          <option value="title">Title</option>
          <option value="category">Category</option>
        </select>

        <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-6 py-3 bg-white border ${showFilters ? 'border-saffron-500 text-saffron-600' : 'border-gray-200 text-gray-700'} hover:bg-gray-50 rounded-xl font-bold shadow-sm transition-colors`}>
          <FaFilter /> Filter
        </button>
      </div>

      {showFilters && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm mb-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Category</label>
              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-saffron-500">
                <option value="">All Categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button onClick={() => setFilterCategory('')} className="text-sm font-bold text-gray-500 hover:text-gray-700">Clear Filters</button>
          </div>
        </div>
      )}

      {/* GRID */}
      {loading ? (
        <div className="flex justify-center py-20"><FaSpinner className="animate-spin text-5xl text-saffron-500" /></div>
      ) : paginatedData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {paginatedData.map((item, index) => (
            <motion.div 
              key={item._id} 
              initial={{ opacity: 0, y: 40 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.4, delay: index * 0.05 }} 
              className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all group flex flex-col"
            >
              
              <div className="relative h-40 md:h-56 overflow-hidden shrink-0 bg-gray-100 flex items-center justify-center">
                {item.type === 'video' ? (
                  <div className="absolute inset-0 bg-gray-900 flex items-center justify-center group-hover:scale-105 transition-transform duration-700">
                    <FaVideo className="text-4xl md:text-5xl text-gray-600" />
                  </div>
                ) : (
                  <img src={getImageUrl(item.url)} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
                
                <div className="absolute top-3 md:top-4 left-3 md:left-4">
                  <span className={`px-2 md:px-3 py-1 md:py-1.5 backdrop-blur-md rounded-lg text-[9px] md:text-[10px] uppercase font-black tracking-widest text-white shadow-sm border border-white/20 bg-[#f27415]/90 flex items-center gap-1`}>
                    {item.type === 'video' ? <FaVideo /> : <FaImage />} {item.type}
                  </span>
                </div>
                
                <div className="absolute bottom-3 md:bottom-4 left-3 md:left-4 right-3 md:right-4">
                  <p className="text-[#f27415] text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mb-0.5 md:mb-1 drop-shadow-md">{item.category}</p>
                  <h2 className="text-white text-lg md:text-2xl font-bold line-clamp-1 drop-shadow-lg">{item.title}</h2>
                </div>
              </div>

              <div className="p-4 md:p-6 flex flex-col flex-1">
                <p className="text-gray-500 text-xs md:text-sm line-clamp-1 mb-4 md:mb-6 flex-1 break-all" title={item.url}>{item.url}</p>
                
                <div className="flex gap-2 pt-3 md:pt-4 border-t border-gray-100">
                  <button onClick={() => openModal(item)} className="flex-1 py-2 md:py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors text-xs md:text-sm"><FaEdit /> Edit</button>
                  <button onClick={() => handleDelete(item._id)} className="flex-1 py-2 md:py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors text-xs md:text-sm"><FaTrash /> Del</button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white border border-dashed border-gray-200 rounded-3xl"><h2 className="text-2xl font-bold text-gray-400 mb-2">No Media Found</h2><p className="text-gray-500">Add some images or videos to your gallery.</p></div>
      )}

      {!loading && paginatedData.length > 0 && (
        <div className="mt-10 rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-white">
          <TablePagination 
            currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage}
            totalItems={totalItems} itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage}
          />
        </div>
      )}

      {/* MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }} 
              className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{editId ? "Update Media" : "Add Media"}</h2>
                  <p className="text-sm text-gray-500">Add stunning visuals for the public gallery.</p>
                </div>
                <button onClick={closeModal} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-red-500 hover:text-white transition-colors">✕</button>
              </div>

              <div className="p-6 overflow-y-auto">
                <form id="gallery-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
                    <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500" />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Media Type</label>
                    <select required value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500">
                      <option value="image">Image</option>
                      <option value="video">Video (YouTube/URL)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                    <select required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500">
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div className="md:col-span-2 border-t border-gray-100 pt-5">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Direct File Upload (Optional)</label>
                    <input type="file" accept="image/*,video/*" onChange={handleFileChange} className="w-full border border-gray-300 rounded-xl px-4 py-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-[#f27415] hover:file:bg-orange-100 outline-none" />
                    <p className="text-xs text-gray-400 mt-2">Select an image or video from your device. If selected, the Media URL below is ignored.</p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Or Paste Media URL</label>
                    <input type="text" placeholder="https://youtube.com/watch?v=... or https://example.com/image.jpg" value={formData.url} onChange={(e) => setFormData({...formData, url: e.target.value})} className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500" />
                    <p className="text-xs text-gray-400 mt-2">If uploading a local file, you can leave this blank.</p>
                  </div>
                </form>
              </div>

              <div className="p-4 md:p-6 border-t border-gray-100 bg-gray-50 flex flex-col md:flex-row justify-end gap-3">
                <button type="button" onClick={closeModal} className="w-full md:w-auto px-6 py-2.5 bg-white border border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-colors order-2 md:order-1">Cancel</button>
                <button type="submit" form="gallery-form" disabled={submitting} className="order-1 md:order-2 px-8 py-2.5 bg-blue-900 hover:bg-slate-900 w-full md:w-auto justify-center text-white rounded-xl font-bold shadow-md transition-colors flex items-center gap-2">
                  {submitting ? <FaSpinner className="animate-spin" /> : (editId ? "Update Media" : "Save Media")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ManageGallery;
