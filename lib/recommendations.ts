import type { Product } from "./types";

/**
 * Generates a human-friendly URL slug for a product, e.g. "temple-bloom-heritage-necklace-prod-001".
 */
export function generateProductSlug(product: Product): string {
  const cleanTitle = product.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${cleanTitle}-${product.id}`;
}

/**
 * Resolves a product by exact ID, case-insensitive ID, or human-friendly slug.
 */
export function resolveProduct(
  slugOrId: string,
  products: Product[]
): Product | undefined {
  if (!slugOrId) return undefined;
  const target = decodeURIComponent(slugOrId).trim().toLowerCase();

  // 1. Direct match on product ID
  const directMatch = products.find(p => p.id.toLowerCase() === target);
  if (directMatch) return directMatch;

  // 2. Slug ends with the product ID (e.g. "temple-bloom-heritage-necklace-prod-001" -> "prod-001")
  const endsWithIdMatch = products.find(p => target.endsWith(p.id.toLowerCase()));
  if (endsWithIdMatch) return endsWithIdMatch;

  // 3. Exact slug match generated from name
  const slugMatch = products.find(p => generateProductSlug(p).toLowerCase() === target);
  if (slugMatch) return slugMatch;

  // 4. Fallback: Title keyword substring match
  const nameSubMatch = products.find(p => {
    const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return target.includes(slug) || slug.includes(target);
  });
  if (nameSubMatch) return nameSubMatch;

  return undefined;
}

/**
 * Calculates a multi-attribute similarity score between two products.
 */
export function calculateSimilarityScore(current: Product, candidate: Product): number {
  if (current.id === candidate.id) return -1;
  if (candidate.status !== "published") return -1;
  if (candidate.inventoryStatus === "Archived" || candidate.inventoryStatus === "Sold or unavailable") {
    return -1;
  }

  let score = 0;

  // 1. Category match (Highest weight: 40 points)
  if (current.category === candidate.category) {
    score += 40;
  } else if (
    (current.category === "Bridal" && candidate.category === "Necklaces") ||
    (current.category === "Necklaces" && candidate.category === "Bridal")
  ) {
    score += 25; // Close cross-category affinity
  }

  // 2. Metal purity match (25 points)
  if (current.purity === candidate.purity) {
    score += 25;
  }

  // 3. Occasion / Tag match (20 points)
  if (current.occasion && candidate.occasion && current.occasion === candidate.occasion) {
    score += 20;
  }
  if (current.tag && candidate.tag && current.tag.toLowerCase() === candidate.tag.toLowerCase()) {
    score += 15;
  }

  // 4. Price bracket proximity (15 points)
  if (current.price > 0 && candidate.price > 0) {
    const ratio = Math.min(current.price, candidate.price) / Math.max(current.price, candidate.price);
    if (ratio >= 0.7) {
      score += 15; // Within 30% price range
    } else if (ratio >= 0.4) {
      score += 8;
    }
  }

  // 5. Price mode match (10 points)
  if (current.priceMode === candidate.priceMode) {
    score += 10;
  }

  // 6. Gemstone / Plain gold aesthetic match (10 points)
  const currentHasDiamond = /diamond|solitaire|polki/i.test(`${current.name} ${current.stoneDetails || ""}`);
  const candidateHasDiamond = /diamond|solitaire|polki/i.test(`${candidate.name} ${candidate.stoneDetails || ""}`);
  if (currentHasDiamond === candidateHasDiamond) {
    score += 10;
  }

  return score;
}

/**
 * Returns a dynamically ranked list of "Similar Designs You May Like" for a given product.
 */
export function getSimilarProducts(
  currentProduct: Product,
  allProducts: Product[],
  limit = 4,
  excludeIds: string[] = []
): Product[] {
  const candidates = allProducts.filter(
    p => p.id !== currentProduct.id && !excludeIds.includes(p.id) && p.status === "published"
  );

  const scored = candidates
    .map(p => ({
      product: p,
      score: calculateSimilarityScore(currentProduct, p),
    }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);

  const results: Product[] = scored.map(s => s.product);

  // Graceful fallback: If catalogue information yields fewer than limit, fill with same category items
  if (results.length < limit) {
    const fallbackCategory = candidates.filter(
      p =>
        p.category === currentProduct.category &&
        !results.some(r => r.id === p.id)
    );
    results.push(...fallbackCategory);
  }

  // Final fallback: Fill with other available published items
  if (results.length < limit) {
    const fallbackAny = candidates.filter(
      p => !results.some(r => r.id === p.id)
    );
    results.push(...fallbackAny);
  }

  return results.slice(0, limit);
}

/**
 * Returns other pieces crafted by the same showroom ("More from This Shop").
 */
export function getMoreFromShop(
  currentProduct: Product,
  allProducts: Product[],
  limit = 4,
  excludeIds: string[] = []
): Product[] {
  return allProducts
    .filter(
      p =>
        p.shopId === currentProduct.shopId &&
        p.id !== currentProduct.id &&
        !excludeIds.includes(p.id) &&
        p.status === "published"
    )
    .slice(0, limit);
}

/**
 * Returns complementary jewellery pieces (e.g., matching earrings for a necklace).
 */
export function getComplementaryProducts(
  currentProduct: Product,
  allProducts: Product[],
  limit = 3,
  excludeIds: string[] = []
): Product[] {
  const categoryMap: Record<string, string[]> = {
    Necklaces: ["Earrings", "Bangles", "Rings"],
    Bridal: ["Earrings", "Bangles", "Rings"],
    Earrings: ["Necklaces", "Pendants", "Chains"],
    Bangles: ["Rings", "Necklaces", "Earrings"],
    Rings: ["Bangles", "Chains", "Earrings"],
    Chains: ["Pendants", "Rings", "Earrings"],
    Pendants: ["Chains", "Earrings", "Rings"],
  };

  const targetCategories = categoryMap[currentProduct.category] || ["Earrings", "Rings"];

  return allProducts
    .filter(
      p =>
        targetCategories.includes(p.category) &&
        p.id !== currentProduct.id &&
        !excludeIds.includes(p.id) &&
        p.status === "published" &&
        (p.purity === currentProduct.purity || p.shopId === currentProduct.shopId)
    )
    .slice(0, limit);
}

/**
 * LocalStorage browsing history management for "Recently Viewed".
 */
const STORAGE_KEY = "swarnasetu_recently_viewed_v1";

export function recordRecentlyViewed(productId: string): void {
  if (typeof window === "undefined" || !productId) return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const existing: string[] = raw ? JSON.parse(raw) : [];
    const updated = [productId, ...existing.filter(id => id !== productId)].slice(0, 10);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage quota / parsing errors
  }
}

export function getRecentlyViewedProducts(
  currentProductId: string,
  allProducts: Product[],
  limit = 4
): Product[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const ids: string[] = JSON.parse(raw);
    const idOrder = ids.filter(id => id !== currentProductId);

    const map = new Map(allProducts.map(p => [p.id, p]));
    const results: Product[] = [];

    for (const id of idOrder) {
      const p = map.get(id);
      if (p && p.status === "published") {
        results.push(p);
      }
      if (results.length >= limit) break;
    }

    return results;
  } catch {
    return [];
  }
}
