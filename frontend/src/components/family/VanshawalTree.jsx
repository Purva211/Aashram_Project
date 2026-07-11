import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  FiZoomIn, FiZoomOut, FiMaximize, FiMinimize, FiRefreshCw, 
  FiUser, FiSearch, FiChevronDown, FiChevronRight, FiPlus 
} from 'react-icons/fi';
import { FaCrown } from 'react-icons/fa';

const VanshawalTree = ({ members, onSelectMember, selectedMemberId, onAddRelative }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [collapsed, setCollapsed] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [contextMenu, setContextMenu] = React.useState(null);
  
  const treeContainerRef = useRef(null);
  const dragRef = useRef({ isDragging: false, startX: 0, startY: 0 });

  React.useEffect(() => {
    const handleCloseContext = () => setContextMenu(null);
    window.addEventListener('click', handleCloseContext);
    return () => window.removeEventListener('click', handleCloseContext);
  }, []);

  const handleContextAction = (type) => {
    if (onAddRelative && contextMenu?.member) {
      onAddRelative(contextMenu.member, type);
    }
    setContextMenu(null);
  };

  if (!members || members.length === 0) {
    return (
      <div className="h-[500px] bg-[#FAF9F5] rounded-[2.5rem] flex flex-col justify-center items-center p-8 border border-slate-150 shadow-inner">
        <div className="animate-pulse flex flex-col items-center space-y-12 w-full max-w-lg">
          <div className="w-44 h-16 bg-slate-200 rounded-2xl shadow-sm border border-slate-100"></div>
          <div className="w-1 border-l-2 border-dashed border-slate-200 h-10"></div>
          <div className="flex gap-16 justify-center w-full">
            <div className="w-44 h-16 bg-slate-200 rounded-2xl shadow-sm border border-slate-100"></div>
            <div className="w-44 h-16 bg-slate-200 rounded-2xl shadow-sm border border-slate-100"></div>
          </div>
        </div>
        <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] mt-8 animate-pulse">Loading family registry tree...</p>
      </div>
    );
  }

  // Map to speed up lookups
  const memberMap = {};
  members.forEach(m => {
    memberMap[m._id.toString()] = m;
  });

  // Find root members (no father and no mother registered in this list)
  const rootMembers = members.filter(m => {
    const hasFather = m.fatherId && memberMap[m.fatherId.toString()];
    const hasMother = m.motherId && memberMap[m.motherId.toString()];
    return !hasFather && !hasMother;
  });

  // Get children of a member (checking if they are father or mother)
  const getChildren = (memberId) => {
    return members.filter(m => 
      (m.fatherId && m.fatherId.toString() === memberId.toString()) ||
      (m.motherId && m.motherId.toString() === memberId.toString())
    );
  };

  // Toggle expand/collapse
  const toggleCollapse = (id, e) => {
    e.stopPropagation();
    const newCollapsed = new Set(collapsed);
    if (newCollapsed.has(id)) {
      newCollapsed.delete(id);
    } else {
      newCollapsed.add(id);
    }
    setCollapsed(newCollapsed);
  };

  // Search inside tree: check if search term matches node or descendants
  const matchesSearch = (member) => {
    if (!searchTerm) return false;
    const term = searchTerm.toLowerCase();
    return (
      member.name.toLowerCase().includes(term) ||
      member.devoteeId.toLowerCase().includes(term) ||
      (member.mobile && member.mobile.includes(term)) ||
      (member.gotra && member.gotra.toLowerCase().includes(term))
    );
  };

  // Drag pan handlers
  const handleMouseDown = (e) => {
    if (e.target.closest('button') || e.target.closest('.card-interactive')) return;
    dragRef.current = {
      isDragging: true,
      startX: e.clientX - position.x,
      startY: e.clientY - position.y
    };
  };

  const handleMouseMove = (e) => {
    if (!dragRef.current.isDragging) return;
    setPosition({
      x: e.clientX - dragRef.current.startX,
      y: e.clientY - dragRef.current.startY
    });
  };

  const handleMouseUp = () => {
    dragRef.current.isDragging = false;
  };

  // Zoom controls
  const zoomIn = () => setScale(prev => Math.min(prev + 0.1, 2));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5));
  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const toggleFullScreen = () => {
    if (!isFullScreen) {
      if (treeContainerRef.current.requestFullscreen) {
        treeContainerRef.current.requestFullscreen();
      }
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullScreen(false);
    }
  };

  // Recursive Tree Node Renderer
  const renderTreeNode = (member) => {
    const children = getChildren(member._id);
    const hasChildren = children.length > 0;
    const isCollapsed = collapsed.has(member._id.toString());
    
    // Find spouse
    const spouse = member.spouseId ? memberMap[member.spouseId.toString()] : null;
    
    const isSelected = selectedMemberId === member._id || (spouse && selectedMemberId === spouse._id);
    const highlight = matchesSearch(member) || (spouse && matchesSearch(spouse));

    return (
      <li key={member._id} className="relative flex flex-col items-center px-4">
        {/* Connection line helper */}
        <div className="absolute top-0 h-4 border-l border-slate-300"></div>

        {/* Combined Couple Card or Single Card */}
        <div className="flex items-center gap-2 relative z-10 bg-transparent py-2">
          
          {/* Main Devotee Card */}
          <div 
            onClick={() => onSelectMember(member._id)}
            onContextMenu={(e) => {
              e.preventDefault();
              setContextMenu({ x: e.clientX, y: e.clientY, member: member });
            }}
            className={`card-interactive flex flex-col p-4 w-44 rounded-2xl border bg-white shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer ${
              isSelected ? 'ring-2 ring-saffron-500 border-saffron-500 scale-105' : 
              highlight ? 'ring-2 ring-yellow-400 border-yellow-400 animate-pulse' : 'border-gray-200'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black ${member.gender === 'Male' ? 'bg-orange-500' : 'bg-rose-500'}`}>
                {member.profilePhoto ? (
                  <img src={member.profilePhoto} alt={member.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <FiUser />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-slate-800 truncate leading-tight">{member.name}</p>
                <p className="text-[9px] text-slate-400 font-bold mt-0.5">{member.devoteeId}</p>
              </div>
              {member.isFamilyHead && <FaCrown className="text-saffron-500 text-sm shrink-0" />}
            </div>
            
            <div className="flex items-center justify-between text-[8px] font-black text-slate-400 uppercase tracking-wider mt-1 border-t border-slate-100 pt-1.5">
              <span>Gen {member.generationLevel}</span>
              <span className={`px-1.5 py-0.5 rounded ${member.gender === 'Male' ? 'bg-orange-50 text-orange-600' : 'bg-rose-50 text-rose-600'}`}>{member.gender}</span>
            </div>

            {onAddRelative && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onAddRelative(member);
                }}
                className="mt-2 text-[9px] font-black text-center text-saffron-600 hover:text-saffron-700 bg-saffron-50 hover:bg-saffron-100 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                <FiPlus size={10} /> Add Relation
              </button>
            )}
          </div>

          {/* Spouse Card (if married) */}
          {spouse && (
            <>
              {/* Spousal Connector Line */}
              <div className="w-4 border-t-2 border-dashed border-slate-300"></div>
              
              <div 
                onClick={() => onSelectMember(spouse._id)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setContextMenu({ x: e.clientX, y: e.clientY, member: spouse });
                }}
                className={`card-interactive flex flex-col p-4 w-44 rounded-2xl border bg-white shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer ${
                  selectedMemberId === spouse._id ? 'ring-2 ring-saffron-500 border-saffron-500 scale-105' : 
                  highlight ? 'ring-2 ring-yellow-400 border-yellow-400 animate-pulse' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black ${spouse.gender === 'Male' ? 'bg-orange-500' : 'bg-rose-500'}`}>
                    {spouse.profilePhoto ? (
                      <img src={spouse.profilePhoto} alt={spouse.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <FiUser />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-slate-800 truncate leading-tight">{spouse.name}</p>
                    <p className="text-[9px] text-slate-400 font-bold mt-0.5">{spouse.devoteeId}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-[8px] font-black text-slate-400 uppercase tracking-wider mt-1 border-t border-slate-100 pt-1.5">
                  <span>Spouse</span>
                  <span className={`px-1.5 py-0.5 rounded ${spouse.gender === 'Male' ? 'bg-orange-50 text-orange-600' : 'bg-rose-50 text-rose-600'}`}>{spouse.gender}</span>
                </div>

                {onAddRelative && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddRelative(spouse);
                    }}
                    className="mt-2 text-[9px] font-black text-center text-saffron-600 hover:text-saffron-700 bg-saffron-50 hover:bg-saffron-100 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <FiPlus size={10} /> Add Relation
                  </button>
                )}
              </div>
            </>
          )}

        </div>

        {/* Children Sub-Tree */}
        {hasChildren && (
          <div className="flex flex-col items-center mt-4">
            
            {/* Collapse/Expand Toggle Button */}
            <button 
              onClick={(e) => toggleCollapse(member._id, e)}
              className="w-5 h-5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors z-20 shadow-sm mb-2"
            >
              {isCollapsed ? <FiChevronRight size={12} /> : <FiChevronDown size={12} />}
            </button>

            {!isCollapsed && (
              <div className="relative">
                {/* Horizontal branch line divider */}
                <div className="absolute top-0 left-[22px] right-[22px] border-t border-slate-300"></div>
                
                <ul className="flex items-start justify-center gap-8 pt-4">
                  {children.map(child => renderTreeNode(child))}
                </ul>
              </div>
            )}
          </div>
        )}
      </li>
    );
  };

  return (
    <div 
      ref={treeContainerRef}
      className={`relative w-full rounded-[2rem] border border-gray-100 bg-[#FAF9F5] shadow-inner overflow-hidden select-none ${
        isFullScreen ? 'h-screen w-screen z-50 fixed inset-0' : 'h-[600px]'
      }`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ cursor: dragRef.current.isDragging ? 'grabbing' : 'grab' }}
    >
      
      {/* Dynamic Connector Canvas behind elements */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <svg className="w-full h-full">
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E2E8F0" strokeWidth="1" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Floating Header Toolbar */}
      <div className="absolute top-6 left-6 right-6 z-30 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/80 backdrop-blur-md px-6 py-4 rounded-2xl border border-slate-200/50 shadow-lg">
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-saffron-50 flex items-center justify-center text-saffron-500 font-bold">
            <FaCrown />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800 tracking-wide uppercase">Interactive Vanshawal</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Drag to pan • Click to select devotee</p>
          </div>
        </div>

        {/* Tree Inner Searching */}
        <div className="relative w-full sm:w-64">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            placeholder="Search member in tree..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-saffron-500/20 focus:border-saffron-500 transition-all text-slate-700"
          />
        </div>

        {/* View Zoom Control Action Bar */}
        <div className="flex items-center gap-2">
          <button onClick={zoomIn} title="Zoom In" className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-sm"><FiZoomIn size={14} /></button>
          <button onClick={zoomOut} title="Zoom Out" className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-sm"><FiZoomOut size={14} /></button>
          <button onClick={resetZoom} title="Reset Scale" className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-sm"><FiRefreshCw size={14} /></button>
          <button onClick={toggleFullScreen} title="Toggle Fullscreen" className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-sm">
            {isFullScreen ? <FiMinimize size={14} /> : <FiMaximize size={14} />}
          </button>
        </div>

      </div>

      {/* Main Drag-Pan Tree Body Container */}
      <div 
        className="absolute origin-center transition-transform duration-75 select-none"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          left: '50%',
          top: '30%',
          transformOrigin: '0 0'
        }}
      >
        <ul className="flex items-start justify-center gap-8 pr-[300px]">
          {rootMembers.map(root => renderTreeNode(root))}
          {rootMembers.length === 0 && (
            <div className="text-center py-20 text-slate-400 font-bold">
              No family roots registered. Use "Create New Vanshawal" to start the lineage.
            </div>
          )}
        </ul>
      </div>

      {contextMenu && (
        <div 
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="fixed bg-white/95 backdrop-blur-xl border border-slate-200/60 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-2xl py-2 w-44 z-[9999] animate-in fade-in zoom-in-95 duration-150 text-[10px] font-black uppercase text-slate-700"
        >
          <div className="px-4 py-1.5 text-[8px] text-slate-400 font-bold border-b border-slate-100 uppercase tracking-widest mb-1.5">
            Add lineage to {contextMenu.member.name.split(' ')[0]}
          </div>
          {onAddRelative && (
            <>
              <button onClick={() => handleContextAction('Son')} className="w-full text-left px-4 py-2 hover:bg-saffron-50 hover:text-saffron-600 transition-colors flex items-center gap-2">
                <span>➕</span> Add Son
              </button>
              <button onClick={() => handleContextAction('Daughter')} className="w-full text-left px-4 py-2 hover:bg-saffron-50 hover:text-saffron-600 transition-colors flex items-center gap-2">
                <span>➕</span> Add Daughter
              </button>
              <button onClick={() => handleContextAction('Spouse')} className="w-full text-left px-4 py-2 hover:bg-saffron-50 hover:text-saffron-600 transition-colors flex items-center gap-2">
                <span>➕</span> Add Spouse
              </button>
              <button onClick={() => handleContextAction('Father')} className="w-full text-left px-4 py-2 hover:bg-saffron-50 hover:text-saffron-600 transition-colors flex items-center gap-2">
                <span>➕</span> Add Father
              </button>
              <button onClick={() => handleContextAction('Mother')} className="w-full text-left px-4 py-2 hover:bg-saffron-50 hover:text-saffron-600 transition-colors flex items-center gap-2">
                <span>➕</span> Add Mother
              </button>
              <button onClick={() => handleContextAction('Brother')} className="w-full text-left px-4 py-2 hover:bg-saffron-50 hover:text-saffron-600 transition-colors flex items-center gap-2">
                <span>➕</span> Add Brother
              </button>
              <button onClick={() => handleContextAction('Sister')} className="w-full text-left px-4 py-2 hover:bg-saffron-50 hover:text-saffron-600 transition-colors flex items-center gap-2">
                <span>➕</span> Add Sister
              </button>
            </>
          )}
        </div>
      )}

    </div>
  );
};

export default VanshawalTree;
