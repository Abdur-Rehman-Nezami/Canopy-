import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Phone, 
  MapPin, 
  Search, 
  Leaf, 
  Info, 
  Warehouse, 
  PhoneCall, 
  Sparkles, 
  Check, 
  BookOpen, 
  Compass, 
  ExternalLink,
  Sunset,
  Droplet,
  Globe2,
  AlertCircle
} from 'lucide-react';
import { NurseryData } from '../types';

interface NurseryDirectoryProps {
  nurseries: NurseryData[];
  userLocation?: { lat: number; lng: number } | null;
  onDetectLocation?: () => void;
  isDetectingLoc?: boolean;
}

export default function NurseryDirectory({ 
  nurseries,
  userLocation,
  onDetectLocation,
  isDetectingLoc
}: NurseryDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNursery, setSelectedNursery] = useState<NurseryData | null>(nurseries[0] || null);
  const [selectedSpeciesDetails, setSelectedSpeciesDetails] = useState<any | null>(null);
  const [successPickupMsg, setSuccessPickupMsg] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'inventory' | 'ecological_impact' | 'botany_school'>('inventory');
  const [sortByProximity, setSortByProximity] = useState(true);

  // Haversine distance helper
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Auto-select nearest nursery on location activation/change
  React.useEffect(() => {
    if (userLocation && nurseries.length > 0) {
      const sorted = [...nurseries].sort((a, b) => {
        const dA = calculateDistance(userLocation.lat, userLocation.lng, a.latitude, a.longitude);
        const dB = calculateDistance(userLocation.lat, userLocation.lng, b.latitude, b.longitude);
        return dA - dB;
      });
      setSelectedNursery(sorted[0]);
    }
  }, [userLocation]);

  const filteredNurseries = nurseries.filter(n =>
    n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.availableSaplings.some(s => s.species.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const processedNurseries = React.useMemo(() => {
    if (userLocation && sortByProximity) {
      return [...filteredNurseries].sort((a, b) => {
        const dA = calculateDistance(userLocation.lat, userLocation.lng, a.latitude, a.longitude);
        const dB = calculateDistance(userLocation.lat, userLocation.lng, b.latitude, b.longitude);
        return dA - dB;
      });
    }
    return filteredNurseries;
  }, [filteredNurseries, userLocation, sortByProximity]);

  const handleRequestPickup = (species: string) => {
    setSuccessPickupMsg(`Reservation file registered successfully! Allied logistic coordinates for [${species}] saplings have been shared with your Student Profile.`);
    setTimeout(() => setSuccessPickupMsg(''), 6000);
  };

  // Helper to map cute, high-quality botanical emojis to species
  const getSpeciesEmoji = (species: string) => {
    const s = species.toLowerCase();
    if (s.includes('sandalwood')) return '🪵';
    if (s.includes('bamboo')) return '🎋';
    if (s.includes('amaltas')) return '🌼';
    if (s.includes('pongamia')) return '🌿';
    if (s.includes('neem')) return '🌱';
    if (s.includes('jamun')) return '🍇';
    if (s.includes('mango')) return '🥭';
    if (s.includes('jackfruit')) return '🍈';
    if (s.includes('peepal')) return '🌳';
    if (s.includes('rosewood')) return '🪵';
    if (s.includes('gulmohar')) return '🌸';
    if (s.includes('imli') || s.includes('tamarind')) return '🍂';
    return '🌱';
  };

  // Extra rich ecological details for botanical school
  const getSpeciesScientificData = (speciesName: string) => {
    const s = speciesName.toLowerCase();
    if (s.includes('sandalwood')) {
      return {
        latName: 'Santalum album',
        spacing: '4m to 6m apart',
        sunlight: 'Partial shade in early years (hemi-parasitic Host support is vital)',
        aquatic: 'Moderate moisture, avoid logged clay-pits',
        carbonRate: 'Low-Medium (Premium slow wood)',
        pollinatorAttraction: 'Highly responsive to tiny regional sweat bees'
      };
    }
    if (s.includes('bamboo')) {
      return {
        latName: 'Dendrocalamus strictus',
        spacing: '3m to 5m apart',
        sunlight: 'Full Sun (demands intense daylight for accelerated stalks)',
        aquatic: 'Thrives on moist riverbanks, stabilizes soil slide lines',
        carbonRate: 'Extreme Champion (Quick carbon locking biomass)',
        pollinatorAttraction: 'Provides dense structural nesting shelter'
      };
    }
    if (s.includes('jamun')) {
      return {
        latName: 'Syzygium cumini',
        spacing: '6m to 8m apart',
        sunlight: 'Generous Full Sun exposure',
        aquatic: 'High tolerance to monsoon water channels',
        carbonRate: 'High (Evergreen density)',
        pollinatorAttraction: 'Crucial forage for fruit bats, parakeets, and honey squirrels'
      };
    }
    if (s.includes('pongamia') || s.includes('karanja')) {
      return {
        latName: 'Pongamia pinnata',
        spacing: '5m apart',
        sunlight: 'Full direct harsh daylight, highly heat resistant',
        aquatic: 'Very drought tolerant, nitrogen fixer for bad soils',
        carbonRate: 'Medium-High',
        pollinatorAttraction: 'Attracts local blue butterflies and organic honeybees'
      };
    }
    if (s.includes('neem')) {
      return {
        latName: 'Azadirachta indica',
        spacing: '7m to 9m apart',
        sunlight: 'Severe sunny glare, thrives in concrete cracks and poor clay',
        aquatic: 'Minimal watering needed after the first active season',
        carbonRate: 'Spectacularly High (Legendary lifespan)',
        pollinatorAttraction: 'Strong insecticide repelling mosquitoes but inviting native bees'
      };
    }
    return {
      latName: 'Indigenous Cultivar',
      spacing: '5m to 6m apart',
      sunlight: 'Moderate to Full Sunny exposure',
      aquatic: 'Standard natural rainwater pacing',
      carbonRate: 'Balanced regional carbon offset',
      pollinatorAttraction: 'Attracts native moths, bird populations and garden bees'
    };
  };

  return (
    <div id="nurseries-directory-root" className="grid grid-cols-1 lg:grid-cols-12 gap-8 font-sans">
      
      {/* Sidebar: Nursery List - Left Column (Grid span 5) */}
      <div className="lg:col-span-5 space-y-4">
        {/* Search header panel */}
        <div className="p-5 rounded-3xl bg-white border border-neutral-150 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-xs font-mono font-bold text-neutral-500 uppercase tracking-wider block">Find Allied Nurseries</label>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-mono px-2 py-0.5 rounded-full font-bold">Active Pakistan Nodes</span>
          </div>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
              <Search className="w-4 h-4 text-neutral-400" />
            </span>
            <input
              id="search-nurseries-input"
              type="text"
              placeholder="Search by nursery name or plant species..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-xs rounded-xl bg-neutral-50 border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-neutral-800"
            />
          </div>

          {/* User Location Detector widget */}
          <div className="pt-2 border-t border-neutral-100 mt-2 space-y-2">
            {!userLocation ? (
              <button
                id="detect-location-btn"
                onClick={onDetectLocation}
                disabled={isDetectingLoc}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all font-sans text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                <Compass className={`w-4 h-4 ${isDetectingLoc ? 'animate-spin' : ''}`} />
                <span>{isDetectingLoc ? 'Locating Nearby Hubs...' : 'Find Nearest Nurseries'}</span>
              </button>
            ) : (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between py-1.5 px-2.5 rounded-xl bg-neutral-900 text-white border border-neutral-850">
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <div className="text-[10px] font-mono leading-none">
                      <span className="text-emerald-400 font-extrabold">{userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}</span>
                    </div>
                  </div>
                  <button 
                    onClick={onDetectLocation}
                    className="text-[9px] font-mono text-emerald-400 underline hover:text-emerald-350 font-extrabold cursor-pointer"
                  >
                    Refresh
                  </button>
                </div>
                {processedNurseries.length > 0 && userLocation && (
                  <div className="flex items-center justify-between text-[10px] font-medium text-emerald-700 px-1">
                    <span>Proximity sorting active</span>
                    <button 
                      onClick={() => setSortByProximity(!sortByProximity)}
                      className="text-neutral-500 hover:text-neutral-850 font-semibold underline text-[9px]"
                    >
                      {sortByProximity ? "Disable" : "Enable"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Nursery List Cards */}
        <div id="nurseries-listing-flow" className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
          {processedNurseries.length === 0 ? (
            <div className="text-center py-10 bg-white border border-neutral-150 rounded-2xl text-neutral-400 font-sans text-xs">
              No coordinating nurseries found matching those species tags.
            </div>
          ) : (
            processedNurseries.map(nursery => (
              <motion.button
                id={`nursery-list-item-${nursery.id}`}
                key={nursery.id}
                onClick={() => {
                  setSelectedNursery(nursery);
                  setSelectedSpeciesDetails(null);
                }}
                whileHover={{ x: 2 }}
                className={`w-full p-5 rounded-3xl border-2 text-left transition-all flex flex-col justify-between cursor-pointer space-y-3 ${
                  selectedNursery?.id === nursery.id 
                    ? 'bg-neutral-900 border-emerald-500/30 text-white shadow-lg' 
                    : 'bg-white border-neutral-150 text-neutral-700 hover:border-neutral-350'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-xl ${selectedNursery?.id === nursery.id ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-neutral-50 border border-neutral-150 text-neutral-400'}`}>
                      <Warehouse className="w-4 h-4" />
                    </div>
                    <div className="leading-tight">
                      <h3 className="font-serif font-black text-sm tracking-tight">{nursery.name}</h3>
                      <span className="text-[9px] font-mono uppercase tracking-wide opacity-80 block">Authorized Agro Corp Node</span>
                    </div>
                  </div>
                  <p className={`text-xs gap-1 font-sans ${selectedNursery?.id === nursery.id ? 'text-neutral-400' : 'text-neutral-550'}`}>
                    📍 {nursery.address}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono pt-2 border-t border-dashed border-neutral-150/10">
                  <span className={selectedNursery?.id === nursery.id ? 'text-emerald-300 font-bold' : 'text-neutral-550'}>
                    📦 Inventory: {nursery.availableSaplings.length} Native Lineages
                  </span>
                  {userLocation && (
                    <span className={`px-2 py-0.5 rounded-md font-extrabold ${selectedNursery?.id === nursery.id ? 'text-emerald-450 bg-neutral-950 font-mono text-[9px]' : 'text-emerald-800 bg-emerald-50 font-mono text-[9px]'}`}>
                      ⚡ {calculateDistance(userLocation.lat, userLocation.lng, nursery.latitude, nursery.longitude).toFixed(1)} km
                    </span>
                  )}
                </div>
              </motion.button>
            ))
          )}
        </div>
      </div>

      {/* Main Panel: High fidelity Stockholm Interactive Detail Page (Grid span 7) */}
      <div className="lg:col-span-7">
        {selectedNursery ? (
          <motion.div
            id="nursery-inventory-detail-panel"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-3xl bg-white border border-neutral-150 overflow-hidden shadow-md flex flex-col"
          >
            {/* Conservatory Photo Header element with dynamic details */}
            <div className="relative h-56 bg-neutral-950">
              <img 
                src={
                  selectedNursery.id === 'nursery_1' 
                    ? "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&q=80&w=800"
                    : selectedNursery.id === 'nursery_2'
                      ? "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&q=80&w=800"
                      : selectedNursery.id === 'nursery_3'
                        ? "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=800"
                        : "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&q=80&w=800"
                }
                alt="Greenhouse Saplings Conservatory"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover opacity-50 select-none pointer-events-none"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-300 font-extrabold block">PAKISTAN ALLIED RE-WILDING DEPO</span>
                <h2 className="text-2xl md:text-3xl font-serif font-black text-white leading-tight drop-shadow-sm">{selectedNursery.name}</h2>
                <p className="text-[11px] text-neutral-300 font-sans mt-1">Authorized supply partner supporting environmental restoration across institutions.</p>
              </div>
            </div>

            {/* Inner Content Area */}
            <div className="p-6 space-y-6">
              
              {/* Physical Location Finder with distance if location available */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-neutral-50 px-4 py-3.5 rounded-2xl border border-neutral-150 text-xs">
                <div className="flex items-start gap-2 max-w-md">
                  <span className="text-base text-emerald-600 mt-0.5">📍</span>
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-neutral-400 font-mono font-bold uppercase tracking-wider block">Physical Address & Coordinates</span>
                    <div className="text-neutral-700 font-sans leading-tight">{selectedNursery.address} ({selectedNursery.latitude}, {selectedNursery.longitude})</div>
                  </div>
                </div>
                {userLocation && (
                  <div className="bg-neutral-900 border border-neutral-800 text-white font-mono rounded-xl px-3.5 py-1.5 shrink-0 flex flex-col items-center">
                    <span className="text-[8px] uppercase text-neutral-400 font-extrabold block">Distance</span>
                    <span className="text-emerald-400 font-black text-xs">
                      {calculateDistance(userLocation.lat, userLocation.lng, selectedNursery.latitude, selectedNursery.longitude).toFixed(2)} km
                    </span>
                  </div>
                )}
              </div>
              
              {/* Coordinator contact buttons */}
              <div className="flex flex-wrap gap-4 items-center justify-between text-xs font-mono bg-neutral-50 p-4 rounded-xl border border-neutral-150">
                <div className="space-y-0.5">
                  <span className="text-[9px] text-neutral-400 uppercase tracking-wilder block font-extrabold">AUTHORIZED DEPOT LIAISON</span>
                  <div className="text-neutral-800 font-black text-sm">{selectedNursery.contactName}</div>
                </div>
                <div className="flex items-center gap-3">
                  <a 
                    id="nursery-liason-contact-btn"
                    href={`tel:${selectedNursery.contactPhone}`}
                    className="px-4 py-2.5 bg-neutral-900 border border-neutral-750 text-white hover:bg-neutral-850 active:bg-neutral-950 rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer text-[11px]"
                  >
                    <span className="text-sm">📞</span> {selectedNursery.contactPhone}
                  </a>
                </div>
              </div>

              {/* Sub Navigation Tabs for highly detailed pages */}
              <div className="flex border-b border-neutral-150 text-xs font-bold">
                {[
                  { id: 'inventory', label: '📦 Sapling Grains' },
                  { id: 'ecological_impact', label: '🌍 Soil & Heat Impact' },
                  { id: 'botany_school', label: '🎓 Student Botany Desk' }
                ].map(subTabOpt => (
                  <button
                    key={subTabOpt.id}
                    onClick={() => {
                      setActiveSubTab(subTabOpt.id as any);
                      setSelectedSpeciesDetails(null);
                    }}
                    className={`pb-2.5 px-4 mr-2 border-b-2 transition-all cursor-pointer ${
                      activeSubTab === subTabOpt.id 
                        ? 'border-emerald-600 text-emerald-700 font-black' 
                        : 'border-transparent text-neutral-400 hover:text-neutral-700'
                    }`}
                  >
                    {subTabOpt.label}
                  </button>
                ))}
              </div>

              {/* SUCCESS MESSAGING BANNER */}
              {successPickupMsg && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3.5 rounded-xl bg-emerald-50 border-2 border-emerald-300 text-emerald-850 font-sans text-xs flex items-center gap-2"
                >
                  <Check className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                  <span>{successPickupMsg}</span>
                </motion.div>
              )}

              {/* ACTIVE TAB ACTIONS */}
              
              {/* TAB 1: INVENTORY EXPLORER */}
              {activeSubTab === 'inventory' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs font-mono border-b border-neutral-100 pb-1.5">
                    <span className="text-neutral-400 font-bold uppercase tracking-wider">AVAILABLE NATIVE LINEAGES ({selectedNursery.availableSaplings.length})</span>
                    <span className="text-[10px] text-emerald-600 font-bold">Weekly cap: 120 sapling transfers</span>
                  </div>

                  <div id="nursery-inventory-grid" className="space-y-3">
                    {selectedNursery.availableSaplings.map((sap, index) => {
                      const diffColors = {
                        easy: 'bg-emerald-50 text-emerald-700 border-emerald-300',
                        moderate: 'bg-amber-50 text-amber-700 border-amber-300',
                        expert: 'bg-indigo-50 text-indigo-700 border-indigo-300'
                      };

                      return (
                        <div 
                          key={index}
                          className="p-4 rounded-2xl border border-neutral-150 bg-neutral-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:bg-neutral-50 hover:border-neutral-250 cursor-pointer"
                          onClick={() => setSelectedSpeciesDetails(sap)}
                        >
                          <div className="space-y-1.5 max-w-sm">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xl leading-none">{getSpeciesEmoji(sap.species)}</span>
                              <span className="font-serif font-black text-sm text-neutral-900">{sap.species}</span>
                              <span className={`px-2 py-0.5 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider border ${diffColors[sap.difficulty]}`}>
                                {sap.difficulty}
                              </span>
                            </div>
                            <p className="text-xs text-neutral-550 leading-relaxed font-sans line-clamp-2">{sap.description}</p>
                          </div>

                          <div className="flex items-center justify-between w-full md:w-auto gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-neutral-150/40 shrink-0">
                            <div className="font-mono text-left md:text-right">
                              <span className="text-[9px] text-neutral-400 block uppercase font-bold">STOCK AT HAND</span>
                              <span className="text-xs font-black text-neutral-800">{sap.count} sapling tubes</span>
                            </div>
                            <button
                              id={`btn-reserve-${selectedNursery.id}-${index}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRequestPickup(sap.species);
                              }}
                              className="px-3 py-2 bg-emerald-600 text-neutral-950 font-bold text-[11px] rounded-lg hover:bg-emerald-500 active:bg-emerald-750 transition-colors cursor-pointer shadow-sm ml-2"
                            >
                              Request
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 2: SOIL & HEAT IMPACT STATS */}
              {activeSubTab === 'ecological_impact' && (
                <div className="space-y-5">
                  <div className="p-4 bg-emerald-50/30 rounded-2xl border border-emerald-100 flex items-start gap-3">
                    <span className="text-2xl mt-0.5">🌲</span>
                    <div className="space-y-1 font-sans text-xs">
                      <h4 className="font-serif font-bold text-neutral-850">Certified Campus Micro-forest Multiplier</h4>
                      <p className="text-neutral-550 leading-relaxed">
                        By deploying saplings from this hub, you qualify for carbon indexing. Each sapling contains genetic lineages mapped to semi-arid subsoil profiles of Punjab.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-150 space-y-1 text-xs">
                      <span className="text-[9px] font-mono text-neutral-400 uppercase font-bold block">SOIL ACCREDITATION</span>
                      <strong className="text-neutral-800 block font-serif font-bold text-sm">Fine loam & sand companion</strong>
                      <p className="text-neutral-550 pt-1 text-[11px] leading-relaxed">Highly rich in nitrogen-bonding enzymes, optimizing early shoot formation with up to 30% less manual fertilizer demands.</p>
                    </div>
                    <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-150 space-y-1 text-xs">
                      <span className="text-[9px] font-mono text-neutral-400 uppercase font-bold block">HEAT MITIGATION LEVEL</span>
                      <strong className="text-neutral-800 block font-serif font-bold text-sm">High transpiration offset</strong>
                      <p className="text-neutral-550 pt-1 text-[11px] leading-relaxed">These broadleaf variants act as organic transpiration water cushions, cooling urban concrete surfaces by about 2-4°C on matured maturity.</p>
                    </div>
                  </div>

                  <div className="text-[11px] font-mono text-neutral-400 flex items-center justify-between p-3.5 bg-neutral-50 rounded-xl border border-neutral-150">
                    <span>GPS COORDINATE BLOCK:</span>
                    <strong>{selectedNursery.latitude}, {selectedNursery.longitude}</strong>
                  </div>
                </div>
              )}

              {/* TAB 3: STUDENT BOTANY DESK */}
              {activeSubTab === 'botany_school' && (
                <div className="space-y-5">
                  <span className="text-xs font-mono uppercase text-neutral-400 tracking-wider block font-bold">🎓 ACCORDANCE SPECIES BOTANY SCHOOL</span>
                  
                  <div className="space-y-3.5">
                    {selectedNursery.availableSaplings.map((sap, idx) => {
                      const data = getSpeciesScientificData(sap.species);
                      return (
                        <div key={idx} className="p-4 rounded-2xl bg-white border-2 border-neutral-150 hover:border-emerald-250 transition-colors space-y-3">
                          <div className="flex justify-between items-center bg-neutral-50 p-2.5 rounded-xl border border-neutral-150">
                            <div>
                              <span className="text-xs font-serif font-black text-neutral-800 block">{sap.species}</span>
                              <span className="text-[10px] italic font-mono text-emerald-700 font-semibold">{data.latName}</span>
                            </div>
                            <span className="text-2xl">{getSpeciesEmoji(sap.species)}</span>
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-[10.5px] font-sans leading-normal">
                            <div className="space-y-0.5">
                              <span className="text-neutral-400 font-mono text-[9px] uppercase tracking-wide block font-extrabold">📏 Recommended Spacing</span>
                              <span className="text-neutral-700 font-bold">{data.spacing}</span>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-neutral-400 font-mono text-[9px] uppercase tracking-wide block font-extrabold">🔆 Sunlight Factor</span>
                              <span className="text-neutral-700 font-bold">{data.sunlight}</span>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-neutral-400 font-mono text-[9px] uppercase tracking-wide block font-extrabold">💧 Watering Pattern</span>
                              <span className="text-neutral-700 font-bold">{data.aquatic}</span>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-neutral-400 font-mono text-[9px] uppercase tracking-wide block font-extrabold">💨 Carbon Lock Speed</span>
                              <span className="text-neutral-700 font-bold">{data.carbonRate}</span>
                            </div>
                          </div>

                          <div className="p-2.5 bg-emerald-500/5 rounded-xl text-[10px] text-neutral-600 leading-normal border border-emerald-500/10">
                            🐝 <strong className="text-neutral-800 font-bold">Biodiverse Value:</strong> {data.pollinatorAttraction}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* General Guidelines Note */}
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-150 text-[11px] font-sans text-neutral-550 flex items-start gap-2.5">
                <Info className="w-4.5 h-4.5 text-neutral-400 shrink-0" />
                <p className="leading-relaxed">
                  Campus Logistics coordinates dispatch vehicle slots on Friday afternoons. For deliveries exceeding 100 units, please specify your drive approval ID at least 48 hours prior to queue allocation.
                </p>
              </div>

            </div>
          </motion.div>
        ) : (
          <div className="rounded-3xl border border-neutral-150 p-16 text-center text-neutral-400 font-sans space-y-3 bg-white shadow-xs">
            <Warehouse className="w-10 h-10 text-neutral-300 mx-auto" />
            <p className="text-xs">Please select a conservatory hub from the sidebar list to inspect its seedling stock and request dispatch.</p>
          </div>
        )}
      </div>
    </div>
  );
}
