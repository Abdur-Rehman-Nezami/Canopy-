/**
 * types.ts
 * Core types and structures for the Student Plantation & Environmental Restoration Network.
 */

export interface StudentUser {
  userId: string;
  name: string;
  email: string;
  role: 'student' | 'nursery_coordinator' | 'donor';
  treesPlanted: number;
  volunteerHours: number;
  badges: string[];
  joinedDrives: string[]; // List of Drive IDs
  createdAt: string;
}

export interface PlantationDrive {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  creatorName: string;
  latitude: number;
  longitude: number;
  locationName: string;
  status: 'planned' | 'active' | 'completed';
  targetTrees: number;
  plantedTrees: number;
  volunteerIds: string[];
  nurseryId?: string;
  fundsRaised: number;
  createdAt: string;
}

export interface PlantationNeedSpot {
  id: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  reportedBy: string;
  reporterName: string;
  priority: 'high' | 'medium' | 'low';
  status: 'unassigned' | 'assigned' | 'restored';
  createdAt: string;
}

export interface DonationRecord {
  id: string;
  donorName: string;
  donorEmail: string;
  amount: number;
  treesSponsored: number;
  driveId: string;
  createdAt: string;
}

export interface SaplingInventory {
  species: string;
  count: number;
  difficulty: 'easy' | 'moderate' | 'expert';
  description: string;
}

export interface NurseryData {
  id: string;
  name: string;
  contactName: string;
  contactPhone: string;
  latitude: number;
  longitude: number;
  address: string;
  availableSaplings: SaplingInventory[];
}

export interface LeaderboardTeam {
  id: string;
  name: string;
  institution: string;
  membersCount: number;
  treesPlanted: number;
  score: number;
}

// Pre-seeded high quality mock data for a seamless initial preview and offline fallback
export const SEED_USERS: StudentUser[] = [
  {
    userId: 'student_1',
    name: 'Zainab Malik',
    email: 'zainab.malik@punjabuniv.edu.pk',
    role: 'student',
    treesPlanted: 142,
    volunteerHours: 36,
    badges: ['forest-pioneer', 'water-guardian', 'nursery-ally'],
    joinedDrives: ['drive_1', 'drive_2'],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    userId: 'student_2',
    name: 'Asad Raza',
    email: 'asad.raza@lums.edu.pk',
    role: 'student',
    treesPlanted: 85,
    volunteerHours: 24,
    badges: ['forest-pioneer', 'sapling-savior'],
    joinedDrives: ['drive_1'],
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    userId: 'student_3',
    name: 'Hamza Siddiqui',
    email: 'hamza.s@gcu.edu.pk',
    role: 'student',
    treesPlanted: 210,
    volunteerHours: 58,
    badges: ['forest-founder', 'ecosystem-hero', 'water-guardian', 'seed-sower'],
    joinedDrives: ['drive_1', 'drive_3'],
    createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const SEED_DRIVES: PlantationDrive[] = [
  {
    id: 'drive_1',
    title: 'Punjab University New Campus Miyawaki Forest',
    description: 'We are creating a high-density native forest strip behind the PU Sports Complex. Miyawaki forests grow 10x faster and absorb more carbon. Let’s clean Lahori air and establish micro-habitats!',
    creatorId: 'student_3',
    creatorName: 'Hamza Siddiqui',
    latitude: 31.478,
    longitude: 74.298,
    locationName: 'PU Sport Complex Outer Jogging Track, Lahore',
    status: 'active',
    targetTrees: 500,
    plantedTrees: 340,
    volunteerIds: ['student_1', 'student_2', 'student_3'],
    nurseryId: 'nursery_1',
    fundsRaised: 420,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'drive_2',
    title: 'Ravi Riverbed Riparian Planting & Soil Stabilization',
    description: 'Restoring native moisture-loving tree species along the Ravi River edge to filter runoff water and stabilize banks. We will plant local breeds like Sukh Chain, Jamun, and Bamboo to resist bank crumbling during monsoon seasons.',
    creatorId: 'student_1',
    creatorName: 'Zainab Malik',
    latitude: 31.522,
    longitude: 74.360,
    locationName: 'Ravi River Siphon Zone, Lahore North',
    status: 'active',
    targetTrees: 250,
    plantedTrees: 95,
    volunteerIds: ['student_1', 'student_3'],
    nurseryId: 'nursery_2',
    fundsRaised: 180,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'drive_3',
    title: 'LUMS Campus Eco-Shade Corridor',
    description: 'FIGHTING LAHORE HEAT ISLANDS! We are lining walking pathways and academic corridors with shade and gorgeous flowering trees like Amaltas & Kachnar to cool the local concrete surroundings.',
    creatorId: 'student_3',
    creatorName: 'Hamza Siddiqui',
    latitude: 31.470,
    longitude: 74.410,
    locationName: 'DHA Phase 5 Avenue 10 Sidewalks, Lahore',
    status: 'planned',
    targetTrees: 150,
    plantedTrees: 0,
    volunteerIds: ['student_3'],
    nurseryId: 'nursery_1',
    fundsRaised: 50,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const SEED_NEEDS: PlantationNeedSpot[] = [
  {
    id: 'need_1',
    title: 'Arid Zone near Orange Line Metro Pillar 140',
    description: 'High-traffic urban concrete section under intense fuel emissions. Broad open asphalt edges perfect for tough native scrub and shade providers like Neem or Sukh Chain.',
    latitude: 31.535,
    longitude: 74.312,
    reportedBy: 'student_1',
    reporterName: 'Zainab Malik',
    priority: 'high',
    status: 'unassigned',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'need_2',
    title: 'Eroding Bank at Lahore Canal (Jallo Link)',
    description: 'Severe erosion along canal side trails. Demands dense structural root-locking trees like Shisham, Willow reeds, and local Vetiver root grids to hold Lahore clay.',
    latitude: 31.562,
    longitude: 74.428,
    reportedBy: 'student_2',
    reporterName: 'Asad Raza',
    priority: 'high',
    status: 'assigned',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'need_3',
    title: 'Gulberg Boulevard KARAM Green Program Gap Restoration',
    description: 'Local neighborhood avenue lost several heritage shade trees during recent bypass road expansion. We need to replant sturdy native Shisham or Amaltas seedlings to restore local shade.',
    latitude: 31.515,
    longitude: 74.350,
    reportedBy: 'student_3',
    reporterName: 'Hamza Siddiqui',
    priority: 'medium',
    status: 'unassigned',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const SEED_NURSERIES: NurseryData[] = [
  {
    id: 'nursery_1',
    name: 'Lahore PHA Government Botanical Nursery',
    contactName: 'Sajid Mahmood (Deputy Director)',
    contactPhone: '+92 300 8492041',
    latitude: 31.545,
    longitude: 74.331,
    address: 'Parks & Horticulture Authority Headquarters, Jinnah Gardens, Lahore',
    availableSaplings: [
      { species: 'Sukh Chain (Sissoo Companion)', count: 420, difficulty: 'easy', description: 'Extremely resilient soil restorer with beautiful shade canopy. Highly durable, filters heavy vehicle smog, thrives in sidewalk concrete cuts.' },
      { species: 'Amaltas (Golden Shower)', count: 210, difficulty: 'easy', description: 'Stunning yellow trails of native butterfly feed. Essential for stabilizing Lahore city corridor temperatures.' },
      { species: 'Kachnar (Bauhinia Orchid)', count: 185, difficulty: 'moderate', description: 'Lovely flowering tree with edible pods. Acts as a brilliant local bird sanctuary anchor and ornamental shade provider.' },
      { species: 'Shisham (Dalbergia sissoo)', count: 65, difficulty: 'expert', description: 'Legendary state-protected timber tree. Exceptionally drought-hardy, develops dense shade, prevents river embankment crumbling.' }
    ]
  },
  {
    id: 'nursery_2',
    name: 'Pattoki Forestry Reserve Seed Depot',
    contactName: 'Farhan Qureshi (Range Officer)',
    contactPhone: '+92 345 4910301',
    latitude: 31.560,
    longitude: 74.430,
    address: 'Forestry Division Depot, Jallo Forest Park Outer Boulevard, Lahore',
    availableSaplings: [
      { species: 'Bamboo (Dendrocalamus)', count: 280, difficulty: 'easy', description: 'Ultra-fast biomass creator. Exceptional carbon sequestering canopy, ideal for locking sandy riverbed edges.' },
      { species: 'Jamun (Black Plum)', count: 155, difficulty: 'moderate', description: 'Dense evergreen berry canopy. Excellent bird shelter, brings native fruit bats and parakeets back to city zones.' },
      { species: 'Neem (Azadirachta indica)', count: 340, difficulty: 'easy', description: 'Legendary antiseptic shade provider. Incredibly resilient to wind storms, requires minimal supplementary hydration.' },
      { species: 'Mulberry (Toot)', count: 95, difficulty: 'expert', description: 'Perfect bird attractant. Fights high salinity in subsoils, incredibly nutritious and fast-growing foliage.' }
    ]
  },
  {
    id: 'nursery_3',
    name: 'Gymkhana Botanical Conservatory & Greenhouse',
    contactName: 'Dr. Tariq Zaman',
    contactPhone: '+92 321 7183309',
    latitude: 31.540,
    longitude: 74.341,
    address: 'Gymkhana Estate Gardens, Mall Road, Lahore',
    availableSaplings: [
      { species: 'Gulmohar (Delonix regia)', count: 180, difficulty: 'easy', description: 'Iconic blazing fiery-red flowering shade tree. Brings spectacular aesthetics to academic corridors and cools roads.' },
      { species: 'Peepal (Ficus religiosa)', count: 120, difficulty: 'easy', description: 'Monolithic sacred oxygen giant. Essential for large common squares, provides thick roosting networks for owls.' },
      { species: 'Mango (Chausa Wild)', count: 85, difficulty: 'expert', description: 'Hardy local fruit canopy. Broad spreading branches keep local fauna well-fed during hot summer droughts.' }
    ]
  },
  {
    id: 'nursery_4',
    name: 'Punjab University Agri-Science Seed Hub',
    contactName: 'Prof. Dr. Shakira Amin',
    contactPhone: '+92 333 4810583',
    latitude: 31.478,
    longitude: 74.298,
    address: 'Institute of Agricultural Sciences Greenhouse, PU New Campus, Lahore',
    availableSaplings: [
      { species: 'Kikar (Acacia nilotica)', count: 160, difficulty: 'moderate', description: 'Maximum heat-tolerant, extremely thorny native species suited to dry Pakistani plains.' },
      { species: 'Imli (Tamarind Tree)', count: 140, difficulty: 'easy', description: 'Immense arching shade cover. Long-lived legacy tree resistant to high roadside pollutant crusts.' },
      { species: 'Shahtoot (Morus alba)', count: 110, difficulty: 'moderate', description: 'Excellent local foliage provider. Extensively used in organic silkworm rearing and bird-friendly campus groves.' }
    ]
  }
];

export const TEAMS_LEADERBOARD: LeaderboardTeam[] = [
  { id: 't1', name: 'PU Bio-Diversity Club', institution: 'Punjab University Campus', membersCount: 18, treesPlanted: 340, score: 5200 },
  { id: 't2', name: 'LUMS Earth & Forest Network', institution: 'LUMS Lahore Campus', membersCount: 14, treesPlanted: 280, score: 4100 },
  { id: 't3', name: 'NUST Green Alliance', institution: 'NUST Islamabad', membersCount: 20, treesPlanted: 310, score: 3850 },
  { id: 't4', name: 'Ravi Conservation Rangers', institution: 'GC University Lahore', membersCount: 12, treesPlanted: 145, score: 2150 },
  { id: 't5', name: 'Karachi Botanical Guild', institution: 'University of Karachi', membersCount: 10, treesPlanted: 95, score: 1400 }
];

export const BADGE_DETAILS: Record<string, { title: string; desc: string; icon: string; color: string }> = {
  'forest-pioneer': {
    title: 'Forest Pioneer',
    desc: 'Participated in planting over 50 native trees.',
    icon: 'TreePine',
    color: 'from-emerald-500 to-green-600'
  },
  'water-guardian': {
    title: 'Water Guardian',
    desc: 'Led a riparian shoreline restoration project near fresh wetlands.',
    icon: 'Droplets',
    color: 'from-cyan-500 to-blue-600'
  },
  'nursery-ally': {
    title: 'Nursery Ally',
    desc: 'Successfully coordinated distribution logistics for over 200 saplings.',
    icon: 'Warehouse',
    color: 'from-amber-500 to-orange-600'
  },
  'sapling-savior': {
    title: 'Sapling Savior',
    desc: 'Maintained and watered planted drive saplings for 3 straight weeks.',
    icon: 'Sprout',
    color: 'from-lime-500 to-emerald-600'
  },
  'forest-founder': {
    title: 'Forest Founder',
    desc: 'Started an original student ecological restoration drive.',
    icon: 'Heart',
    color: 'from-rose-500 to-pink-600'
  },
  'ecosystem-hero': {
    title: 'Ecosystem Hero',
    desc: 'Achieved outstanding leadership level on community board.',
    icon: 'Crown',
    color: 'from-violet-500 to-purple-600'
  },
  'seed-sower': {
    title: 'Seed Sower',
    desc: 'Supplied seeds or reported over 3 needed plantation zones.',
    icon: 'Layers',
    color: 'from-yellow-400 to-amber-500'
  }
};
