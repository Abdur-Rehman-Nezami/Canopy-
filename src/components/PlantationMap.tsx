import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  PlusCircle, 
  Filter, 
  HelpCircle, 
  Eye, 
  RefreshCw, 
  Search, 
  Layers, 
  Navigation, 
  Compass, 
  Check, 
  Trees, 
  Phone,
  CornerDownRight,
  ExternalLink,
  Map as MapIcon,
  ShieldAlert
} from 'lucide-react';
import { PlantationDrive, PlantationNeedSpot, StudentUser, SEED_NURSERIES } from '../types';

interface PlantationMapProps {
  drives: PlantationDrive[];
  needs: PlantationNeedSpot[];
  currentUser: StudentUser;
  onReportNeed: (need: Omit<PlantationNeedSpot, 'id' | 'reportedBy' | 'reporterName' | 'createdAt'>) => void;
  userLocation?: { lat: number; lng: number } | null;
  onDetectLocation?: () => void;
  isDetectingLoc?: boolean;
}

const PAKISTAN_LANDMARKS = [
  { id: 'l1', name: 'Punjab University Campus', latitude: 31.478, longitude: 74.298, icon: '🏫', desc: 'Vast academic green belt hosting experimental Shisham groves and student bird sanctuaries.', canopyPct: 82, heatIndex: '24°C Cool' },
  { id: 'l2', name: 'Bagh-e-Jinnah Botanical Reserve', latitude: 31.545, longitude: 74.331, icon: '💧', desc: 'Historic 141-acre garden in central Lahore with rare towering heritage trees.', canopyPct: 75, heatIndex: '25°C Temperate' },
  { id: 'l3', name: 'Gymkhana Estate Canopy', latitude: 31.540, longitude: 74.341, icon: '🌳', desc: 'Lush bamboo and ancient peepal buffer spaces providing much needed local shade cooling.', canopyPct: 91, heatIndex: '22°C Ideal' },
  { id: 'l4', name: 'Lahore Canal Riparian Belt', latitude: 31.522, longitude: 74.360, icon: '🌊', desc: 'Delicate canal sub-channel banks vulnerable to severe rain weathering and silt deposits.', canopyPct: 35, heatIndex: '31°C Alert Grid' },
  { id: 'l5', name: 'Jallo Park Forest Groves', latitude: 31.560, longitude: 74.430, icon: '🌾', desc: 'Vast state-administered reserve forest holding hardy local seeds and native plant stocks.', canopyPct: 69, heatIndex: '26°C Balanced' }
];

export default function PlantationMap({ 
  drives, 
  needs, 
  currentUser, 
  onReportNeed,
  userLocation,
  onDetectLocation,
  isDetectingLoc
}: PlantationMapProps) {
  const [filterType, setFilterType] = useState<'all' | 'drives' | 'needs'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium'>('all');
  const [selectedPin, setSelectedPin] = useState<{ type: 'drive' | 'need' | 'landmark'; data: any } | null>(null);
  
  // Interactive interactive states
  const [mapStyle, setMapStyle] = useState<'heat' | 'satellite' | 'classic'>('heat');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);

  // Map limits: Lahore central bounds
  const mapConfig = {
    latMin: 31.420,
    latMax: 31.580,
    lngMin: 74.200,
    lngMax: 74.450,
  };

  const mapRef = useRef<HTMLDivElement>(null);

  // Form states for reporting need spot
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportTitle, setReportTitle] = useState('');
  const [reportDesc, setReportDesc] = useState('');
  const [reportPriority, setReportPriority] = useState<'high' | 'medium' | 'low'>('high');
  const [clickedCoords, setClickedCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Convert real-world coordinates to layout percentage coordinates
  const projectCoords = (lat: number, lng: number) => {
    const yPct = 100 - (((lat - mapConfig.latMin) / (mapConfig.latMax - mapConfig.latMin)) * 100);
    const xPct = ((lng - mapConfig.lngMin) / (mapConfig.lngMax - mapConfig.lngMin)) * 100;
    return {
      x: Math.max(2, Math.min(98, xPct)),
      y: Math.max(2, Math.min(98, yPct)),
    };
  };

  // Convert click coordinates on Map back to real GPS Coordinates
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Avoid double trigger if clicking on pins or landmark icons
    const target = e.target as HTMLElement;
    if (target.closest('.interactive-pin') || target.closest('.landmark-pin')) {
      return;
    }

    if (!mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Percent
    const xPct = x / rect.width;
    const yPct = 1 - (y / rect.height);

    const lat = mapConfig.latMin + (yPct * (mapConfig.latMax - mapConfig.latMin));
    const lng = mapConfig.lngMin + (xPct * (mapConfig.lngMax - mapConfig.lngMin));

    setClickedCoords({
      lat: Number(lat.toFixed(4)),
      lng: Number(lng.toFixed(4)),
    });
    setIsReportOpen(true);
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTitle || !reportDesc || !clickedCoords) return;
    onReportNeed({
      title: reportTitle,
      description: reportDesc,
      priority: reportPriority,
      status: 'unassigned',
      latitude: clickedCoords.lat,
      longitude: clickedCoords.lng,
    });
    setReportTitle('');
    setReportDesc('');
    setIsReportOpen(false);
    setSelectedPin(null);
    setDispatchStatus('success_reported');
    setTimeout(() => setDispatchStatus(null), 4000);
  };

  // Simulate seedling procurement and assignment from nearest nursery
  const handleDispatchSaplings = (needId: string, needTitle: string) => {
    setDispatchStatus(`allocating_${needId}`);
    setTimeout(() => {
      setDispatchStatus(`done_${needId}`);
    }, 1500);
  };

  // Filtered dataset search matching titles and locations
  const filteredActivePins = useMemo(() => {
    const rawPins = [
      ...(filterType === 'all' || filterType === 'drives' ? drives.map(d => ({ type: 'drive' as const, data: d })) : []),
      ...(filterType === 'all' || filterType === 'needs' ? needs.map(n => ({ type: 'need' as const, data: n })) : []),
    ];

    return rawPins.filter(pin => {
      // Priority filter match
      if (pin.type === 'need' && priorityFilter !== 'all') {
        if (pin.data.priority !== priorityFilter) return false;
      }
      // Search query filter match
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const titleMatch = pin.data.title.toLowerCase().includes(query);
        const descMatch = pin.data.description.toLowerCase().includes(query);
        const locMatch = ('locationName' in pin.data && pin.data.locationName ? pin.data.locationName : '').toLowerCase().includes(query);
        return titleMatch || descMatch || locMatch;
      }
      return true;
    });
  }, [drives, needs, filterType, priorityFilter, searchQuery]);

  return (
    <div id="plantation-map-deep-interface" className="space-y-6">
      
      {/* Search and Quick Filters bar to support detailed search */}
      <div className="bg-white border border-neutral-150 p-4 rounded-3xl flex flex-col md:flex-row gap-4 justify-between items-center shadow-xs">
        <div className="relative w-full md:w-96 text-neutral-500">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            id="map-keyword-search"
            type="text"
            placeholder="Search drives, deficit areas, or coordinates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-sans focus:outline-none focus:border-emerald-500 focus:bg-white text-neutral-850"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-600 font-bold"
            >
              Clear
            </button>
          )}
        </div>

        {/* Map Atmosphere Layout Switcher */}
        <div className="flex bg-neutral-100 p-1 rounded-xl items-center gap-1 w-full md:w-auto overflow-x-auto">
          <span className="text-[10px] font-mono font-bold px-2 text-neutral-400 uppercase whitespace-nowrap flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-neutral-500" /> Atmosphere Layer:
          </span>
          {[
            { id: 'heat', label: '🌡️ Canopy Deficiency Heat' },
            { id: 'satellite', label: '🛰️ Cyber Grid' },
            { id: 'classic', label: '🌳 Botanical Meadow' }
          ].map(styleOpt => (
            <button
              key={styleOpt.id}
              onClick={() => setMapStyle(styleOpt.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                mapStyle === styleOpt.id 
                  ? 'bg-neutral-900 text-white shadow-xs' 
                  : 'text-neutral-500 hover:text-neutral-950'
              }`}
            >
              {styleOpt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar Controls - Left Column (Grid span 4) */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-white border border-neutral-150 shadow-sm space-y-6 flex flex-col justify-between h-fit">
          <div className="space-y-5">
            <div className="flex items-center gap-2 text-emerald-700">
              <Compass className="w-5 h-5 text-emerald-600 animate-spin" style={{ animationDuration: '8s' }} />
              <h2 className="text-base font-sans font-extrabold text-neutral-850 tracking-tight">Eco-Coordinate Compass</h2>
            </div>
            <p className="text-xs text-neutral-550 font-sans leading-relaxed">
              Trace severe deforestation zones in Pakistan with precision, lookup high-priority volunteer demands, or coordinate companion stock deliveries from nurseries.
            </p>

            {/* Geolocation Device Location Button */}
            <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-150 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-wider">Device Location</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              
              {!userLocation ? (
                <button
                  id="map-detect-location-btn"
                  onClick={onDetectLocation}
                  disabled={isDetectingLoc}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-sans text-xs font-bold cursor-pointer transition-all disabled:opacity-50"
                >
                  <Compass className={`w-4 h-4 ${isDetectingLoc ? 'animate-spin' : ''}`} />
                  <span>{isDetectingLoc ? 'Locating...' : 'Get Live Coordinates'}</span>
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono bg-neutral-900 text-emerald-400 p-2.5 rounded-xl border border-neutral-800">
                    <div>
                      <span className="text-neutral-500 block text-[8px] uppercase tracking-wider">Coordinates</span>
                      <span>{userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}</span>
                    </div>
                    <button 
                      onClick={onDetectLocation}
                      className="text-[10px] underline hover:text-emerald-300 font-extrabold cursor-pointer animate-pulse"
                    >
                      Refresh
                    </button>
                  </div>
                  
                  {userLocation.lat >= 31.420 && userLocation.lat <= 31.580 && userLocation.lng >= 74.200 && userLocation.lng <= 74.450 ? (
                    <div className="text-[10px] text-emerald-700 font-sans leading-relaxed bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
                      ℹ️ You are inside the Lahore coordinate projection space! Your position is marked with a pulsing blue pin on the interactive grid.
                    </div>
                  ) : (
                    <div className="text-[10px] text-amber-700 font-sans leading-relaxed bg-amber-50 p-2.5 rounded-xl border border-amber-100">
                      ⚠️ Note: Your current GPS coordinates fall outside of the Lahore central grid boundaries mapping. You can still coordinate standard points on the map manually!
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Informative Success Badge */}
            {dispatchStatus === 'success_reported' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100 text-xs font-sans flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>New deforestation point declared successfully on coordination grids!</span>
              </motion.div>
            )}

            <div className="space-y-4 pt-2">
              {/* Filter Layer */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-neutral-400 font-extrabold flex items-center gap-1">
                  <Filter className="w-3 h-3" /> MAP LAYER ENTITIES
                </span>
                <div className="grid grid-cols-3 gap-1 bg-neutral-50 p-1 rounded-xl border border-neutral-150">
                  {(['all', 'drives', 'needs'] as const).map(tab => (
                    <button
                      id={`filter-layer-${tab}`}
                      key={tab}
                      onClick={() => setFilterType(tab)}
                      className={`py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                        filterType === tab 
                          ? 'bg-neutral-900 text-white shadow-xs' 
                          : 'text-neutral-500 hover:text-neutral-800'
                      }`}
                    >
                      {tab === 'all' ? 'All Pins' : tab === 'drives' ? '🌿 Drives' : '⚠️ Needs'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Support Priority filter for Needs */}
              {filterType !== 'drives' && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-neutral-400 font-extrabold">EMERGENCY CLASSIFICATION</span>
                  <div className="grid grid-cols-3 gap-1 bg-neutral-50 p-1 rounded-xl border border-neutral-150">
                    {(['all', 'high', 'medium'] as const).map(pri => (
                      <button
                        id={`filter-pri-${pri}`}
                        key={pri}
                        onClick={() => setPriorityFilter(pri)}
                        className={`py-1 rounded-lg text-[10.5px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          priorityFilter === pri 
                            ? 'bg-orange-500 text-neutral-950' 
                            : 'text-neutral-500 hover:text-neutral-800'
                        }`}
                      >
                        {pri === 'all' ? 'Any' : pri}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Selected PIN / LANDMARK Interactive Slate */}
          <div id="pins-interaction-details" className="pt-5 border-t border-neutral-100 min-h-[190px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {selectedPin ? (
                <motion.div 
                  key={selectedPin.data.id || selectedPin.data.name}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[9px] font-mono uppercase font-black ${
                        selectedPin.type === 'drive' 
                          ? 'bg-emerald-100 text-emerald-850 border border-emerald-300' 
                          : selectedPin.type === 'landmark'
                            ? 'bg-blue-100 text-blue-900 border border-blue-300'
                            : selectedPin.data.priority === 'high' 
                              ? 'bg-rose-100 text-rose-800 border border-rose-300' 
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        {selectedPin.type === 'drive' && '🟢 Active Restoration Drive'}
                        {selectedPin.type === 'landmark' && '🏛️ Academic Landmark Reserve'}
                        {selectedPin.type === 'need' && `🚨 Deficit Area: ${selectedPin.data.priority} Priority`}
                      </span>
                      <h3 className="text-base font-serif font-black text-neutral-900 mt-1.5 leading-tight">
                        {selectedPin.type === 'landmark' ? selectedPin.data.name : selectedPin.data.title}
                      </h3>
                    </div>
                    <button 
                      onClick={() => setSelectedPin(null)}
                      className="text-neutral-400 hover:text-neutral-600 text-xs font-mono font-bold"
                    >
                      Dismiss
                    </button>
                  </div>

                  <p className="text-xs text-neutral-550 font-sans leading-relaxed">
                    {selectedPin.data.description || selectedPin.data.desc}
                  </p>

                  {/* Dynamic stats according to pin categorization */}
                  {selectedPin.type === 'landmark' ? (
                    <div className="space-y-2 bg-blue-50/50 p-3 rounded-2xl border border-blue-100 text-[11px] font-mono">
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Canopy Saturation:</span>
                        <strong className="text-blue-800 font-bold">{selectedPin.data.canopyPct}% (High Density)</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Micro-climate Temp:</span>
                        <strong className="text-neutral-800 font-bold">{selectedPin.data.heatIndex}</strong>
                      </div>
                      <div className="text-[10px] text-neutral-500 pt-1 leading-normal italic font-sans">
                        🏫 Teleporting focus coordinates to reference surrounding planting buffer boundaries.
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] space-y-1.5 bg-neutral-50 p-3 rounded-2xl border border-neutral-150 font-mono text-neutral-600">
                      <div className="flex justify-between">
                        <span>🛰️ GPS Grid:</span>
                        <strong className="text-neutral-800">{selectedPin.data.latitude}, {selectedPin.data.longitude}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>👤 Coordinator:</span>
                        <strong className="text-neutral-800">{selectedPin.type === 'drive' ? selectedPin.data.creatorName : selectedPin.data.reporterName || 'Student Volunteer'}</strong>
                      </div>
                      
                      {selectedPin.type === 'drive' ? (
                        <div className="pt-2 border-t border-neutral-150 flex justify-between items-center text-emerald-800 font-bold">
                          <span>🌳 Trees Planted:</span>
                          <span>{selectedPin.data.plantedTrees} / {selectedPin.data.targetTrees} Saplings</span>
                        </div>
                      ) : (
                        <div className="pt-2 border-t border-neutral-150 flex justify-between items-center font-bold">
                          <span>⚠️ Assignment:</span>
                          <span className="capitalize text-neutral-800">{selectedPin.data.status}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Interactive Call to Action Helper for reported spots */}
                  {selectedPin.type === 'need' && (
                    <div className="pt-1">
                      {dispatchStatus === `done_${selectedPin.data.id}` ? (
                        <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 border border-emerald-200">
                          <Check className="w-4.5 h-4.5 text-emerald-500" />
                          <span>Seedlings assigned from Cubbon Conservatory!</span>
                        </div>
                      ) : (
                        <button
                          id={`btn-match-${selectedPin.data.id}`}
                          onClick={() => handleDispatchSaplings(selectedPin.data.id, selectedPin.data.title)}
                          disabled={dispatchStatus === `allocating_${selectedPin.data.id}`}
                          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-neutral-950 font-sans text-xs font-bold shadow-md transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {dispatchStatus === `allocating_${selectedPin.data.id}` 
                            ? '🛰️ Interrogating Stockpiles...' 
                            : '⚡ Procure Saplings from Nearest Nursery'}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Interactive Call to Action Helper for active drives */}
                  {selectedPin.type === 'drive' && (
                    <div className="text-[10px] text-neutral-450 italic font-sans flex items-center gap-1">
                      <Trees className="w-3.5 h-3.5 text-emerald-500" />
                      <span>This drive is linked to local supply partners on the dashboard.</span>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="text-center py-6 text-neutral-400 font-sans space-y-3">
                  <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-500 border border-neutral-150">
                    <MapIcon className="w-4.5 h-4.5" />
                  </div>
                  <p className="text-xs leading-relaxed max-w-[240px] mx-auto">
                    Select any <strong className="text-neutral-700">active drive marker</strong> or <strong className="text-neutral-700">landmark reserve pin</strong> to query parameters, or tap any empty space to report a localized planting need.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Main Coordinate Grid Vector Map Canvas - Right Column (Grid span 8) */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-mono text-neutral-500">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-emerald-300 inline-block animate-pulse" /> Active Planting Drive
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Reported Need Spot
              </span>
              <span className="flex items-center gap-1 text-blue-600 font-bold">
                <span>🏛️</span> Landmark Reserve Outpost
              </span>
            </div>
            
            {/* Display latitude/longitude feedback as user hovers */}
            <div className="text-[10px] font-mono py-0.5 px-2 bg-neutral-900 text-emerald-400 rounded-md border border-neutral-800">
              Coordinate Bounds: Lahore North-Central Canopy System
            </div>
          </div>

          {/* Interactive Map Box Layer */}
          <div 
            id="vector-map-frame"
            ref={mapRef}
            onClick={handleMapClick}
            className={`relative w-full h-[480px] rounded-3xl border-2 overflow-hidden cursor-crosshair group shadow-xl transition-all duration-500 ${
              mapStyle === 'heat' 
                ? 'bg-[#12140e] border-[#3f4728]' 
                : mapStyle === 'satellite' 
                  ? 'bg-[#0a0c10] border-[#22d3ee]/20' 
                  : 'bg-[#f4f7f1] border-[#dfebd4]'
            }`}
          >
            {/* Visual background atmospheric representation */}
            
            {/* STYLE A: TEMPERATURE/CANOPY DEFICIT HEAT MAP */}
            {mapStyle === 'heat' && (
              <>
                {/* Simulated thermal heat domes representing low canopy urban zones */}
                <div className="absolute top-[20%] left-[30%] w-60 h-60 rounded-full bg-rose-500/10 filter blur-[60px] pointer-events-none animate-pulse" />
                <div className="absolute bottom-[25%] left-[65%] w-72 h-72 rounded-full bg-amber-500/10 filter blur-[80px] pointer-events-none animate-pulse" style={{ animationDuration: '6s' }} />
                <div className="absolute top-[60%] left-[10%] w-48 h-48 rounded-full bg-orange-500/8 filter blur-[50px] pointer-events-none" />
                
                {/* Matrix layout reference curves */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:16px_16px]" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:80px_80px]" />
              </>
            )}

            {/* STYLE B: FUTURISTIC CYBER GRID SATELLITE BLUEPRINT */}
            {mapStyle === 'satellite' && (
              <>
                <div className="absolute inset-0 bg-[radial-gradient(#22d3ee08_1px,transparent_1px)] bg-[size:10px_10px]" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#22d3ee0c_1px,transparent_1px),linear-gradient(to_bottom,#22d3ee0c_1px,transparent_1px)] bg-[size:50px_50px]" />
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-cyan-500/15 border-dashed border-t border-cyan-400/35 pointer-events-none" />
                <div className="absolute left-1/3 top-0 bottom-0 w-0.5 bg-cyan-500/15 border-dashed border-l border-cyan-400/35 pointer-events-none" />
              </>
            )}

            {/* STYLE C: WEED / BOTANICAL CLASSIC SLATE */}
            {mapStyle === 'classic' && (
              <>
                {/* Organic botanical patches */}
                <div className="absolute top-10 left-[15%] w-80 h-40 bg-emerald-100 rounded-full filter blur-3xl opacity-30 pointer-events-none" />
                <div className="absolute bottom-20 left-[50%] w-96 h-52 bg-teal-100 rounded-full filter blur-3xl opacity-30 pointer-events-none" />
                
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000003_1px,transparent_1px),linear-gradient(to_bottom,#00000003_1px,transparent_1px)] bg-[size:20px_20px]" />
              </>
            )}

            {/* Simulated Waterway - Vrishabhavathi flow or lake streams */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-current">
              <path 
                d="M 120,480 Q 280,310 410,250 T 780,120" 
                fill="none" 
                className={`${mapStyle === 'heat' ? 'stroke-cyan-950/40 text-cyan-500' : mapStyle === 'satellite' ? 'stroke-cyan-500/20 text-cyan-400' : 'stroke-blue-200 text-blue-400'}`} 
                strokeWidth="24" 
                strokeLinecap="round" 
              />
              <path 
                d="M 120,480 Q 280,310 410,250 T 780,120" 
                fill="none" 
                className={`${mapStyle === 'heat' ? 'stroke-cyan-900/20' : mapStyle === 'satellite' ? 'stroke-cyan-400/10' : 'stroke-blue-100'}`} 
                strokeWidth="12" 
                strokeLinecap="round" 
              />
              {/* Aquatic lettering */}
              <text x="320" y="270" className={`text-[9px] font-mono select-none tracking-widest fill-current ${mapStyle === 'heat' ? 'text-cyan-600/60' : mapStyle === 'satellite' ? 'text-cyan-400/40' : 'text-blue-500/70'}`}>
                VRISHABHAVATHI CANAL BUFFER
              </text>
            </svg>

            {/* RENDER PAKISTAN BOTANICAL LANDMARKS */}
            {PAKISTAN_LANDMARKS.map(lm => {
              const coords = projectCoords(lm.latitude, lm.longitude);
              return (
                <motion.button
                  key={lm.id}
                  whileHover={{ scale: 1.15, zIndex: 30 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPin({ type: 'landmark', data: lm });
                  }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 landmark-pin select-none cursor-pointer p-1 rounded-full bg-neutral-900/90 border border-blue-400/50 hover:border-blue-300 shadow-lg flex items-center gap-1 z-20"
                  style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
                >
                  <span className="text-[13px] leading-none">{lm.icon}</span>
                  <span className="text-[8.5px] font-mono text-white pr-1.5 font-extrabold tracking-tight hidden sm:inline-block">
                    {lm.name.slice(0, 10)}...
                  </span>
                </motion.button>
              );
            })}

            {/* RENDER USER'S LIVE POSITION PROJECTED PIN */}
            {userLocation && userLocation.lat >= 31.420 && userLocation.lat <= 31.580 && userLocation.lng >= 74.200 && userLocation.lng <= 74.450 && (() => {
              const coords = projectCoords(userLocation.lat, userLocation.lng);
              return (
                <div
                  id="user-pulse-marker"
                  style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-30"
                >
                  <span className="relative flex h-6 w-6 pointer-events-none">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-6 w-6 bg-blue-100 border-2 border-blue-500 items-center justify-center shadow-lg text-[11px] font-bold text-blue-700">
                      👤
                    </span>
                  </span>
                  <div className="absolute top-7 left-1/2 -translate-x-1/2 bg-neutral-900 border border-neutral-750 text-white text-[9px] font-mono px-2 py-0.5 rounded-md shadow-md whitespace-nowrap">
                    You Are Here
                  </div>
                </div>
              );
            })()}

            {/* RENDER DYNAMIC REGISTERED ACTIVE PINS & CORRESPONDING NEEDS */}
            {filteredActivePins.map(pin => {
              const coords = projectCoords(pin.data.latitude, pin.data.longitude);
              const isDrive = pin.type === 'drive';

              return (
                <motion.button
                  id={`map-pin-${pin.type}-${pin.data.id}`}
                  key={`${pin.type}-${pin.data.id}`}
                  whileHover={{ scale: 1.35, zIndex: 40 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPin(pin);
                  }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 interactive-pin cursor-pointer focus:outline-none z-10"
                  style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
                >
                  {isDrive ? (
                    <div className="relative">
                      {/* Interactive green pulse */}
                      <span className="absolute -inset-2 rounded-full bg-emerald-500/30 animate-ping" />
                      <div className="p-1 rounded-xl bg-emerald-400 hover:bg-emerald-300 border border-neutral-950 shadow-md">
                        <MapPin className="w-4 h-4 text-neutral-950" />
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      {/* Critical warning red flash */}
                      <span className="absolute -inset-2 rounded-full bg-rose-500/45 animate-pulse" />
                      <div className="p-1.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white border border-neutral-950 shadow-md">
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  )}
                </motion.button>
              );
            })}

            {/* Help guidelines helper watermark overlay */}
            <div className="absolute bottom-5 left-5 right-5 bg-neutral-950/85 backdrop-blur-xs px-3.5 py-2.5 rounded-2xl border border-neutral-805 text-[10px] font-sans text-neutral-300 pointer-events-none flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 leading-none">
                <Info className="w-4.5 h-4.5 text-emerald-400 animate-pulse shrink-0" />
                <span>Tap any empty coordinates on the grid to instantly flag high-deficit deficit zones for restoration!</span>
              </div>
              <div className="font-mono text-neutral-400 text-[9px] uppercase tracking-wide">
                Lahore Hub Area System
              </div>
            </div>
            
            {/* Visual north compass arrow indicator */}
            <div className="absolute top-5 right-5 bg-neutral-950/70 p-2 rounded-xl border border-neutral-800 text-white pointer-events-none flex flex-col items-center gap-0.5">
              <Compass className="w-5 h-5 text-neutral-450" />
              <span className="text-[8px] font-mono text-neutral-450">N</span>
            </div>
          </div>
        </div>
      </div>

      {/* Declaring Spot dialogue overlay */}
      {isReportOpen && clickedCoords && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-xs">
          <motion.div
            id="report-need-modal-card"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl max-w-md w-full p-6 border border-neutral-200 shadow-2xl relative"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-500" />
                <h3 className="text-base font-sans font-extrabold text-neutral-900 leading-tight">Flag Deforestation Spot</h3>
              </div>
              <button 
                id="close-report-need-modal"
                onClick={() => setIsReportOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 font-mono text-2xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-4 font-sans text-neutral-700 text-xs">
              
              <div className="p-3.5 rounded-2xl bg-neutral-50 text-[11px] text-neutral-500 font-mono space-y-1.5 border border-neutral-150">
                <div className="text-[10px] uppercase font-bold text-neutral-400">Captured coordinate vector extraction:</div>
                <div className="flex justify-between">
                  <span>Selected Latitude:</span>
                  <strong className="text-neutral-900">{clickedCoords.lat}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Selected Longitude:</span>
                  <strong className="text-neutral-900">{clickedCoords.lng}</strong>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10.5px] font-mono uppercase tracking-wider text-neutral-500 font-bold">Spot Target Identifier *</label>
                <input
                  id="form-pin-title"
                  type="text"
                  required
                  placeholder="e.g. Hebbal Bypass Riparian Deficit"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs focus:outline-none focus:border-emerald-500 text-neutral-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10.5px] font-mono uppercase tracking-wider text-neutral-500 font-bold">Damage Assessment & Observation *</label>
                <textarea
                  id="form-pin-description"
                  required
                  rows={3}
                  placeholder="Tell us what makes this area a high priority. Soil condition, approximate size, trees needed..."
                  value={reportDesc}
                  onChange={(e) => setReportDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs focus:outline-none focus:border-emerald-500 text-neutral-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10.5px] font-mono uppercase tracking-wider text-neutral-500 font-bold">Required Priority Level *</label>
                <select
                  id="form-pin-priority"
                  value={reportPriority}
                  onChange={(e) => setReportPriority(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-250 text-xs focus:outline-none text-neutral-800 font-medium"
                >
                  <option value="high">🌋 High Priority (Immediate soil erosion / complete soil dehydration)</option>
                  <option value="medium">🍁 Medium Priority (Canopy thinning / missing continuous tree corridor)</option>
                  <option value="low">🌱 Low Priority (Esthetic local landscaping / ornamental gap filling)</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3 text-xs font-bold leading-none">
                <button
                  id="cancel-report-need-modal"
                  type="button"
                  onClick={() => setIsReportOpen(false)}
                  className="px-4 py-2.5 border border-neutral-200 rounded-xl text-neutral-500 hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="submit-report-need-form"
                  type="submit"
                  className="px-5 py-2.5 bg-rose-650 hover:bg-rose-600 text-white rounded-xl transition-colors shadow-lg shadow-rose-100 cursor-pointer"
                >
                  Submit Gridded Spot
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
