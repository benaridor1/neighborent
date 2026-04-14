/**
 * Curated Unsplash URLs per demo category so cards look plausible (not random Lorem pics).
 * Company sectors are registered from home.mock after rentalCompanyCategories is defined.
 */

export type DemoCategoryKey = "photo" | "compute" | "construction" | "garden" | "sports" | "events";

const companySectorMap: Record<string, DemoCategoryKey> = {};

function u(path: string, w: number): string {
  return `https://images.unsplash.com/${path}?auto=format&fit=crop&w=${w}&q=80`;
}

/**
 * Image IDs are chosen from assets that still resolve on images.unsplash.com (many older IDs now 404).
 * Pools may repeat entries so hash-based picks stay stable while every slot is valid.
 */
const POOLS: Record<DemoCategoryKey, string[]> = {
  photo: [
    u("photo-1516035069371-29a1b244cc32", 900),
    u("photo-1502920917128-1aa500764cbd", 900),
    u("photo-1500530855697-b586d89ba3ee", 900),
    u("photo-1473968512647-3e447244af8f", 900),
    u("photo-1554048612-b6a482bc67e5", 900),
    u("photo-1516035069371-29a1b244cc32", 900),
    u("photo-1502920917128-1aa500764cbd", 900),
    u("photo-1554048612-b6a482bc67e5", 900),
  ],
  compute: [
    u("photo-1496181133206-80ce9b88a853", 900),
    u("photo-1498050108023-c5249f4df085", 900),
    u("photo-1517694712202-14dd9538aa97", 900),
    u("photo-1517336714731-489689fd1ca8", 900),
    u("photo-1504384308090-c894fdcc538d", 900),
    u("photo-1560472354-b33ff0c44a43", 900),
    u("photo-1540575467063-178a50c2df87", 900),
    u("photo-1558618666-fcd25c85cd64", 900),
  ],
  construction: [
    u("photo-1504148455328-c376907d081c", 900),
    u("photo-1541888946425-d81bb19240f5", 900),
    u("photo-1504307651254-35680f356dfd", 900),
    u("photo-1581094794329-c8112a89af12", 900),
    u("photo-1621905251918-48416bd8575a", 900),
    u("photo-1581578731548-c64695cc6952", 900),
    u("photo-1503387762-592deb58ef4e", 900),
    u("photo-1504148455328-c376907d081c", 900),
  ],
  garden: [
    u("photo-1591857177580-dc82b9ac4e1e", 900),
    u("photo-1464226184884-fa280b87c399", 900),
    u("photo-1523348837708-15d4a09cfac2", 900),
    u("photo-1504280390367-361c6d9f38f4", 900),
    u("photo-1591857177580-dc82b9ac4e1e", 900),
    u("photo-1464226184884-fa280b87c399", 900),
    u("photo-1523348837708-15d4a09cfac2", 900),
    u("photo-1504280390367-361c6d9f38f4", 900),
  ],
  sports: [
    u("photo-1576435728678-68d0fbf94e91", 900),
    u("photo-1504280390367-361c6d9f38f4", 900),
    u("photo-1544551763-46a013bb70d5", 900),
    u("photo-1571019613454-1cb2f99b2d8b", 900),
    u("photo-1523275335684-37898b6baf30", 900),
    u("photo-1576435728678-68d0fbf94e91", 900),
    u("photo-1544551763-46a013bb70d5", 900),
    u("photo-1571019613454-1cb2f99b2d8b", 900),
  ],
  events: [
    u("photo-1540575467063-178a50c2df87", 900),
    u("photo-1514525253161-7a46d19cd819", 900),
    u("photo-1492684223066-81342ee5ff30", 900),
    u("photo-1441986300917-64674bd600d8", 900),
    u("photo-1540575467063-178a50c2df87", 900),
    u("photo-1514525253161-7a46d19cd819", 900),
    u("photo-1492684223066-81342ee5ff30", 900),
    u("photo-1558618666-fcd25c85cd64", 900),
  ],
};

function stableIndex(key: string, modulo: number): number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) % modulo;
}

function pick(category: DemoCategoryKey, salt: string, slot: number): string {
  const pool = POOLS[category];
  const idx = stableIndex(`${salt}:${slot}`, pool.length);
  return pool[idx];
}

/** Home / product-card size */
export function demoProductCardImage(category: DemoCategoryKey, productId: string, slot = 0): string {
  return pick(category, productId, slot);
}

export function demoCompanyCardImage(companyId: string, slot = 0): string {
  const sector = companySectorMap[companyId] ?? "photo";
  return pick(sector, `company-${companyId}`, slot);
}

export function demoCatalogProductImage(companyId: string, salt: string, slot = 0): string {
  const sector = companySectorMap[companyId] ?? "construction";
  return pick(sector, `${companyId}-${salt}`, slot);
}

export function rentalBlockIdToDemoCategory(blockId: string): DemoCategoryKey {
  if (blockId === "camera-companies") return "photo";
  if (blockId === "tech-companies") return "compute";
  if (blockId === "garden-companies") return "garden";
  if (blockId === "sports-companies") return "sports";
  if (blockId === "events-companies") return "events";
  return "construction";
}

export function registerRentalCompanySectors(blocks: Array<{ id: string; companies: Array<{ id: string }> }>): void {
  for (const block of blocks) {
    const sector = rentalBlockIdToDemoCategory(block.id);
    for (const c of block.companies) {
      companySectorMap[c.id] = sector;
    }
  }
}

export function getRegisteredCompanySector(companyId: string): DemoCategoryKey | undefined {
  return companySectorMap[companyId];
}

/** Infer demo category from common home product ids (p*, c*, t*, g*, s*, e*). */
export function inferDemoCategoryFromProductId(productId: string): DemoCategoryKey {
  const id = productId.toLowerCase();
  const head = id.charAt(0);
  if (head === "p") return "photo";
  if (head === "c") return "compute";
  if (head === "t") return "construction";
  if (head === "g") return "garden";
  if (head === "s") return "sports";
  if (head === "e") return "events";
  return "photo";
}
