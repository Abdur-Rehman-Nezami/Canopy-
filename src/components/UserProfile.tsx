import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Award, Shield, DollarSign, Leaf, Heart, AlertCircle, CheckCircle } from 'lucide-react';
import { StudentUser, PlantationDrive, DonationRecord, BADGE_DETAILS } from '../types';

interface UserProfileProps {
  currentUser: StudentUser;
  drives: PlantationDrive[];
  onDonate: (donation: Omit<DonationRecord, 'id' | 'createdAt'>) => void;
}

export default function UserProfile({ currentUser, drives, onDonate }: UserProfileProps) {
  // Donor Form State
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [targetDriveId, setTargetDriveId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleDonateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorName || !donorEmail || !amountStr || !targetDriveId) {
      setErrorMsg('Please pre-fill all necessary donor parameters.');
      return;
    }

    const amount = Number(amountStr);
    if (isNaN(amount) || amount <= 0) {
      setErrorMsg('Donation amount must be a clean numeric digit above 0.');
      return;
    }

    // $10 spans 1 native sapling
    const trees = Math.floor(amount / 10);

    onDonate({
      donorName,
      donorEmail,
      amount,
      treesSponsored: trees,
      driveId: targetDriveId,
    });

    // Reset Form
    setDonorName('');
    setDonorEmail('');
    setAmountStr('');
    setSuccessMsg(`Heartfelt gratitude! Sponsoring $${amount} successfully loaded ${trees} native saplings onto the drive's ledger.`);
    setErrorMsg('');
    setTimeout(() => setSuccessMsg(''), 6000);
  };

  // Find user joined drives details
  const joinedDrivesDetails = drives.filter(d => currentUser.joinedDrives.includes(d.id));

  // Determine Canopy Growth Stage visually
  let growthStage = 'Sprout Seedling';
  let growthDesc = 'Begin volunteer drives to help your sprout emerge from the campus topsoil.';
  let growthImg = 'https://images.unsplash.com/photo-1515150144380-bca9f1650ed9?auto=format&fit=crop&q=80&w=300';
  
  if (currentUser.treesPlanted >= 150) {
    growthStage = 'Mighty Forest Banyan';
    growthDesc = 'Absolute Legend! Your roots stabilize the watershed, cooling urban zones.';
    growthImg = 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&q=80&w=300';
  } else if (currentUser.treesPlanted >= 100) {
    growthStage = 'Young Canopy Oak';
    growthDesc = 'Stunning progress! Your broad branches begin harboring songbirds and cooling streets.';
    growthImg = 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=300';
  } else if (currentUser.treesPlanted >= 50) {
    growthStage = 'Ecology Sapling';
    growthDesc = 'Steward level! Your plant roots are actively interlocking and absorbing rainfall.';
    growthImg = 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?auto=format&fit=crop&q=80&w=300';
  }

  return (
    <div id="user-profile-root" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Profile Sidebar Block */}
      <div className="lg:col-span-5 space-y-6">
        <div className="p-6 rounded-3xl bg-white border border-neutral-150 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center justify-center font-serif font-black text-2xl">
                {currentUser.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono uppercase text-emerald-600 tracking-wider font-extrabold animate-pulse">CAMPUS LEAF MEMBER</span>
                <h2 className="text-xl font-serif font-black text-neutral-850 leading-tight">{currentUser.name}</h2>
                <span className="text-xs font-mono text-neutral-400 block">{currentUser.email}</span>
              </div>
            </div>

            {/* Contribution stats logs */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-100">
              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-150">
                <span className="text-[9px] font-mono uppercase text-neutral-400 font-bold block">TREES PLACED</span>
                <span id="user-trees-planted" className="text-lg font-mono font-black text-neutral-850">{currentUser.treesPlanted} saplings</span>
              </div>
              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-150">
                <span className="text-[9px] font-mono uppercase text-neutral-400 font-bold block">LAB TIME VOLUNTEERED</span>
                <span id="user-volunteer-hours" className="text-lg font-mono font-black text-neutral-850">{currentUser.volunteerHours} hours</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-neutral-100 text-[10px] font-mono text-neutral-450 flex justify-between">
            <span>MEMBER ID: {currentUser.userId}</span>
            <span>INDUCTED: {new Date(currentUser.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Dynamic visual Sapling Growth Tracker card */}
        <div className="p-6 rounded-3xl bg-white border border-neutral-150 shadow-sm space-y-4">
          <div className="flex items-center gap-1.5 font-serif font-bold text-sm text-neutral-800">
            <Leaf className="w-4.5 h-4.5 text-emerald-500" />
            <h3>Stewardship Canopy Progress</h3>
          </div>
          
          <div className="rounded-2xl border border-neutral-150 overflow-hidden bg-neutral-50 flex items-center">
            <div className="w-24 h-24 shrink-0 bg-neutral-200">
              <img 
                src={growthImg} 
                alt={growthStage} 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-3.5 space-y-1">
              <span className="text-[10px] uppercase font-mono font-bold text-emerald-700 block tracking-wider">STAGE: {growthStage}</span>
              <p className="text-[11px] text-neutral-500 font-sans leading-relaxed">{growthDesc}</p>
            </div>
          </div>
        </div>

        {/* Bio Achievements & earned badges */}
        <div className="p-6 rounded-3xl bg-white border border-neutral-150 shadow-sm space-y-4">
          <div className="flex items-center gap-1.5 font-serif font-bold text-sm text-neutral-800">
            <Award className="w-4.5 h-4.5 text-amber-500" />
            <h3>Badges & Credentials ({currentUser.badges.length})</h3>
          </div>

          <div className="space-y-3">
            {currentUser.badges.map(badgeId => {
              const b = BADGE_DETAILS[badgeId];
              if (!b) return null;

              return (
                <div 
                  key={badgeId}
                  className="p-3 rounded-xl border border-neutral-100 bg-neutral-50/40 flex items-start gap-3 transition-colors hover:bg-neutral-100"
                >
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${b.color} text-white shadow-sm`}>
                    <Shield className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-xs font-sans font-bold text-neutral-800 block leading-tight">{b.title}</span>
                    <p className="text-[10px] text-neutral-500 leading-relaxed font-sans">{b.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Donor Hub / Sponsor Portal */}
      <div className="lg:col-span-7 space-y-6">
        <div className="p-6 rounded-2xl bg-white border border-neutral-150 shadow-sm space-y-6">
          <div className="space-y-1 pb-4 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
              <h2 className="text-xl font-sans font-bold text-neutral-800">Environmental Sponsor Hub</h2>
            </div>
            <p className="text-xs text-neutral-500 font-sans">
              Support student-led environmental restoration drives. Coordinate sapling delivery and supplies. Let’s expand the canopy!
            </p>
          </div>

          {successMsg && (
            <div className="p-4 bg-emerald-50 rounded-xl text-emerald-800 text-xs border border-emerald-100 flex items-center gap-2 font-mono">
              <CheckCircle className="w-4.5 h-4.5 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 bg-rose-50 rounded-xl text-rose-700 text-xs border border-rose-100 flex items-center gap-2 font-mono">
              <AlertCircle className="w-4.5 h-4.5 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleDonateSubmit} className="space-y-4 font-sans text-neutral-700 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-mono uppercase tracking-wider text-neutral-500">Donor / Sponsor Name *</label>
                <input
                  id="form-sponsor-name"
                  type="text"
                  required
                  placeholder="e.g. Alumnus Club / Jane Doe"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono uppercase tracking-wider text-neutral-500">Contact Email *</label>
                <input
                  id="form-sponsor-email"
                  type="email"
                  required
                  placeholder="e.g. sponsor@green.org"
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-mono uppercase tracking-wider text-neutral-500">Monetary Donation Amount (USD) *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <DollarSign className="w-4 h-4" />
                  </span>
                  <input
                    id="form-sponsor-amount"
                    type="number"
                    min={5}
                    max={100000}
                    required
                    placeholder="250"
                    value={amountStr}
                    onChange={(e) => setAmountStr(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-sm focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono uppercase tracking-wider text-neutral-500">Target Plantation Drive *</label>
                <select
                  id="form-sponsor-drive"
                  required
                  value={targetDriveId}
                  onChange={(e) => setTargetDriveId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-sm focus:outline-none"
                >
                  <option value="">-- Choose Campaign to Fund --</option>
                  {drives.filter(d => d.status !== 'completed').map(d => (
                    <option key={d.id} value={d.id}>
                      {d.title} (Target: {d.targetTrees} trees)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-150 flex items-center justify-between text-xs font-mono text-neutral-500">
              <span>Sponsorship Rule:</span>
              <span className="text-emerald-700 font-bold">$10.00 directly purchases 1 native sapling</span>
            </div>

            <button
              id="submit-donor-fund-btn"
              type="submit"
              className="w-full py-3 bg-neutral-900 border border-neutral-850 hover:bg-neutral-805 text-white font-sans font-bold rounded-xl shadow transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <DollarSign className="w-4 h-4" /> Fund Restoration Saplings
            </button>
          </form>
        </div>

        {/* User volunteering history */}
        <div id="joined-drives-history" className="p-6 rounded-2xl bg-white border border-neutral-150 shadow-sm space-y-4">
          <div className="flex items-center gap-1.5 font-bold font-sans text-sm text-neutral-800">
            <Leaf className="w-4.5 h-4.5 text-emerald-500" />
            <h3>Your Registered Volunteering Initiatives</h3>
          </div>

          {joinedDrivesDetails.length === 0 ? (
            <div className="text-center py-6 text-neutral-400 text-xs font-sans">
              You haven't joined any active plantation drives yet. Jump onto the Dashboard to register and volunteer.
            </div>
          ) : (
            <div className="space-y-3">
              {joinedDrivesDetails.map(d => (
                <div 
                  key={d.id}
                  className="p-4 rounded-xl border border-neutral-100 bg-neutral-50/50 flex justify-between items-center"
                >
                  <div className="space-y-1">
                    <span className="font-sans font-bold text-sm text-neutral-800">{d.title}</span>
                    <span className="text-xs text-neutral-400 block font-mono">📍 {d.locationName}</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-md font-mono text-[10px] uppercase font-bold border ${
                    d.status === 'completed' 
                      ? 'bg-neutral-100 text-neutral-500 border-neutral-200' 
                      : d.status === 'active' 
                        ? 'bg-teal-50 text-teal-700 border-teal-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {d.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
