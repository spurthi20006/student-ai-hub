const fs = require("fs");
const path = require("path");

// Try to load papaparse
let Papa;
try {
  Papa = require("papaparse");
} catch {
  console.error("papaparse not found. Run: npm install papaparse");
  process.exit(1);
}

const csvPath = path.join(__dirname, "../data/raw/Placement_Data_Full_Class.csv");
if (!fs.existsSync(csvPath)) {
  console.error(`CSV not found at: ${csvPath}`);
  console.error("Download with: kaggle datasets download -d benroshan/factors-affecting-campus-placement");
  console.error("Then unzip to: data/raw/");
  process.exit(1);
}

const csv = fs.readFileSync(csvPath, "utf8");
const { data } = Papa.parse(csv, { header: true, skipEmptyLines: true });

console.log(`Loaded ${data.length} records`);

const placed = data.filter((r) => r.status === "Placed");
const total = data.length;

// Placement rate by degree type
const byDegree = {};
["Sci&Tech", "Comm&Mgmt", "Others"].forEach((type) => {
  const group = data.filter((r) => r.degree_t === type);
  const placedGroup = group.filter((r) => r.status === "Placed");
  const withSalary = placedGroup.filter((r) => r.salary && !isNaN(parseFloat(r.salary)));
  byDegree[type] = {
    total: group.length,
    placed: placedGroup.length,
    rate: group.length ? ((placedGroup.length / group.length) * 100).toFixed(1) : "0",
    avgDegreeP: placedGroup.length
      ? (placedGroup.reduce((s, r) => s + parseFloat(r.degree_p || 0), 0) / placedGroup.length).toFixed(1)
      : "0",
    avgSalary: withSalary.length
      ? (withSalary.reduce((s, r) => s + parseFloat(r.salary), 0) / withSalary.length).toFixed(0)
      : "0",
  };
});

// Work experience impact
const withWorkex = data.filter((r) => r.workex === "Yes");
const withoutWorkex = data.filter((r) => r.workex === "No");
const workexStats = {
  withWorkex: withWorkex.length
    ? ((withWorkex.filter((r) => r.status === "Placed").length / withWorkex.length) * 100).toFixed(1)
    : "0",
  withoutWorkex: withoutWorkex.length
    ? ((withoutWorkex.filter((r) => r.status === "Placed").length / withoutWorkex.length) * 100).toFixed(1)
    : "0",
};

// Stream stats
const streamStats = {};
["Science", "Commerce", "Arts"].forEach((stream) => {
  const group = data.filter((r) => r.hsc_s === stream);
  const placedGroup = group.filter((r) => r.status === "Placed");
  streamStats[stream] = {
    rate: group.length ? ((placedGroup.length / group.length) * 100).toFixed(1) : "0",
    total: group.length,
  };
});

// Etest impact
const highEtest = data.filter((r) => parseFloat(r.etest_p) >= 70);
const lowEtest = data.filter((r) => parseFloat(r.etest_p) < 70);
const etestImpact = {
  above70: highEtest.length
    ? ((highEtest.filter((r) => r.status === "Placed").length / highEtest.length) * 100).toFixed(1)
    : "0",
  below70: lowEtest.length
    ? ((lowEtest.filter((r) => r.status === "Placed").length / lowEtest.length) * 100).toFixed(1)
    : "0",
};

const stats = {
  total,
  placedTotal: placed.length,
  overallRate: ((placed.length / total) * 100).toFixed(1),
  byDegree,
  workexStats,
  streamStats,
  etestImpact,
};

fs.writeFileSync(
  path.join(__dirname, "../data/placement-stats.json"),
  JSON.stringify(stats, null, 2)
);
console.log("✓ data/placement-stats.json written");
console.log("Stats:", JSON.stringify(stats, null, 2));
