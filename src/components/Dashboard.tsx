import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, PlusCircle, Leaf, Calendar, Users, Target, User, Heart, ChevronRight, X, AlertCircle } from 'lucide-react';
import { PlantationDrive, NurseryData, StudentUser } from '../types';

interface DashboardProps {
  drives: PlantationDrive[];
  nurseries: NurseryData[];
  currentUser: StudentUser;
  onJoinDrive: (driveId: string) => void;
  onCreateDrive: (drive: Omit<PlantationDrive, 'id' | 'plantedTrees' | 'volunteerIds' | 'fundsRaised' | 'createdAt' | 'creatorName'>) => void;
}

export default function Dashboard({ drives, nurseries, currentUser, onJoinDrive, onCreateDrive }: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('');
  const [targetTrees, setTargetTrees] = useState(100);
  const [nurseryId, setNurseryId] = useState('');
  const [latitude, setLatitude] = useState(12.971);
  const [longitude, setLongitude] = useState(77.594);
  const [errorMsg, setErrorMsg] = useState('');

  const filteredDrives = drives.filter(d => 
    d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.locationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats calculation
  const totalTreesPlanted = drives.reduce((sum, d) => sum + d.plantedTrees, 0);
  const activeDrivesCount = drives.filter(d => d.status === 'active').length;
  const totalVolunteersCount = new Set(drives.flatMap(d => d.volunteerIds)).size + 3; // + mock padding

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !locationName || !targetTrees) {
      setErrorMsg('Please pre-fill all required parameters to establish the initiative.');
      return;
    }
    onCreateDrive({
      title,
      description,
      locationName,
      targetTrees: Number(targetTrees),
      nurseryId: nurseryId || undefined,
      latitude: Number(latitude),
      longitude: Number(longitude),
      creatorId: currentUser.userId,
      status: 'planned'
    });
    // Reset state
    setTitle('');
    setDescription('');
    setLocationName('');
    setTargetTrees(100);
    setNurseryId('');
    setIsCreateOpen(false);
    setErrorMsg('');
  };

  return (
    <div id="dashboard-view-root" className="space-y-10">
      {/* Visual Identity Hero banner with photographic depth - Enhanced Contrast */}
      <motion.div 
        id="dashboard-hero-banner"
        initial={{ opacity: 0, y: -25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative overflow-hidden rounded-3xl bg-neutral-950 border-2 border-emerald-500/20 p-8 md:p-14 text-white shadow-2xl min-h-[400px] flex flex-col justify-center"
      >
        {/* Underlay background photography of lush green forests - Bumped up visibility */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <img 
            src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=1600" 
            alt="Lush green trees background" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-65 object-center scale-100 filter brightness-110 contrast-115 saturate-125 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/70 to-neutral-950/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-2xl space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-400 text-neutral-950 border border-emerald-300">
            <Leaf className="w-3.5 h-3.5 animate-pulse" /> CLIMATE RESTORE DEPLOYMENT
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-black tracking-tight text-white leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            Nurture Tomorrow’s KARAM Green Program, <span className="text-emerald-300 font-sans italic font-normal">Starting Today</span>
          </h1>
          <p className="text-neutral-100 font-sans text-sm md:text-base leading-relaxed font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            Join student collectives in mapping localized deforested zones, matching native sapling stockpiles, launching weekend planting drives, and earning environmental stewardship score badges.
          </p>
          <div className="pt-3 flex flex-wrap gap-4">
            <button
              id="action-trigger-open-create-drive"
              onClick={() => setIsCreateOpen(true)}
              className="px-6 py-3.5 rounded-xl bg-orange-400 hover:bg-orange-300 active:bg-orange-500 font-sans text-sm font-bold text-neutral-950 transition-all shadow-lg hover:shadow-xl hover:scale-102 flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4.5 h-4.5" /> Start Restoration Drive
            </button>
          </div>
        </div>
      </motion.div>

      {/* Numerical Stats Dashboard - Cute, Colorful, Attractive Cards with Emojis */}
      <div id="stats-summary-grid" className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { 
            label: 'Total Trees Planted', 
            value: totalTreesPlanted, 
            sub: 'Across campus forest zones', 
            icon: Leaf, 
            color: 'text-emerald-700 bg-emerald-50 border-emerald-300', 
            emoji: '🌳', 
            bgStyle: 'bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/20 shadow-emerald-700/5' 
          },
          { 
            label: 'Active Native Drives', 
            value: activeDrivesCount, 
            sub: 'Fostering native bio-diversity', 
            icon: Calendar, 
            color: 'text-teal-700 bg-teal-50 border-teal-300', 
            emoji: '📅', 
            bgStyle: 'bg-teal-500/5 hover:bg-teal-500/10 border-teal-500/20 shadow-teal-700/5' 
          },
          { 
            label: 'Registered Volunteers', 
            value: totalVolunteersCount, 
            sub: 'Engaged student network', 
            icon: Users, 
            color: 'text-blue-700 bg-blue-50 border-blue-300', 
            emoji: '👥', 
            bgStyle: 'bg-blue-500/5 hover:bg-blue-500/10 border-blue-500/20 shadow-blue-700/5' 
          },
          { 
            label: 'Total Target Saplings', 
            value: drives.reduce((sum, d) => sum + d.targetTrees, 0), 
            sub: 'Next quarter targets', 
            icon: Target, 
            color: 'text-orange-700 bg-orange-50 border-orange-300', 
            emoji: '🎯', 
            bgStyle: 'bg-orange-500/5 hover:bg-orange-500/10 border-orange-500/20 shadow-orange-700/5' 
          }
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * idx, duration: 0.5 }}
            className={`p-6 rounded-3xl bg-white border-2 hover:-translate-y-1 transition-all duration-300 shadow-md ${stat.bgStyle} flex flex-col justify-between`}
          >
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-mono font-extrabold text-neutral-500 tracking-wider uppercase">{stat.label}</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xl leading-none">{stat.emoji}</span>
                <div className={`p-2 rounded-xl border ${stat.color}`}>
                  <stat.icon className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
            <div className="space-y-1 mt-4">
              <span className="text-3xl font-serif font-black text-neutral-900 tracking-tight block">{stat.value}</span>
              <p className="text-[11px] text-neutral-550 font-sans leading-tight font-medium">{stat.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* NEW: Featured Indigenous Saplings segment for educational value */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold block">Educational Reference Guide</span>
            <h2 className="text-xl font-serif font-bold text-neutral-800">Featured Indigenous Tree Species</h2>
          </div>
          <span className="text-xs font-mono text-neutral-400 hidden sm:inline">Native to peninsular India, dry deciduous zones</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              name: 'Pongamia (Karanja)',
              desc: 'Extremely resilient soil restorer with beautiful lavender-hued blooms. Perfect for concrete boundaries, filters toxic diesel fumes.',
              photo: 'https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&q=80&w=600',
              badge: 'Resilient Care'
            },
            {
              name: 'Jamun (Black Plum)',
              desc: 'Rapidly growing evergreen that provides thick fruit canopies. Re-invigorates lost urban sparrow populations and stabilizes water banks.',
              photo: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=600',
              badge: 'Bird Sanctuary Ally'
            },
            {
              name: 'Amaltas (Golden Shower)',
              desc: 'Stunning yellow cascades of cascading foliage. Rich in local pollen, bringing honeybee swarms and cooling localized micro-climates.',
              photo: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&q=80&w=600',
              badge: 'Pollinator Magnet'
            }
          ].map((species, i) => (
            <div 
              key={species.name}
              className="bg-white border border-neutral-150 rounded-2xl overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="relative h-32 overflow-hidden">
                <img 
                  src={species.photo} 
                  alt={species.name} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-2 left-2 bg-neutral-900/80 backdrop-blur-xs text-[9px] font-mono text-white font-bold px-2 py-0.5 rounded-md uppercase">
                  {species.badge}
                </span>
              </div>
              <div className="p-4 space-y-1.5 flex-1 flex flex-col justify-between">
                <h4 className="font-serif font-bold text-sm text-neutral-800">{species.name}</h4>
                <p className="text-xs text-neutral-500 leading-relaxed font-sans">{species.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Container: Drives Search, filter and Grid */}
      <div id="drives-explorer-section" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-neutral-200">
          <div className="space-y-1">
            <h2 className="text-2xl font-serif font-extrabold text-neutral-800">Restoration Drives</h2>
            <p className="text-xs text-neutral-550 font-sans">Discover, join, or sponsor active planting programs initiated by university clubs.</p>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              id="search-plantation-drives-input"
              type="text"
              placeholder="Search drives by name, tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-neutral-200 text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs font-sans"
            />
          </div>
        </div>

        {/* Drives Grid */}
        <div id="drives-display-grid" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredDrives.map((drive, idx) => {
            const hasJoined = drive.volunteerIds.includes(currentUser.userId);
            const progressPct = Math.min(100, Math.round((drive.plantedTrees / drive.targetTrees) * 100));
            const availableNursery = nurseries.find(n => n.id === drive.nurseryId);

            // High-quality imagery pairing based on drive context
            const driveImages: Record<string, string> = {
              'drive_1': 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=600', // Dense woods
              'drive_2': 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=600', // Riparian reeds
              'drive_3': 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&q=80&w=600'  // Urban shade
            };
            const drivePhoto = driveImages[drive.id] || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=600';

            return (
              <motion.div
                id={`drive-card-${drive.id}`}
                key={drive.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex flex-col justify-between rounded-3xl bg-white border border-neutral-150 overflow-hidden shadow-sm hover:shadow-lg hover:border-neutral-250 transition-all group"
              >
                {/* Visual Header Image representation of Restoration spot */}
                <div className="relative h-44 overflow-hidden bg-neutral-100">
                  <img 
                    src={drivePhoto} 
                    alt={drive.title} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 via-transparent to-transparent" />
                  
                  {drive.status === 'completed' && (
                    <div className="absolute top-3 right-3 bg-neutral-900 border border-neutral-700 text-white font-mono px-3 py-1 rounded-lg text-[10px] uppercase tracking-wider font-bold">
                      Completed Drive
                    </div>
                  )}
                  {drive.status === 'active' && (
                    <div className="absolute top-3 right-3 bg-emerald-500 border border-emerald-400 text-neutral-950 font-mono px-3 py-1 rounded-lg text-[10px] uppercase tracking-wider font-bold animate-pulse">
                      Active Campaign
                    </div>
                  )}
                  {drive.status === 'planned' && (
                    <div className="absolute top-3 right-3 bg-amber-400 border border-amber-300 text-neutral-950 font-mono px-3 py-1 rounded-lg text-[10px] uppercase tracking-wider font-bold">
                      Planned Target
                    </div>
                  )}

                  <div className="absolute bottom-3 left-4 right-4">
                    <p className="text-[10px] text-emerald-300 font-mono tracking-widest font-bold uppercase">坐标 PIN CAMPUS DEFICIT ZONE</p>
                    <h3 className="text-base font-serif font-black text-white leading-tight mt-0.5 truncate drop-shadow-sm">
                      {drive.title}
                    </h3>
                  </div>
                </div>

                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-1 text-[11px] font-mono text-neutral-450 uppercase">
                      <span>📍 {drive.locationName}</span>
                    </div>

                    <p className="text-xs text-neutral-600 leading-relaxed font-sans line-clamp-2">
                      {drive.description}
                    </p>

                    {/* Progress Indicator */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="text-neutral-500">KARAM GREEN PROGRAM LANDING PROGRESS</span>
                        <span className="text-neutral-800 font-bold">{drive.plantedTrees} / {drive.targetTrees} TREES ({progressPct}%)</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-neutral-100 overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full transition-all duration-700" 
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Allied Nursery Link */}
                    {availableNursery && (
                      <div className="p-2.5 rounded-xl bg-neutral-50 text-[11px] text-neutral-500 flex items-center justify-between border border-neutral-150 font-mono">
                        <div className="flex items-center gap-1.5 leading-none">
                          <Leaf className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Supply Partner: <strong className="text-neutral-800 font-bold">{availableNursery.name.split(' ')[0]} Hub</strong></span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                    <div className="flex items-center gap-3.5 text-[11px] font-mono text-neutral-450">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-neutral-400" /> {drive.volunteerIds.length} Joined
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-rose-450" /> ${drive.fundsRaised} USD
                      </span>
                    </div>
                    <button
                      id={`btn-join-drive-${drive.id}`}
                      disabled={hasJoined || drive.status === 'completed'}
                      onClick={() => onJoinDrive(drive.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold font-sans transition-all cursor-pointer ${
                        hasJoined 
                          ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed border border-neutral-200' 
                          : drive.status === 'completed'
                            ? 'bg-neutral-50 text-neutral-400 border border-transparent'
                            : 'bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 text-emerald-700 border border-emerald-350/20'
                      }`}
                    >
                      {hasJoined ? 'Already Joined' : drive.status === 'completed' ? 'Drive Ended' : 'Volunteer Now'}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Start Drive Dialog (Vibrant Modern slide-in modal) */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-xs">
          <motion.div
            id="create-drive-modal-card"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl max-w-lg w-full p-6 border border-neutral-200 shadow-2xl relative max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Leaf className="w-5 h-5 text-emerald-500" />
                <h2 className="text-xl font-sans font-bold text-neutral-800">Establish a Plantation Drive</h2>
              </div>
              <button 
                id="close-create-drive-modal"
                onClick={() => setIsCreateOpen(false)}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 text-rose-700 rounded-xl mb-4 text-xs font-mono flex items-center gap-2 border border-rose-100">
                <AlertCircle className="w-4 h-4 text-rose-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 font-sans text-neutral-700">
              <div className="space-y-1">
                <label className="text-xs font-mono uppercase tracking-wider text-neutral-500">Drive Title *</label>
                <input
                  id="form-drive-title"
                  type="text"
                  required
                  placeholder="e.g. Vidyaranyapura Student Miyawaki Forest"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono uppercase tracking-wider text-neutral-500">Initiative Description *</label>
                <textarea
                  id="form-drive-desc"
                  required
                  rows={4}
                  placeholder="Explain the environmental restoration goals, species selection, soil type, and other collaborative information..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono uppercase tracking-wider text-neutral-500">Location description *</label>
                  <input
                    id="form-drive-location-name"
                    type="text"
                    required
                    placeholder="e.g. Jayanagar metro walk"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-mono uppercase tracking-wider text-neutral-500">Target Trees *</label>
                  <input
                    id="form-drive-target"
                    type="number"
                    min={10}
                    max={10000}
                    required
                    value={targetTrees}
                    onChange={(e) => setTargetTrees(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-sm focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono uppercase tracking-wider text-neutral-500">Link Local Supply Nursery</label>
                <select
                  id="form-drive-nursery"
                  value={nurseryId}
                  onChange={(e) => setNurseryId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-sm focus:outline-none focus:border-emerald-500"
                >
                  <option value="">-- No nursery linked (uncoordinated) --</option>
                  {nurseries.map(nur => (
                    <option key={nur.id} value={nur.id}>{nur.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-mono uppercase text-neutral-550">
                  <span className="font-bold">📍 RESTORATION MAP COORDINATE SELECTOR</span>
                  <span className="text-[10px] text-emerald-600 font-extrabold animate-pulse">tap map to extract GPS coordinates</span>
                </div>
                
                <div 
                  id="form-mini-coordinate-map"
                  className="relative w-full h-[180px] rounded-2xl bg-neutral-900 border-2 border-neutral-800 overflow-hidden cursor-crosshair group shadow-inner"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    
                    const xPct = x / rect.width;
                    const yPct = 1 - (y / rect.height);
                    
                    const latMin = 12.910;
                    const latMax = 13.110;
                    const lngMin = 77.500;
                    const lngMax = 77.670;
                    
                    const calculatedLat = latMin + (yPct * (latMax - latMin));
                    const calculatedLng = lngMin + (xPct * (lngMax - lngMin));
                    
                    setLatitude(Number(calculatedLat.toFixed(4)));
                    setLongitude(Number(calculatedLng.toFixed(4)));
                  }}
                >
                  {/* Decorative geographic zones inside Bengaluru map */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:16px_16px]" />
                  <div className="absolute top-2 left-3 text-[9px] font-mono text-neutral-450 uppercase select-none font-bold">GKVK Area (North)</div>
                  <div className="absolute bottom-2 left-3 text-[9px] font-mono text-neutral-450 uppercase select-none font-bold">Lalbagh Reserve (South)</div>
                  <div className="absolute bottom-2 right-3 text-[9px] font-mono text-neutral-450 uppercase select-none font-bold">Hennur Basin (East)</div>
                  
                  {/* Decorative wetland trail representing Hebbal stream */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
                    <path d="M 50,60 Q 150,90 280,40 T 450,110" fill="none" stroke="#22d3ee" strokeWidth="4" />
                    <circle cx="200" cy="50" r="15" fill="#10b981" fillOpacity="0.1" />
                  </svg>

                  {/* Render Visual Live Marker Pin */}
                  {(() => {
                    const latMin = 12.910;
                    const latMax = 13.110;
                    const lngMin = 77.500;
                    const lngMax = 77.670;
                    
                    const yPct = 100 - (((latitude - latMin) / (latMax - latMin)) * 100);
                    const xPct = ((longitude - lngMin) / (lngMax - lngMin)) * 100;
                    
                    const x = Math.max(2, Math.min(98, xPct));
                    const y = Math.max(2, Math.min(98, yPct));
                    
                    return (
                      <div 
                        className="absolute transform -translate-x-1/2 -translate-y-full flex flex-col items-center pointer-events-none"
                        style={{ left: `${x}%`, top: `${y}%` }}
                      >
                        <div className="bg-emerald-500 text-neutral-950 font-mono text-[9px] px-1.5 py-0.5 rounded-md font-extrabold shadow-md mb-0.5 uppercase whitespace-nowrap">
                          DRIVE TARGET
                        </div>
                        <div className="relative">
                          <div className="absolute inset-0 w-5 h-5 bg-emerald-400 rounded-full animate-ping opacity-60" />
                          <span className="text-xl">📍</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div className="grid grid-cols-2 gap-4 bg-neutral-50 p-3 rounded-xl border border-neutral-150 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono uppercase text-neutral-400 font-bold block">Selected Latitude</span>
                    <input
                      id="form-drive-lat-digital"
                      type="number"
                      step={0.0001}
                      value={latitude}
                      onChange={(e) => setLatitude(Number(Number(e.target.value).toFixed(4)))}
                      className="w-full px-3 py-1.5 border border-neutral-200 rounded-lg font-mono text-neutral-800 bg-white"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono uppercase text-neutral-400 font-bold block">Selected Longitude</span>
                    <input
                      id="form-drive-lng-digital"
                      type="number"
                      step={0.0001}
                      value={longitude}
                      onChange={(e) => setLongitude(Number(Number(e.target.value).toFixed(4)))}
                      className="w-full px-3 py-1.5 border border-neutral-200 rounded-lg font-mono text-neutral-800 bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 font-sans">
                <button
                  id="cancel-create-drive-modal"
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 border border-neutral-200 text-neutral-500 rounded-lg hover:bg-neutral-50 text-sm font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="submit-create-drive-form"
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 text-neutral-950 font-semibold rounded-lg hover:bg-emerald-400 active:bg-emerald-600 text-sm transition-colors cursor-pointer"
                >
                  Create Drive
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
