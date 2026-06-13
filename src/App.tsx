import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Leaf, MapPin, Trophy, Warehouse, User, Heart, AlertCircle, Sparkles, LogIn, Compass } from 'lucide-react';

import { 
  StudentUser, 
  PlantationDrive, 
  PlantationNeedSpot, 
  DonationRecord, 
  NurseryData,
  SEED_USERS, 
  SEED_DRIVES, 
  SEED_NEEDS, 
  SEED_NURSERIES,
  TEAMS_LEADERBOARD,
  LeaderboardTeam
} from './types';

import Dashboard from './components/Dashboard';
import PlantationMap from './components/PlantationMap';
import Leaderboard from './components/Leaderboard';
import NurseryDirectory from './components/NurseryDirectory';
import UserProfile from './components/UserProfile';

type TabType = 'dashboard' | 'map' | 'leaderboard' | 'nurseries' | 'profile';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [systemAlert, setSystemAlert] = useState<{ type: 'success' | 'info'; text: string } | null>(null);

  const [dbSyncStatus, setDbSyncStatus] = useState<'connecting' | 'synced' | 'error'>('connecting');

  // Core Platform States (Initialized from cache then loaded from MongoDB)
  const [currentUser, setCurrentUser] = useState<StudentUser>(() => {
    const cached = localStorage.getItem('plantation_user');
    return cached ? JSON.parse(cached) : SEED_USERS[0];
  });
  const [drives, setDrives] = useState<PlantationDrive[]>(() => {
    const cached = localStorage.getItem('plantation_drives');
    return cached ? JSON.parse(cached) : SEED_DRIVES;
  });
  const [needs, setNeeds] = useState<PlantationNeedSpot[]>(() => {
    const cached = localStorage.getItem('plantation_needs');
    return cached ? JSON.parse(cached) : SEED_NEEDS;
  });
  const [nurseries] = useState<NurseryData[]>(SEED_NURSERIES);
  const [donations, setDonations] = useState<DonationRecord[]>(() => {
    const cached = localStorage.getItem('plantation_donations');
    return cached ? JSON.parse(cached) : [];
  });
  const [teams, setTeams] = useState<LeaderboardTeam[]>(() => {
    const cached = localStorage.getItem('plantation_teams');
    return cached ? JSON.parse(cached) : TEAMS_LEADERBOARD;
  });

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isDetectingLoc, setIsDetectingLoc] = useState(false);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      showToast('info', 'Geolocation is not supported by your browser');
      return;
    }
    setIsDetectingLoc(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setIsDetectingLoc(false);
        showToast('success', `Coordinates detected: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      },
      (error) => {
        setIsDetectingLoc(false);
        console.warn('Geolocation acquisition error:', error);
        // Fallback to Lahore Center
        const fallbackLahore = { lat: 31.5204, lng: 74.3587 };
        setUserLocation(fallbackLahore);
        showToast('info', 'Using Lahore Central as location reference (access blocked/timed out)');
      },
      { timeout: 8000 }
    );
  };

  // Fetch full state from MongoDB Atlas on initialization
  useEffect(() => {
    const loadStateFromDb = async () => {
      try {
        setDbSyncStatus('connecting');
        const res = await fetch('/api/state?userId=student_1');
        if (!res.ok) throw new Error('Database server returned error status');
        const data = await res.json();
        
        // Self-corrective check if dataset was Bangalore-centric (e.g. custom check of user email or location)
        // If we locate old user name, we command an instant refresh reset!
        if (data.currentUser && (data.currentUser.name === 'Siddharth Sharma' || !data.teams || data.teams.length === 0)) {
          console.log('Detected obsolete mock data references. Dispatching automatic database reset synchronization...');
          const resetRes = await fetch('/api/reset', { method: 'POST' });
          if (resetRes.ok) {
            window.location.reload();
            return;
          }
        }

        if (data.currentUser) setCurrentUser(data.currentUser);
        if (data.drives) setDrives(data.drives);
        if (data.needs) setNeeds(data.needs);
        if (data.donations) setDonations(data.donations);
        if (data.teams) setTeams(data.teams);
        
        setDbSyncStatus('synced');
      } catch (err) {
        console.warn('MongoDB sync initial warning (using local fallback state):', err);
        setDbSyncStatus('error');
      }
    };
    loadStateFromDb();
  }, []);

  // Save changes locally and sync automatically to MongoDB Atlas
  const saveState = async (
    updatedUser: StudentUser, 
    updatedDrives: PlantationDrive[], 
    updatedNeeds: PlantationNeedSpot[], 
    updatedDonations: DonationRecord[],
    updatedTeams: LeaderboardTeam[] = teams
  ) => {
    setCurrentUser(updatedUser);
    setDrives(updatedDrives);
    setNeeds(updatedNeeds);
    setDonations(updatedDonations);
    setTeams(updatedTeams);

    localStorage.setItem('plantation_user', JSON.stringify(updatedUser));
    localStorage.setItem('plantation_drives', JSON.stringify(updatedDrives));
    localStorage.setItem('plantation_needs', JSON.stringify(updatedNeeds));
    localStorage.setItem('plantation_donations', JSON.stringify(updatedDonations));
    localStorage.setItem('plantation_teams', JSON.stringify(updatedTeams));

    try {
      setDbSyncStatus('connecting');
      const res = await fetch('/api/state', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentUser: updatedUser,
          drives: updatedDrives,
          needs: updatedNeeds,
          donations: updatedDonations,
          teams: updatedTeams
        })
      });
      if (!res.ok) throw new Error('Failed to update state on remote server');
      setDbSyncStatus('synced');
    } catch (err) {
      console.error('Failed to sync to MongoDB Atlas:', err);
      setDbSyncStatus('error');
    }
  };

  // Helper to determine team from student login (e.g. PU vs LUMS)
  const getAssociatedTeamId = (userId: string) => {
    if (userId === 'student_2') return 't2';
    return 't1'; // default to Punjab University
  };

  // Unified persistent State handlers
  const handleJoinDrive = async (driveId: string) => {
    if (currentUser.joinedDrives.includes(driveId)) return;

    const newVolHours = currentUser.volunteerHours + 4;
    const newTreesPlanted = currentUser.treesPlanted + 10;
    const newJoinedDrives = [...currentUser.joinedDrives, driveId];
    
    const currentBadges = [...currentUser.badges];
    if (newTreesPlanted >= 150 && !currentBadges.includes('forest-founder')) {
      currentBadges.push('forest-founder');
    }
    if (newVolHours >= 40 && !currentBadges.includes('sapling-savior')) {
      currentBadges.push('sapling-savior');
    }

    const updatedUser: StudentUser = {
      ...currentUser,
      joinedDrives: newJoinedDrives,
      volunteerHours: newVolHours,
      treesPlanted: newTreesPlanted,
      badges: currentBadges
    };

    const updatedDrives = drives.map(d => {
      if (d.id === driveId) {
        return {
          ...d,
          volunteerIds: [...d.volunteerIds, currentUser.userId],
          plantedTrees: d.plantedTrees + 10
        };
      }
      return d;
    });

    const teamId = getAssociatedTeamId(currentUser.userId);
    const updatedTeams = teams.map(t => {
      if (t.id === teamId) {
        return {
          ...t,
          treesPlanted: t.treesPlanted + 10,
          score: t.score + 300 // (10 planted * 10 score) + (4 * 50 volunteer)
        };
      }
      return t;
    });
    
    saveState(updatedUser, updatedDrives, needs, donations, updatedTeams);
    showToast('success', "Hurrah! You have volunteered for the drive. Check your badge awards!");
  };

  const handleCreateDrive = async (newDriveData: Omit<PlantationDrive, 'id' | 'plantedTrees' | 'volunteerIds' | 'fundsRaised' | 'createdAt' | 'creatorName'>) => {
    const newDriveId = `drive_${Date.now()}`;
    const newDrive: PlantationDrive = {
      ...newDriveData,
      id: newDriveId,
      creatorName: currentUser.name,
      plantedTrees: 0,
      volunteerIds: [currentUser.userId],
      fundsRaised: 0,
      createdAt: new Date().toISOString()
    };

    const updatedUser: StudentUser = {
      ...currentUser,
      joinedDrives: [...currentUser.joinedDrives, newDriveId],
      volunteerHours: currentUser.volunteerHours + 6
    };

    const updatedDrives = [newDrive, ...drives];

    const teamId = getAssociatedTeamId(currentUser.userId);
    const updatedTeams = teams.map(t => {
      if (t.id === teamId) {
        return {
          ...t,
          score: t.score + 300 // 6 hours * 50
        };
      }
      return t;
    });

    saveState(updatedUser, updatedDrives, needs, donations, updatedTeams);
    showToast('success', `Campaign "${newDriveData.title}" started successfully! Coordinate seeds and saplings via map pins.`);
  };

  const handleReportNeed = async (newNeedData: Omit<PlantationNeedSpot, 'id' | 'reportedBy' | 'reporterName' | 'createdAt'>) => {
    const newNeedId = `need_${Date.now()}`;
    const newNeed: PlantationNeedSpot = {
      ...newNeedData,
      id: newNeedId,
      reportedBy: currentUser.userId,
      reporterName: currentUser.name,
      createdAt: new Date().toISOString()
    };

    const currentBadges = [...currentUser.badges];
    if (!currentBadges.includes('seed-sower')) {
      currentBadges.push('seed-sower');
    }

    const updatedUser: StudentUser = {
      ...currentUser,
      volunteerHours: currentUser.volunteerHours + 2,
      badges: currentBadges
    };

    const updatedNeeds = [newNeed, ...needs];

    const teamId = getAssociatedTeamId(currentUser.userId);
    const updatedTeams = teams.map(t => {
      if (t.id === teamId) {
        return {
          ...t,
          score: t.score + 200 // 100 for spot + 2 * 50 volunteer hours
        };
      }
      return t;
    });

    saveState(updatedUser, drives, updatedNeeds, donations, updatedTeams);
    showToast('success', `Plantation deficit spot reported successfully! Grid point coordinates registered.`);
  };

  const handleDonate = async (newDonationData: Omit<DonationRecord, 'id' | 'createdAt'>) => {
    const donationId = `don_${Date.now()}`;
    const newDonation: DonationRecord = {
      ...newDonationData,
      id: donationId,
      createdAt: new Date().toISOString()
    };

    const updatedUser: StudentUser = {
      ...currentUser,
      treesPlanted: currentUser.treesPlanted + newDonationData.treesSponsored
    };

    const updatedDonations = [newDonation, ...donations];
    const updatedDrives = drives.map(d => {
      if (d.id === newDonationData.driveId) {
        return {
          ...d,
          fundsRaised: d.fundsRaised + newDonationData.amount,
          plantedTrees: d.plantedTrees + newDonationData.treesSponsored
        };
      }
      return d;
    });

    const teamId = getAssociatedTeamId(currentUser.userId);
    const updatedTeams = teams.map(t => {
      if (t.id === teamId) {
        const addedTrees = newDonationData.treesSponsored;
        return {
          ...t,
          treesPlanted: t.treesPlanted + addedTrees,
          score: t.score + (addedTrees * 10) + Math.round(newDonationData.amount * 2)
        };
      }
      return t;
    });

    saveState(updatedUser, updatedDrives, needs, updatedDonations, updatedTeams);
    showToast('success', `Heartfelt thanks, ${newDonationData.donorName}! Supported $${newDonationData.amount} for environmental canopy distribution.`);
  };

  const showToast = (type: 'success' | 'info', text: string) => {
    setSystemAlert({ type, text });
    setTimeout(() => {
      setSystemAlert(null);
    }, 5000);
  };

  return (
    <div id="app-viewport-wrapper" className="min-h-screen relative bg-gradient-to-b from-[#FAFBF9] via-[#F4F6F1] to-[#EAEDE6] text-neutral-900 font-sans antialiased flex flex-col justify-between selection:bg-emerald-100 selection:text-emerald-900 pr-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)]">
      
      {/* Pristine ambient background botanical illustration overlay */}
      <img 
        id="app-botanical-ambient-bg"
        src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1920&auto=format&fit=crop"
        alt="Ambient Botanical Background"
        referrerPolicy="no-referrer"
        className="fixed inset-0 w-full h-full object-cover pointer-events-none z-0 opacity-[0.12] select-none filter blur-[1px]"
        aria-hidden="true"
      />
      
      {/* Header element */}
      <header id="platform-main-header" className="sticky top-0 z-40 bg-neutral-50/85 backdrop-blur-md border-b border-neutral-150">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Logo brand */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-sm flex items-center justify-center">
              <Leaf className="w-5 h-5" />
            </div>
            <div className="space-y-0 text-left">
              <span id="brand-title" className="text-xl font-serif font-black tracking-tight text-emerald-500 block">KARAM</span>
              <span className="text-[9px] font-mono text-[#8E9275] block tracking-widest font-semibold">GREEN PROGRAM</span>
            </div>
          </div>

          {/* Navigation layout */}
          <nav id="header-nav-toolbar" className="hidden md:flex items-center gap-1">
            {[
              { id: 'dashboard' as const, label: 'Explore Drives', icon: Compass },
              { id: 'map' as const, label: 'Coord Map', icon: MapPin },
              { id: 'leaderboard' as const, label: 'Leaderboard', icon: Trophy },
              { id: 'nurseries' as const, label: 'Nursery Hubs', icon: Warehouse }
            ].map(tab => {
              const IconComp = tab.icon;
              return (
                <button
                  id={`nav-link-${tab.id}`}
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold font-sans transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === tab.id 
                      ? 'bg-neutral-900 text-white' 
                      : 'text-neutral-500 hover:text-neutral-850 hover:bg-neutral-50'
                  }`}
                >
                  <IconComp className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Header: Profile badge and indicator */}
          <div className="flex items-center gap-3">
            <button
              id="avatar-navigation-trigger"
              onClick={() => setActiveTab('profile')}
              className={`p-1.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'profile' 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                  : 'bg-neutral-50 border-neutral-150 text-neutral-600 hover:border-neutral-300'
              }`}
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-500 text-neutral-950 font-sans font-bold text-xs flex items-center justify-center">
                {currentUser.name.split(' ').map(n => n[0]).join('')}
              </div>
              <span className="text-xs font-sans font-bold hidden sm:inline-block pr-1 truncate max-w-28">{currentUser.name.split(' ')[0]}</span>
            </button>

            <button
              id="header-reset-btn"
              onClick={async () => {
                localStorage.removeItem('plantation_user');
                localStorage.removeItem('plantation_drives');
                localStorage.removeItem('plantation_needs');
                localStorage.removeItem('plantation_donations');
                
                try {
                  await fetch('/api/reset', { method: 'POST' });
                } catch (e) {
                  console.warn('Backend reset connection failed:', e);
                }
                
                showToast('info', 'Database and Sandbox cleared successfully. Reloading...');
                setTimeout(() => window.location.reload(), 1200);
              }}
              className="text-[10px] font-mono font-bold text-neutral-500 hover:text-red-700 border border-neutral-200 hover:bg-red-50 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer"
            >
              Reset Data
            </button>
          </div>
        </div>
      </header>

      {/* Persistent System Banner Toast Alerts */}
      <AnimatePresence>
        {systemAlert && (
          <motion.div
            id="system-top-toast"
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -45, scale: 0.95 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4"
          >
            <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 text-white shadow-2xl flex items-start gap-3">
              <div className="p-1 rounded bg-emerald-500/10 text-emerald-400 mt-0.5">
                <Sparkles className="w-4 h-4 animate-spin-slow" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-bold">Campus Coordination Log</span>
                <p className="text-xs font-sans text-neutral-300 font-medium leading-relaxed">{systemAlert.text}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {activeTab === 'dashboard' && (
              <Dashboard 
                drives={drives} 
                nurseries={nurseries} 
                currentUser={currentUser}
                onJoinDrive={handleJoinDrive}
                onCreateDrive={handleCreateDrive}
              />
            )}
            {activeTab === 'map' && (
              <PlantationMap 
                drives={drives} 
                needs={needs} 
                currentUser={currentUser}
                onReportNeed={handleReportNeed}
                userLocation={userLocation}
                onDetectLocation={handleDetectLocation}
                isDetectingLoc={isDetectingLoc}
              />
            )}
            {activeTab === 'leaderboard' && (
              <Leaderboard teams={teams} />
            )}
            {activeTab === 'nurseries' && (
              <NurseryDirectory 
                nurseries={nurseries} 
                userLocation={userLocation}
                onDetectLocation={handleDetectLocation}
                isDetectingLoc={isDetectingLoc}
              />
            )}
            {activeTab === 'profile' && (
              <UserProfile 
                currentUser={currentUser} 
                drives={drives}
                onDonate={handleDonate}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer Element */}
      <footer id="platform-main-footer" className="bg-neutral-950 text-neutral-500 border-t border-neutral-900/50 mt-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            
            {/* Logo brand footer */}
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Leaf className="w-4 h-4" />
              </div>
              <span className="text-xs font-mono tracking-wider font-extrabold uppercase text-neutral-300">KARAM Green Program</span>
            </div>

            {/* Bottom mini tabs navigation */}
            <div className="flex flex-wrap justify-center gap-6 font-sans text-xs">
              <button onClick={() => setActiveTab('dashboard')} className="hover:text-white transition-colors cursor-pointer">Explore Drives</button>
              <button onClick={() => setActiveTab('map')} className="hover:text-white transition-colors cursor-pointer">Plantation Map</button>
              <button onClick={() => setActiveTab('leaderboard')} className="hover:text-white transition-colors cursor-pointer">Score Leaderboards</button>
              <button onClick={() => setActiveTab('nurseries')} className="hover:text-white transition-colors cursor-pointer">Nursery Warehouses</button>
              <button onClick={() => setActiveTab('profile')} className="hover:text-white transition-colors cursor-pointer">Sponsor Registry</button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between text-[10px] font-mono border-t border-neutral-900 pt-6">
            <p>&copy; 2026 Student Plantation & Eco-Restoration drive registry. Distributed Open Workspace.</p>
            <p className="flex items-center gap-1.5 mt-2 md:mt-0">
              ⚡ Database:
              {dbSyncStatus === 'connecting' && (
                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase font-bold font-mono animate-pulse">
                  Syncing MongoDB...
                </span>
              )}
              {dbSyncStatus === 'synced' && (
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 uppercase font-bold font-mono">
                  MongoDB Connected
                </span>
              )}
              {dbSyncStatus === 'error' && (
                <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 uppercase font-bold font-mono">
                  Offline Fallback
                </span>
              )}
            </p>
          </div>
        </div>
      </footer>

      {/* Multi-screen navigation for touch viewports */}
      <div id="mobile-viewport-floating-nav" className="md:hidden fixed bottom-4 inset-x-4 z-40 bg-white border border-neutral-200/80 shadow-2xl rounded-2xl p-2 flex items-center justify-around">
        {[
          { id: 'dashboard' as const, label: 'Explore', icon: Compass },
          { id: 'map' as const, label: 'Map', icon: MapPin },
          { id: 'leaderboard' as const, label: 'Scores', icon: Trophy },
          { id: 'nurseries' as const, label: 'Nursery', icon: Warehouse },
          { id: 'profile' as const, label: 'Profile', icon: User }
        ].map(tab => {
          const IconComp = tab.icon;
          return (
            <button
              id={`mob-nav-${tab.id}`}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`p-2.5 rounded-xl transition-all flex flex-col items-center gap-1 cursor-pointer ${
                activeTab === tab.id 
                  ? 'bg-neutral-900 text-white' 
                  : 'text-neutral-400 hover:text-neutral-700'
              }`}
            >
              <IconComp className="w-4 h-4" />
              <span className="text-[9px] font-bold tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
