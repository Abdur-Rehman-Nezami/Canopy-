import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, Flame, Star, Sparkles, Building, Hash, Zap, HelpCircle, ArrowRight, Award } from 'lucide-react';
import { TEAMS_LEADERBOARD, LeaderboardTeam } from '../types';

interface LeaderboardProps {
  teams?: LeaderboardTeam[];
}

export default function Leaderboard({ teams }: LeaderboardProps) {
  // Define team listing
  const sortedTeams = [...(teams || TEAMS_LEADERBOARD)].sort((a, b) => b.score - a.score);

  // Dynamic Simulator State
  const [simTrees, setSimTrees] = useState(25);
  const [simHours, setSimHours] = useState(10);
  const [simNeeds, setSimNeeds] = useState(2);

  const estimatedScore = (simTrees * 10) + (simHours * 50) + (simNeeds * 100);

  return (
    <div id="leaderboard-root" className="space-y-10">
      {/* Top 3 Podiums Visual Card with elevated aesthetics */}
      <div id="leaderboard-podium-banner" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sortedTeams.slice(0, 3).map((team, idx) => {
          const rankColors = [
            'bg-gradient-to-br from-amber-50 to-amber-100/50 text-amber-900 border-amber-300 ring-amber-500/10 shadow-amber-100/50',
            'bg-gradient-to-br from-neutral-50 to-neutral-100/50 text-neutral-900 border-neutral-300 ring-neutral-400/10 shadow-neutral-100/50',
            'bg-gradient-to-br from-orange-50 to-orange-100/30 text-amber-950 border-orange-200 ring-orange-500/5 shadow-orange-50'
          ];
          const badgeTexts = ['🏆 1st Champion', '🥈 2nd Contender', '🥉 3rd Steward'];
          
          return (
            <motion.div
              id={`team-podium-card-${team.id}`}
              key={team.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className={`p-6 rounded-3xl bg-white border shadow-md ring-4 relative overflow-hidden flex flex-col justify-between ${rankColors[idx]}`}
            >
              <div className="absolute top-0 right-0 bg-neutral-900 text-white font-mono text-[10px] uppercase font-bold py-1.5 px-4.5 rounded-bl-2xl">
                Rank #{idx + 1}
              </div>

              <div className="space-y-3">
                <span className="text-[10px] font-mono tracking-widest uppercase font-extrabold text-neutral-500 block">
                  {badgeTexts[idx]}
                </span>
                <div>
                  <h3 className="text-xl font-serif font-black text-neutral-900 tracking-tight leading-tight">{team.name}</h3>
                  <p className="text-xs font-sans text-neutral-550 flex items-center gap-1 mt-1">
                    <Building className="w-3.5 h-3.5 text-neutral-400" /> {team.institution}
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-neutral-250/30 flex items-center justify-between font-mono">
                <div>
                  <span className="text-[9px] text-neutral-400 block uppercase font-bold">Trees Planted</span>
                  <span className="text-base font-extrabold text-neutral-850">{team.treesPlanted} Units</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-neutral-400 block uppercase font-bold">Eco Score</span>
                  <span className="text-base font-extrabold text-emerald-800 flex items-center gap-1.5 justify-end">
                    <Star className="w-4 h-4 text-orange-500 fill-orange-500" /> {team.score}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Full Leaderboard Table List */}
      <div className="rounded-3xl bg-white border border-neutral-150 p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h3 className="font-serif font-bold text-lg text-neutral-800">Ecology Organization Registry</h3>
          </div>
          <span className="text-[11px] font-mono text-neutral-400">Score updates dynamically after every session</span>
        </div>

        <div className="overflow-x-auto">
          <table id="leaderboard-table" className="w-full text-left border-collapse font-sans text-sm text-neutral-700">
            <thead>
              <tr className="border-b border-neutral-100 font-mono text-[10px] text-neutral-400 uppercase tracking-widest bg-neutral-50/50">
                <th className="py-3.5 px-4 font-bold rounded-l-2xl">Rank</th>
                <th className="py-3.5 px-4 font-bold">Volunteering Student Group / Club</th>
                <th className="py-3.5 px-4 font-bold">Institution</th>
                <th className="py-3.5 px-4 font-bold text-center">Active Peers</th>
                <th className="py-3.5 px-4 font-bold text-right">Trees Planted</th>
                <th className="py-3.5 px-4 font-bold text-right rounded-r-2xl">Eco Rating Score</th>
              </tr>
            </thead>
            <tbody>
              {sortedTeams.map((team, index) => (
                <tr 
                  id={`table-row-team-${team.id}`}
                  key={team.id} 
                  className={`border-b border-neutral-100/50 hover:bg-neutral-50/50 transition-colors ${
                    index === 0 ? 'bg-amber-500/5' : ''
                  }`}
                >
                  <td className="py-4 px-4 font-mono font-semibold">
                    <div className="flex items-center gap-1.5">
                      <Hash className="w-3 h-3 text-neutral-350" />
                      <span className={index < 3 ? 'font-bold text-emerald-800' : 'text-neutral-600'}>{index + 1}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-sans font-black text-neutral-800 block">{team.name}</span>
                  </td>
                  <td className="py-4 px-4 text-neutral-500 font-sans">
                    <span>{team.institution}</span>
                  </td>
                  <td className="py-4 px-4 text-center font-mono text-neutral-600 text-xs">
                    {team.membersCount} students
                  </td>
                  <td className="py-4 px-4 text-right font-mono font-black text-emerald-700">
                    {team.treesPlanted}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="font-mono font-extrabold text-neutral-850 flex items-center justify-end gap-1.5">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>{team.score}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* NEW: Interactive Eco Impact Score Estimator Simulator */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="p-6 rounded-3xl bg-neutral-950 border border-neutral-900 text-white shadow-xl space-y-6 relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-1.5">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-emerald-500/20 text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
            ECO SIMULATOR TOOL
          </span>
          <h3 className="text-xl font-serif font-black tracking-tight text-white">Stewardship Impact Simulator</h3>
          <p className="text-xs text-neutral-400 font-sans leading-relaxed">
            See how planting native species, volunteering hours, and coordinates declared on the Restoration Map increase your overall student leaderboard rating index.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
          {/* Inputs Section */}
          <div className="lg:col-span-7 space-y-5 text-sm font-sans font-medium text-neutral-300">
            {/* Range slider 1: Trees */}
            <div className="space-y-2">
              <div className="flex justify-between font-mono text-xs">
                <span>🌱 Native Trees Sown (+10 PTS/UNIT)</span>
                <span className="text-emerald-400 font-bold">{simTrees} saplings</span>
              </div>
              <input 
                type="range" 
                min={0} 
                max={150} 
                value={simTrees}
                onChange={(e) => setSimTrees(Number(e.target.value))}
                className="w-full accent-emerald-500 h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-ew-resize"
              />
            </div>

            {/* Range slider 2: Volunteer Hours */}
            <div className="space-y-2">
              <div className="flex justify-between font-mono text-xs">
                <span>⏰ Site Lab Volunteering Hours (+50 PTS/HR)</span>
                <span className="text-emerald-400 font-bold">{simHours} hours</span>
              </div>
              <input 
                type="range" 
                min={0} 
                max={40} 
                value={simHours}
                onChange={(e) => setSimHours(Number(e.target.value))}
                className="w-full accent-emerald-500 h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-ew-resize"
              />
            </div>

            {/* Range slider 3: Spots Identified */}
            <div className="space-y-2">
              <div className="flex justify-between font-mono text-xs">
                <span>⚠️ Canopy Deficit Coords Catalogued (+100 PTS/SPOT)</span>
                <span className="text-emerald-400 font-bold">{simNeeds} coordinate zones</span>
              </div>
              <input 
                type="range" 
                min={0} 
                max={10} 
                value={simNeeds}
                onChange={(e) => setSimNeeds(Number(e.target.value))}
                className="w-full accent-emerald-500 h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-ew-resize"
              />
            </div>
          </div>

          {/* Output Display Card */}
          <div className="lg:col-span-5 p-6 rounded-2xl bg-neutral-900 border border-neutral-800 text-center flex flex-col justify-center items-center space-y-3 shadow-inner">
            <span className="text-[10px] font-mono text-neutral-450 uppercase tracking-widest font-bold">ESTIMATED TEAM CONTRIBUTION SCORE</span>
            <div>
              <span className="text-5xl font-mono font-black text-white">{estimatedScore}</span>
              <span className="text-emerald-400 font-sans text-xl ml-1 font-bold">pts</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-sans">
              <Award className="w-4 h-4 text-orange-400" />
              <span>Equivalent to a <span className="text-white font-bold">{estimatedScore >= 800 ? 'Platinum Tier Badge' : estimatedScore >= 400 ? 'Gold Tier Badge' : 'Steward Badge'}</span></span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Informative Guidelines Panel */}
      <div className="p-6 rounded-3xl bg-neutral-900 text-white border border-neutral-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <HelpCircle className="w-40 h-40" />
        </div>
        <div className="relative z-10 space-y-3">
          <h4 className="flex items-center gap-1.5 text-emerald-405 font-sans font-bold text-sm uppercase tracking-wide">
            <Zap className="w-4 h-4 text-emerald-400 fill-emerald-400" /> Point Distribution Matrices:
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono text-neutral-300">
            <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-1">
              <span className="text-white block font-bold leading-relaxed">🌱 Sapling Planting</span>
              <p className="text-neutral-400 leading-normal">Earn +10 points directly to your linked organization board for every reported tree planted during active drives.</p>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-1">
              <span className="text-white block font-bold leading-relaxed">⏰ Volunteering Lab Hours</span>
              <p className="text-neutral-400 leading-normal">Gain +50 points per documented hour during weekend Miyawaki establishment and bank shoreline restoration projects.</p>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-1">
              <span className="text-white block font-bold leading-relaxed">📍 Pin Discoveries</span>
              <p className="text-neutral-400 leading-normal">Achieve +100 points for locating deforested territories and filing verified coordinates to the planning map.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
