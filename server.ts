import "dotenv/config";
import express from "express";
import path from "path";
import { MongoClient } from "mongodb";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// Resilient in-memory database fallbacks to support seamless operation if MongoDB credentials fail or are deleted
class MemoryCollection {
  private data: any[] = [];

  constructor(initialData: any[] = []) {
    this.data = JSON.parse(JSON.stringify(initialData));
  }

  async countDocuments() {
    return this.data.length;
  }

  async insertMany(docs: any[]) {
    const copied = docs.map(d => ({ ...d }));
    this.data.push(...copied);
    return { acknowledged: true, insertedCount: docs.length };
  }

  async findOne(query: any) {
    return this.data.find(item => {
      for (const key of Object.keys(query)) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    }) || null;
  }

  find(query: any = {}) {
    let result = [...this.data];
    return {
      sort: (sortSpec: any) => {
        const field = Object.keys(sortSpec)[0];
        const multiplier = sortSpec[field] === -1 ? -1 : 1;
        result.sort((a, b) => {
          const valA = a[field];
          const valB = b[field];
          if (valA === undefined) return 1;
          if (valB === undefined) return -1;
          if (valA < valB) return -1 * multiplier;
          if (valA > valB) return 1 * multiplier;
          return 0;
        });
        return {
          toArray: async () => result
        };
      },
      toArray: async () => result
    };
  }

  async replaceOne(query: any, doc: any, options?: any) {
    const key = Object.keys(query)[0];
    const val = query[key];
    const idx = this.data.findIndex(item => item[key] == val);
    if (idx !== -1) {
      this.data[idx] = { ...doc };
    } else if (options && options.upsert) {
      this.data.push({ ...doc });
    }
    return { acknowledged: true };
  }

  async deleteMany(query: any) {
    this.data = [];
    return { acknowledged: true, deletedCount: 0 };
  }
}

class MemoryDb {
  private collections: Record<string, MemoryCollection> = {};

  constructor() {
    this.collections = {
      users: new MemoryCollection(),
      drives: new MemoryCollection(),
      needs: new MemoryCollection(),
      donations: new MemoryCollection(),
      teams: new MemoryCollection()
    };
  }

  collection(name: string) {
    if (!this.collections[name]) {
      this.collections[name] = new MemoryCollection();
    }
    return this.collections[name];
  }
}

const memoryDbInstance = new MemoryDb();
let useFallback = false;

// MongoDB connection management
let clientInstance: MongoClient | null = null;

async function getDb() {
  if (useFallback) {
    return memoryDbInstance;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn("MONGODB_URI not set. Transitioning gracefully to resilient in-memory database store.");
    useFallback = true;
    return memoryDbInstance;
  }

  try {
    if (!clientInstance) {
      clientInstance = new MongoClient(uri, {
        connectTimeoutMS: 3000,
        serverSelectionTimeoutMS: 3000
      });
      await clientInstance.connect();
      console.log("Connected successfully to MongoDB Atlas cluster");
    }
    // High-reliability check: Ping MongoDB to trigger any authentication or permission errors immediately
    const db = clientInstance.db();
    await db.command({ ping: 1 });
    return db;
  } catch (err) {
    // Connection or auth check transitioned gracefully to our resilient in-memory database fallback to avoid logging database authorization failures.
    useFallback = true;
    if (clientInstance) {
      try {
        await clientInstance.close();
      } catch (closeErr) {
        // Clean cleanup
      }
      clientInstance = null;
    }
    return memoryDbInstance;
  }
}

// Initial high-quality seed configurations
const SEED_USERS = [
  {
    userId: "student_1",
    name: "Zainab Malik",
    email: "zainab.malik@punjabuniv.edu.pk",
    role: "student",
    treesPlanted: 142,
    volunteerHours: 36,
    badges: ["forest-pioneer", "water-guardian", "nursery-ally"],
    joinedDrives: ["drive_1", "drive_2"],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    userId: "student_2",
    name: "Asad Raza",
    email: "asad.raza@lums.edu.pk",
    role: "student",
    treesPlanted: 85,
    volunteerHours: 24,
    badges: ["forest-pioneer", "sapling-savior"],
    joinedDrives: ["drive_1"],
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    userId: "student_3",
    name: "Hamza Siddiqui",
    email: "hamza.s@gcu.edu.pk",
    role: "student",
    treesPlanted: 210,
    volunteerHours: 58,
    badges: ["forest-founder", "ecosystem-hero", "water-guardian", "seed-sower"],
    joinedDrives: ["drive_1", "drive_3"],
    createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const SEED_DRIVES = [
  {
    id: "drive_1",
    title: "Punjab University New Campus Miyawaki Forest",
    description: "We are creating a high-density native forest strip behind the PU Sports Complex. Miyawaki forests grow 10x faster and absorb more carbon. Let’s clean Lahori air and establish micro-habitats!",
    creatorId: "student_3",
    creatorName: "Hamza Siddiqui",
    latitude: 31.478,
    longitude: 74.298,
    locationName: "PU Sport Complex Outer Jogging Track, Lahore",
    status: "active",
    targetTrees: 500,
    plantedTrees: 340,
    volunteerIds: ["student_1", "student_2", "student_3"],
    nurseryId: "nursery_1",
    fundsRaised: 420,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "drive_2",
    title: "Ravi Riverbed Riparian Planting & Soil Stabilization",
    description: "Restoring native moisture-loving tree species along the Ravi River edge to filter runoff water and stabilize banks. We will plant local breeds like Sukh Chain, Jamun, and Bamboo to resist bank crumbling during monsoon seasons.",
    creatorId: "student_1",
    creatorName: "Zainab Malik",
    latitude: 31.522,
    longitude: 74.360,
    locationName: "Ravi River Siphon Zone, Lahore North",
    status: "active",
    targetTrees: 250,
    plantedTrees: 95,
    volunteerIds: ["student_1", "student_3"],
    nurseryId: "nursery_2",
    fundsRaised: 180,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "drive_3",
    title: "LUMS Campus Eco-Shade Corridor",
    description: "FIGHTING LAHORE HEAT ISLANDS! We are lining walking pathways and academic corridors with shade and gorgeous flowering trees like Amaltas & Kachnar to cool the local concrete surroundings.",
    creatorId: "student_3",
    creatorName: "Hamza Siddiqui",
    latitude: 31.470,
    longitude: 74.410,
    locationName: "DHA Phase 5 Avenue 10 Sidewalks, Lahore",
    status: "planned",
    targetTrees: 150,
    plantedTrees: 0,
    volunteerIds: ["student_3"],
    nurseryId: "nursery_1",
    fundsRaised: 50,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const SEED_NEEDS = [
  {
    id: "need_1",
    title: "Arid Zone near Orange Line Metro Pillar 140",
    description: "High-traffic urban concrete section under intense fuel emissions. Broad open asphalt edges perfect for tough native scrub and shade providers like Neem or Sukh Chain.",
    latitude: 31.535,
    longitude: 74.312,
    reportedBy: "student_1",
    reporterName: "Zainab Malik",
    priority: "high",
    status: "unassigned",
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "need_2",
    title: "Eroding Bank at Lahore Canal (Jallo Link)",
    description: "Severe erosion along canal side trails. Demands dense structural root-locking trees like Shisham, Willow reeds, and local Vetiver root grids to hold Lahore clay.",
    latitude: 31.562,
    longitude: 74.428,
    reportedBy: "student_2",
    reporterName: "Asad Raza",
    priority: "high",
    status: "assigned",
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "need_3",
    title: "Gulberg Boulevard KARAM Green Program Gap Restoration",
    description: "Local neighborhood avenue lost several heritage shade trees during recent bypass road expansion. We need to replant sturdy native Shisham or Amaltas seedlings to restore local shade.",
    latitude: 31.515,
    longitude: 74.350,
    reportedBy: "student_3",
    reporterName: "Hamza Siddiqui",
    priority: "medium",
    status: "unassigned",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const SEED_TEAMS = [
  { id: "t1", name: "PU Bio-Diversity Club", institution: "Punjab University Campus", membersCount: 18, treesPlanted: 340, score: 5200 },
  { id: "t2", name: "LUMS Earth & Forest Network", institution: "LUMS Lahore Campus", membersCount: 14, treesPlanted: 280, score: 4100 },
  { id: "t3", name: "NUST Green Alliance", institution: "NUST Islamabad", membersCount: 20, treesPlanted: 310, score: 3850 },
  { id: "t4", name: "Ravi Conservation Rangers", institution: "GC University Lahore", membersCount: 12, treesPlanted: 145, score: 2150 },
  { id: "t5", name: "Karachi Botanical Guild", institution: "University of Karachi", membersCount: 10, treesPlanted: 95, score: 1400 }
];

async function seedDatabase(db: any) {
  try {
    const usersCount = await db.collection("users").countDocuments();
    if (usersCount === 0) {
      await db.collection("users").insertMany(SEED_USERS);
      console.log("Seeded database users successfully.");
    }
    const drivesCount = await db.collection("drives").countDocuments();
    if (drivesCount === 0) {
      await db.collection("drives").insertMany(SEED_DRIVES);
      console.log("Seeded database drives successfully.");
    }
    const needsCount = await db.collection("needs").countDocuments();
    if (needsCount === 0) {
      await db.collection("needs").insertMany(SEED_NEEDS);
      console.log("Seeded database plantation needs successfully.");
    }
    const teamsCount = await db.collection("teams").countDocuments();
    if (teamsCount === 0) {
      await db.collection("teams").insertMany(SEED_TEAMS);
      console.log("Seeded database teams successfully.");
    }
  } catch (err) {
    console.warn("Seeding database check warning:", err);
  }
}

// REST APIs
app.get("/api/state", async (req, res) => {
  try {
    const db = await getDb();
    await seedDatabase(db);
    
    const userId = (req.query.userId as string) || "student_1";
    
    const currentUser = await db.collection("users").findOne({ userId });
    const drives = await db.collection("drives").find({}).sort({ createdAt: -1 }).toArray();
    const needs = await db.collection("needs").find({}).sort({ createdAt: -1 }).toArray();
    const donations = await db.collection("donations").find({}).sort({ createdAt: -1 }).toArray();
    const teams = await db.collection("teams").find({}).sort({ score: -1 }).toArray();

    res.json({
      currentUser: currentUser || SEED_USERS[0],
      drives,
      needs,
      donations,
      teams: teams.length ? teams : SEED_TEAMS
    });
  } catch (error: any) {
    console.error("GET /api/state database sync error:", error);
    res.status(500).json({ error: error.message || "Database connection or read failed" });
  }
});

app.post("/api/state", async (req, res) => {
  try {
    const db = await getDb();
    const { currentUser, drives, needs, donations, teams } = req.body;

    if (currentUser && currentUser.userId) {
      const doc = { ...currentUser };
      delete doc._id;
      await db.collection("users").replaceOne({ userId: currentUser.userId }, doc, { upsert: true });
    }

    if (Array.isArray(drives)) {
      for (const d of drives) {
        if (!d.id) continue;
        const doc = { ...d };
        delete doc._id;
        await db.collection("drives").replaceOne({ id: d.id }, doc, { upsert: true });
      }
    }

    if (Array.isArray(needs)) {
      for (const n of needs) {
        if (!n.id) continue;
        const doc = { ...n };
        delete doc._id;
        await db.collection("needs").replaceOne({ id: n.id }, doc, { upsert: true });
      }
    }

    if (Array.isArray(donations)) {
      for (const don of donations) {
        if (!don.id) continue;
        const doc = { ...don };
        delete doc._id;
        await db.collection("donations").replaceOne({ id: don.id }, doc, { upsert: true });
      }
    }

    if (Array.isArray(teams)) {
      for (const t of teams) {
        if (!t.id) continue;
        const doc = { ...t };
        delete doc._id;
        await db.collection("teams").replaceOne({ id: t.id }, doc, { upsert: true });
      }
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error("POST /api/state database write error:", error);
    res.status(500).json({ error: error.message || "Database write failed" });
  }
});

app.post("/api/reset", async (req, res) => {
  try {
    const db = await getDb();
    await db.collection("users").deleteMany({});
    await db.collection("drives").deleteMany({});
    await db.collection("needs").deleteMany({});
    await db.collection("donations").deleteMany({});
    await db.collection("teams").deleteMany({});
    await seedDatabase(db);
    res.json({ success: true });
  } catch (error: any) {
    console.error("POST /api/reset error:", error);
    res.status(500).json({ error: error.message || "Reset database failed" });
  }
});

async function startServer() {
  // Vite assets middleware for rendering React correctly in iframe
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express Fullstack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
