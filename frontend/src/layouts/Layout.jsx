import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { FaHome, FaDonate, FaCalendarAlt, FaUsers, FaSignOutAlt, FaBell, FaOm, FaClipboardList, FaBullhorn, FaMapMarkerAlt, FaUserShield, FaImages, FaFileAlt, FaHistory, FaSitemap, FaCalculator, FaReceipt, FaBars, FaTimes, FaTrash } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const Layout = ({ children, user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pendingCounts, setPendingCounts] = useState({ annadaan: 0, documents: 0, deletions: 0, total: 0, verifyDonations: 0 });
  const [myNotifications, setMyNotifications] = useState([]);
  const { logout } = useAuth();
  const mainRef = React.useRef(null);

  React.useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo(0, 0);
    }
  }, [location.pathname]);

  React.useEffect(() => {
    const fetchPendingCounts = async () => {
      if (user?.role === 'Trustee') {
        try {
          const res = await api.get('/trustees/pending-counts');
          if (res.data?.success) {
            setPendingCounts(prev => ({ ...prev, ...res.data.counts }));
          }
        } catch (error) {
          console.error("Failed to fetch pending counts", error);
        }
      }
      if (user?.role === 'Accountant') {
        try {
          const res = await api.get('/donations/pending');
          if (res.data?.success) {
            setPendingCounts(prev => ({ ...prev, verifyDonations: res.data.data.length }));
          }
        } catch (error) {
          console.error("Failed to fetch pending donations counts", error);
        }
      }
    }; // Added missing closing brace

    const fetchNotifications = async () => {
      if (user) {
        try {
          const res = await api.get('/announcements/my-notifications');
          if (res.data?.success) {
            setMyNotifications(res.data.data);
          }
        } catch (error) {
          console.error("Failed to fetch notifications", error);
        }
      }
    };
    
    fetchPendingCounts();
    fetchNotifications();
    
    // Optional: Set up polling every minute to keep counts fresh
    const interval = setInterval(() => {
      fetchPendingCounts();
      fetchNotifications();
    }, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const handleMarkAsRead = async (id) => {
    try {
      await api.post(`/announcements/${id}/read`);
      setMyNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDismiss = async (id) => {
    try {
      await api.post(`/announcements/${id}/dismiss`);
      setMyNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // Calculate unread notifications count
  const unreadAnnouncementsCount = myNotifications.filter(n => !n.isRead).length;

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  let navItems = [];
  if (user?.role === 'Trustee') {
    navItems = [
      { name: 'Dashboard', path: '/trustee/dashboard', icon: <FaHome /> },
      { name: 'Profile', path: '/trustee/profile', icon: <FaUserShield /> },
      { name: 'Announcements', path: '/trustee/announcements', icon: <FaBullhorn />, showRedDot: unreadAnnouncementsCount > 0 },
      { name: 'Sansthan Updates', path: '/trustee/bulletins', icon: <FaBullhorn /> },
      { name: 'Devotees', path: '/trustee/devotees', icon: <FaUsers /> },
      { name: 'Donations', path: '/trustee/donations', icon: <FaDonate /> },
      { name: 'Events', path: '/trustee/events', icon: <FaCalendarAlt /> },
      { name: 'Branches', path: '/trustee/branches', icon: <FaMapMarkerAlt /> },
      { name: 'Annadan', path: '/trustee/annadaan', icon: <FaClipboardList />, badge: pendingCounts.annadaan ?? 0 },
      { name: 'Gallery', path: '/trustee/gallery', icon: <FaImages /> },
      { name: 'Documents', path: '/trustee/documents', icon: <FaFileAlt />, badge: pendingCounts.deletions ?? 0 },
      { name: 'Monastery History', path: '/trustee/math-history', icon: <FaHistory /> },
      { name: 'Lineage', path: '/trustee/lineage', icon: <FaSitemap /> },
      { name: 'Accountants', path: '/trustee/accountants', icon: <FaCalculator /> },
    ];
  } else if (user?.role === 'BranchManager') {
    navItems = [
      { name: 'Dashboard', path: '/branch/dashboard', icon: <FaHome /> },
      { name: 'Profile', path: '/branch/profile', icon: <FaUserShield /> },
      { name: 'Events', path: '/branch/events', icon: <FaCalendarAlt /> },
      { name: 'Devotees', path: '/branch/devotees', icon: <FaUsers /> },
      { name: 'Donations', path: '/branch/donations', icon: <FaDonate /> },
      { name: 'Announcements', path: '/branch/announcements', icon: <FaBullhorn />, showRedDot: unreadAnnouncementsCount > 0 },
      { name: 'Branches', path: '/branch/branches', icon: <FaMapMarkerAlt /> },
      { name: 'Documents', path: '/branch/documents', icon: <FaFileAlt /> },
    ];
  } else if (user?.role === 'Accountant') {
    navItems = [
      { name: 'Dashboard', path: '/accountant/dashboard', icon: <FaHome /> },
      { name: 'Profile', path: '/accountant/profile', icon: <FaUserShield /> },
      { name: 'Donations', path: '/accountant/donations', icon: <FaDonate /> },
      { name: 'Verify Donations', path: '/accountant/verify-donations', icon: <FaClipboardList />, badge: pendingCounts.verifyDonations ?? 0 },
      { name: 'Receipts', path: '/accountant/receipts', icon: <FaReceipt /> },
    ];
  } else if (user?.role === 'DocumentHandler' || user?.role === 'document_admin') {
    navItems = [
      { name: 'Dashboard', path: '/document-handler/dashboard', icon: <FaHome /> },
      { name: 'Profile', path: '/document-handler/profile', icon: <FaUserShield /> },
      { name: 'Documents', path: '/document-handler/documents', icon: <FaFileAlt /> },
      { name: 'Deletion Requests', path: '/document-handler/deletion-requests', icon: <FaTrash /> },
    ];
  } else {
    navItems = [
      { name: 'Dashboard', path: '/admin/dashboard', icon: <FaHome /> },
      { name: 'Profile', path: '/admin/profile', icon: <FaUserShield /> },
      { name: 'Devotees', path: '/admin/devotees', icon: <FaUsers /> },
      { name: 'Trustees', path: '/admin/trustees', icon: <FaUserShield /> },
      { name: 'Donations', path: '/admin/donations', icon: <FaDonate /> },
      { name: 'Events', path: '/admin/events', icon: <FaCalendarAlt /> },
      { name: 'Announcements', path: '/admin/announcements', icon: <FaBullhorn />, showRedDot: unreadAnnouncementsCount > 0 },
      { name: 'Sansthan Updates', path: '/trustee/bulletins', icon: <FaBullhorn /> },
      { name: 'Annadan', path: '/admin/annadaan', icon: <FaClipboardList /> },
      { name: 'Branches', path: '/admin/branches', icon: <FaMapMarkerAlt /> },
      { name: 'Branch Managers', path: '/admin/branch-managers', icon: <FaUserShield /> },
      { name: 'Documents', path: '/admin/documents', icon: <FaFileAlt /> },
      { name: 'Doc Admins', path: '/admin/document-admins', icon: <FaUserShield /> },
    ];
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-deepblue-900 overflow-hidden relative">
      
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/60 z-20 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed md:relative top-0 left-0 h-full w-64 bg-[#05051F] border-r border-[#0A0A2A] flex-col items-center py-8 z-30 text-white shadow-2xl transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0 flex' : '-translate-x-full md:translate-x-0 hidden md:flex'}`}
      >
        
        {/* Mobile Close Button */}
        <button onClick={() => setIsMobileMenuOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white md:hidden p-2 text-xl">
          <FaTimes />
        </button>

        {/* Logo Area */}
        <div className="flex flex-col items-center mb-10 text-center px-4">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mb-4 border-2 border-white drop-shadow-md overflow-hidden"
          >
            <img 
              src="/logo.png" 
              alt="Kolekar Maharaj Logo" 
              className="w-full h-full object-contain" 
            />
          </motion.div>
          <h1 className="text-xl font-black tracking-wider text-white">Shri Gurumurti Rudrapashupati Lingayat Monastery</h1>
          <p className="text-[10px] text-gray-400 font-bold tracking-widest mt-1 uppercase">{user?.role} Panel</p>
        </div>

        {/* Navigation Links */}
        <nav className="w-full px-4 flex-1 overflow-y-auto space-y-2 mt-4 pb-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {navItems.map((item) => (
              <NavLink
               key={item.name}
               to={item.path}
               onClick={() => setIsMobileMenuOpen(false)}
               className={({ isActive }) => 
                 `flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 font-bold relative overflow-hidden ${
                   isActive 
                     ? 'bg-[#FF7A2F]/10 text-[#FF7A2F] border-l-4 border-[#FF7A2F] shadow-sm' 
                     : 'text-gray-400 hover:bg-[#0A0A2A] hover:text-white'
                 }`
               }
             >
               <div className="flex items-center gap-4 z-10">
                 <div className="relative">
                   <span className="text-lg">{item.icon}</span>
                   {item.showRedDot && (
                     <>
                       <span className="absolute -top-1 -right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping opacity-75"></span>
                       <span className="absolute -top-1 -right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border border-[#05051F]"></span>
                     </>
                   )}
                 </div>
                 <span>{item.name}</span>
               </div>
               {item.badge !== undefined && (
                 <span className={`z-10 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md ${item.badge > 0 ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`}>
                   {item.badge}
                 </span>
               )}
             </NavLink>
          ))}
        </nav>

        <div className="w-full px-4 pb-4 pt-4">
          <div 
            onClick={handleLogout}
            className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-full bg-[#0EA5E9] flex items-center justify-center text-white font-bold text-lg shrink-0 overflow-hidden">
                {user?.profilePhoto ? (
                  <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${user.profilePhoto}`} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user?.name ? user.name.charAt(0).toUpperCase() : (user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'M')
                )}
              </div>
              <div className="flex flex-col truncate">
                <span className="text-sm font-bold text-white truncate">{user?.name || user?.displayName || 'Main System Admin'}</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider truncate">{user?.role || 'Admin'}</span>
              </div>
            </div>
            <div className="text-gray-400 group-hover:text-red-500 transition-colors shrink-0 pr-1">
              <FaSignOutAlt className="text-lg" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#f8fafc]">
         
         {/* Top Navbar */}
         <header className="h-20 bg-white/90 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 md:px-8 z-10 sticky top-0">
            <div className="flex items-center gap-3">
              <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden text-gray-600 hover:text-[#FF7A2F] text-2xl p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <FaBars />
              </button>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 truncate max-w-[200px] sm:max-w-xs md:max-w-md lg:max-w-full">
                {navItems.find(i => i.path === location.pathname)?.name || "Dashboard"}
              </h2>
            </div>

            <div className="flex items-center gap-6 ml-auto">
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotifications(true)}
                className="relative p-2 text-gray-400 hover:text-[#FF7A2F] hover:bg-[#FF7A2F]/10 rounded-full transition-all"
              >
                <FaBell className="text-xl" />
                {(pendingCounts.total > 0 || unreadAnnouncementsCount > 0) && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
              </motion.button>
              
              <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-gray-900">{user?.name || user?.displayName || 'User'}</p>
                  <p className="text-xs text-gray-400 font-semibold tracking-wider">{user?.email || 'admin@temple.com'}</p>
                </div>
                <div className="w-10 h-10 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center font-black text-lg border border-gray-200 cursor-pointer select-none overflow-hidden">
                  {user?.profilePhoto ? (
                    <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${user.profilePhoto}`} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    user?.name ? user.name.charAt(0).toUpperCase() : (user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'ॐ')
                  )}
                </div>
              </div>


            </div>
         </header>

         <main ref={mainRef} className="flex-1 overflow-x-hidden overflow-y-auto relative">
           
           {/* Slide-out Notification Panel */}
           <AnimatePresence>
             {showNotifications && (
               <>
                 <motion.div
                   initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                   onClick={() => setShowNotifications(false)}
                   className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-[60]"
                 />
                 <motion.div
                   initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                   transition={{ type: "spring", damping: 25, stiffness: 200 }}
                   className="fixed top-0 right-0 h-full w-96 max-w-full bg-white shadow-2xl z-[70] flex flex-col border-l border-gray-100"
                 >
                   <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                     <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                       <FaBell className="text-[#FF7A2F]" /> Notifications
                     </h3>
                     <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-gray-900 font-bold">✕</button>
                   </div>
                   <div className="flex-1 overflow-y-auto p-4 space-y-3">
                     
                     {myNotifications.length === 0 ? (
                       <div className="text-center py-10 text-gray-400">
                         <FaBell className="mx-auto text-3xl mb-2 opacity-30" />
                         <p className="text-sm font-bold">No new notifications</p>
                       </div>
                     ) : (
                       myNotifications.map(ann => (
                         <div 
                           key={ann._id} 
                           className={`p-4 rounded-2xl border transition-colors relative overflow-hidden group ${ann.isRead ? 'bg-gray-50 border-gray-100 opacity-70' : 'bg-blue-50/50 border-blue-100 hover:bg-blue-50'}`}
                         >
                           {!ann.isRead && <div className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full m-3"></div>}
                           
                           <button 
                             onClick={(e) => {
                               e.stopPropagation();
                               handleDismiss(ann._id);
                             }}
                             className="absolute top-3 right-3 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-white rounded-full shadow-sm z-10"
                             title="Dismiss"
                           >
                             <FaTimes size={10} />
                           </button>

                           <div className="cursor-pointer pr-6" onClick={() => {
                             if(!ann.isRead) handleMarkAsRead(ann._id);
                             navigate(`/${user.role.toLowerCase()}/announcements`);
                           }}>
                             <div className="flex items-center gap-3 mb-2">
                               <div className={`w-8 h-8 rounded-full flex items-center justify-center ${ann.priority === 'Urgent' ? 'bg-red-100 text-red-500' : ann.priority === 'Important' ? 'bg-yellow-100 text-yellow-500' : 'bg-blue-100 text-blue-500'}`}>
                                 <FaBullhorn />
                               </div>
                               <h4 className="text-sm font-bold text-gray-900 pr-4 truncate">{ann.title}</h4>
                             </div>
                             <p className="text-xs text-gray-600 pl-11 line-clamp-2">{ann.message}</p>
                             <p className="text-[10px] text-gray-400 font-bold tracking-wider pl-11 mt-2 uppercase">
                               {new Date(ann.publishDate || ann.createdAt).toLocaleDateString()}
                             </p>
                           </div>
                         </div>
                       ))
                     )}
                     
                   </div>
                 </motion.div>
               </>
             )}
           </AnimatePresence>



           <div className="relative z-10 p-4 md:p-8 overflow-x-hidden">
             <div>
               {children}
             </div>
           </div>
         </main>
      </div>
    </div>
  );
};

export default Layout;
