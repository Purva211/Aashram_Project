import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { FaYoutube, FaFileAudio, FaPlay, FaPause, FaTrash, FaCheckCircle, FaEdit } from 'react-icons/fa';
import { motion } from 'framer-motion';

const AudioTracks = () => {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  
  // Form State
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('Marathi');
  const [uploadType, setUploadType] = useState('youtube'); // 'youtube' or 'direct'
  const [audioFile, setAudioFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);

  // Edit State
  const [editingTrack, setEditingTrack] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editLanguage, setEditLanguage] = useState('');
  const [editThumbnailFile, setEditThumbnailFile] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    fetchTracks();
  }, []);

  const fetchTracks = async () => {
    try {
      const res = await api.get('/audio');
      setTracks(res.data.data);
    } catch (error) {
      toast.error('Failed to load audio tracks');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (e) => {
    e.preventDefault();
    if (uploadType === 'youtube' && !youtubeUrl) {
      return toast.error('Please enter a YouTube URL');
    }
    if (uploadType === 'direct' && !audioFile) {
      return toast.error('Please select an MP3 file');
    }

    setImporting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('language', language);
      if (thumbnailFile) formData.append('thumbnail', thumbnailFile);

      if (uploadType === 'youtube') {
        formData.append('youtubeUrl', youtubeUrl);
        await api.post('/audio/import-youtube', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Imported successfully from YouTube!');
      } else {
        formData.append('audioFile', audioFile);
        await api.post('/audio/upload-direct', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('File uploaded successfully!');
      }
      // Reset form
      setYoutubeUrl('');
      setTitle('');
      setAudioFile(null);
      setThumbnailFile(null);
      fetchTracks();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setImporting(false);
    }
  };

  const setActive = async (id) => {
    try {
      await api.put(`/audio/${id}/active`);
      toast.success('Track set as active for Home Page');
      fetchTracks();
    } catch (error) {
      toast.error('Failed to set active track');
    }
  };

  const deleteTrack = async (id) => {
    if (window.confirm("Are you sure you want to delete this track?")) {
      try {
        await api.delete(`/audio/${id}`);
        toast.success('Track deleted');
        fetchTracks();
      } catch (error) {
        toast.error('Failed to delete track');
      }
    }
  };

  const openEditModal = (track) => {
    setEditingTrack(track);
    setEditTitle(track.title);
    setEditLanguage(track.language);
    setEditThumbnailFile(null);
  };

  const closeEditModal = () => {
    setEditingTrack(null);
    setEditTitle('');
    setEditLanguage('');
    setEditThumbnailFile(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    try {
      const formData = new FormData();
      formData.append('title', editTitle);
      formData.append('language', editLanguage);
      if (editThumbnailFile) {
        formData.append('thumbnail', editThumbnailFile);
      }
      
      await api.put(`/audio/${editingTrack._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success('Track updated successfully!');
      closeEditModal();
      fetchTracks();
    } catch (error) {
      toast.error('Failed to update track');
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-deepblue-800">Audio & Lyrics Manager</h1>
      
      {/* Upload Section */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <h2 className="text-xl font-semibold mb-4">Add New Audio Track</h2>
        
        <div className="flex gap-4 mb-6">
          <button 
            onClick={() => setUploadType('youtube')}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${uploadType === 'youtube' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            <FaYoutube className="mr-2" /> YouTube Import (Auto-Lyrics)
          </button>
          <button 
            onClick={() => setUploadType('direct')}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${uploadType === 'direct' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            <FaFileAudio className="mr-2" /> Direct MP3 Upload
          </button>
        </div>

        <form onSubmit={handleImport} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title (Optional)</label>
              <input 
                type="text" 
                value={title || ''}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Morning Aarati"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-200 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
              <select 
                value={language || 'Marathi'}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-200 outline-none"
              >
                <option value="Marathi">Marathi</option>
                <option value="Hindi">Hindi</option>
                <option value="English">English</option>
                <option value="Kannada">Kannada</option>
              </select>
            </div>
          </div>

          {uploadType === 'youtube' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">YouTube Video URL</label>
              <input 
                type="url" 
                required={uploadType === 'youtube'}
                value={youtubeUrl || ''}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-200 outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">We will automatically extract the audio and the auto-generated lyrics.</p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">MP3 File</label>
              <input 
                type="file" 
                accept="audio/mp3,audio/*"
                required
                onChange={(e) => setAudioFile(e.target.files[0])}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-200 outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">Note: Direct uploads will not have synchronized lyrics automatically.</p>
            </div>
          )}
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Optional Thumbnail Image</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => setThumbnailFile(e.target.files[0])}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-200 outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">If the lyrics generation fails, this image will be shown beautifully in its place.</p>
          </div>

          <button 
            type="submit" 
            disabled={importing}
            className={`w-full md:w-auto px-6 py-2 rounded-lg font-bold text-white transition-all ${importing ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-800 shadow-md hover:shadow-lg'}`}
          >
            {importing ? 'Processing... (Please wait)' : 'Upload & Save'}
          </button>
        </form>
      </div>

      {/* Tracks List */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <h2 className="text-xl font-semibold p-6 border-b">Manage Audio Tracks</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm">
              <tr>
                <th className="p-4 font-medium">Title</th>
                <th className="p-4 font-medium">Source</th>
                <th className="p-4 font-medium">Language</th>
                <th className="p-4 font-medium">Has Lyrics?</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">Loading tracks...</td></tr>
              ) : tracks.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">No audio tracks uploaded yet.</td></tr>
              ) : tracks.map(track => (
                <tr key={track._id} className="hover:bg-gray-50/50">
                  <td className="p-4 font-medium text-gray-800">{track.title}</td>
                  <td className="p-4">
                    {track.sourceType === 'youtube' ? (
                      <span className="inline-flex items-center text-xs text-red-600 bg-red-50 px-2 py-1 rounded"><FaYoutube className="mr-1"/> YouTube</span>
                    ) : (
                      <span className="inline-flex items-center text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded"><FaFileAudio className="mr-1"/> Direct</span>
                    )}
                  </td>
                  <td className="p-4 text-gray-600">{track.language}</td>
                  <td className="p-4">
                    {track.lyricsDataUrl ? (
                      <span className="text-green-600 text-sm font-medium">Yes</span>
                    ) : (
                      <span className="text-gray-400 text-sm">No</span>
                    )}
                  </td>
                  <td className="p-4">
                    {track.isActive ? (
                      <span className="inline-flex items-center text-sm text-green-600 font-bold bg-green-50 px-2 py-1 rounded">
                        <FaCheckCircle className="mr-1" /> Active on Home
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">Inactive</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      {track.isActive ? (
                        <button 
                          onClick={() => setActive(track._id)}
                          className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition-colors font-medium"
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button 
                          onClick={() => setActive(track._id)}
                          className="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded hover:bg-orange-200 transition-colors font-medium"
                        >
                          Set Active
                        </button>
                      )}
                      <button 
                        onClick={() => openEditModal(track)}
                        className="text-blue-500 hover:text-blue-700 p-1"
                        title="Edit Track"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        onClick={() => deleteTrack(track._id)}
                        className="text-red-400 hover:text-red-600 p-1"
                        title="Delete Track"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingTrack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Edit Audio Track</h2>
              <button onClick={closeEditModal} className="text-gray-400 hover:text-gray-600 font-bold text-xl">&times;</button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input 
                  type="text" 
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-200 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                <select 
                  value={editLanguage}
                  onChange={(e) => setEditLanguage(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-200 outline-none"
                >
                  <option value="Marathi">Marathi</option>
                  <option value="Hindi">Hindi</option>
                  <option value="English">English</option>
                  <option value="Kannada">Kannada</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Update Thumbnail Image (Optional)</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setEditThumbnailFile(e.target.files[0])}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-200 outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Leave blank to keep the existing thumbnail.</p>
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={closeEditModal}
                  className="px-4 py-2 rounded-lg font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={savingEdit}
                  className={`px-4 py-2 rounded-lg font-medium text-white transition-colors ${savingEdit ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioTracks;
