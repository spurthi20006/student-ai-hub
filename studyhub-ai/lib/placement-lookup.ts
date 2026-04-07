import placementStats from "@/data/placement-stats.json";

export type DomainKey = "Sci&Tech" | "Comm&Mgmt" | "Others";

const TOPIC_DOMAIN_MAP: Record<string, DomainKey> = {
  dbms: "Sci&Tech",
  database: "Sci&Tech",
  "operating systems": "Sci&Tech",
  "data structures": "Sci&Tech",
  algorithms: "Sci&Tech",
  networking: "Sci&Tech",
  oops: "Sci&Tech",
  "object oriented": "Sci&Tech",
  programming: "Sci&Tech",
  software: "Sci&Tech",
  computer: "Sci&Tech",
  "machine learning": "Sci&Tech",
  "artificial intelligence": "Sci&Tech",
  python: "Sci&Tech",
  java: "Sci&Tech",
  "web development": "Sci&Tech",
  cloud: "Sci&Tech",
  cybersecurity: "Sci&Tech",
  mathematics: "Sci&Tech",
  statistics: "Sci&Tech",
  marketing: "Comm&Mgmt",
  finance: "Comm&Mgmt",
  management: "Comm&Mgmt",
  economics: "Comm&Mgmt",
  accounting: "Comm&Mgmt",
  business: "Comm&Mgmt",
  hr: "Comm&Mgmt",
  "human resources": "Comm&Mgmt",
};

export function getDomainForTopic(topic: string): DomainKey {
  const key = topic.toLowerCase();
  for (const [k, v] of Object.entries(TOPIC_DOMAIN_MAP)) {
    if (key.includes(k)) return v;
  }
  return "Sci&Tech";
}

export interface DomainStats {
  domain: DomainKey;
  rate: string;
  avgDegreeP: string;
  avgSalary: string;
  workexWithRate: string;
  workexWithoutRate: string;
  overallRate: string;
  placedTotal: number;
  total: number;
}

export function getStatsForDomain(domain: DomainKey): DomainStats {
  const d = (placementStats as typeof placementStats).byDegree[domain as keyof typeof placementStats.byDegree];
  return {
    domain,
    rate: d.rate,
    avgDegreeP: d.avgDegreeP,
    avgSalary: d.avgSalary,
    workexWithRate: placementStats.workexStats.withWorkex,
    workexWithoutRate: placementStats.workexStats.withoutWorkex,
    overallRate: placementStats.overallRate,
    placedTotal: placementStats.placedTotal,
    total: placementStats.total,
  };
}
