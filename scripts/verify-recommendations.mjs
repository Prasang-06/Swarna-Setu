import { seedProducts } from "../lib/seed.ts";

const INITIAL_PRODUCTS = seedProducts;
console.log(`Loaded ${INITIAL_PRODUCTS.length} demo products for verification.`);

// Import recommendations functions
import {
  generateProductSlug,
  resolveProduct,
  calculateSimilarityScore,
  getSimilarProducts,
  getMoreFromShop,
  getComplementaryProducts,
  recordRecentlyViewed,
  getRecentlyViewedProducts,
} from "../lib/recommendations.ts";

let testsPassed = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (!condition) {
    console.error(`  ✕ [FAILED] ${message}`);
    process.exit(1);
  }
  console.log(`  ✓ [PASSED] ${message}`);
  testsPassed++;
}

console.log("\n==================================================================");
console.log(" SWARNASETU DYNAMIC PRODUCT PAGES & RECOMMENDATIONS VERIFICATION");
console.log("==================================================================\n");

// 1. Slug Generation & Resolution
const sampleProd = INITIAL_PRODUCTS[0];
const slug = generateProductSlug(sampleProd);
assert(slug.includes(sampleProd.id), `Slug "${slug}" includes product ID "${sampleProd.id}"`);
assert(resolveProduct(sampleProd.id, INITIAL_PRODUCTS)?.id === sampleProd.id, `resolveProduct resolves raw ID: ${sampleProd.id}`);
assert(resolveProduct(slug, INITIAL_PRODUCTS)?.id === sampleProd.id, `resolveProduct resolves generated slug: ${slug}`);
assert(resolveProduct(sampleProd.id.toUpperCase(), INITIAL_PRODUCTS)?.id === sampleProd.id, `resolveProduct is case-insensitive on ID`);
assert(resolveProduct("non-existent-product-id", INITIAL_PRODUCTS) === undefined, `resolveProduct returns undefined for unknown ID`);

// Test all products have unique slugs and resolve bidirectionally
let allSlugsUnique = true;
const slugSet = new Set();
for (const p of INITIAL_PRODUCTS) {
  const s = generateProductSlug(p);
  if (slugSet.has(s)) allSlugsUnique = false;
  slugSet.add(s);
  const resolved = resolveProduct(s, INITIAL_PRODUCTS);
  if (!resolved || resolved.id !== p.id) {
    assert(false, `Product ${p.id} failed bidirectional slug resolution: ${s}`);
  }
}
assert(allSlugsUnique, `All ${INITIAL_PRODUCTS.length} product slugs are uniquely resolvable`);

// 2. Multi-Attribute Similarity Scoring
for (const current of INITIAL_PRODUCTS) {
  const selfScore = calculateSimilarityScore(current, current);
  assert(selfScore === -1, `Product ${current.id} similarity with itself is strictly -1 (excluded)`);

  const similar = getSimilarProducts(current, INITIAL_PRODUCTS, 4, [current.id]);
  assert(!similar.some(s => s.id === current.id), `Similar items for ${current.id} never include itself`);
  assert(similar.every(s => s.status === "published"), `Similar items for ${current.id} only include published pieces`);
  assert(similar.length > 0, `Similar designs returns recommendations for ${current.id}`);

  // Test that items with same category and purity score higher than dissimilar items
  const candidates = INITIAL_PRODUCTS.filter(p => p.id !== current.id && p.status === "published");
  const sameCatSamePurity = candidates.find(p => p.category === current.category && p.purity === current.purity);
  const diffCatDiffPurity = candidates.find(p => p.category !== current.category && p.purity !== current.purity);
  if (sameCatSamePurity && diffCatDiffPurity) {
    const scoreHigh = calculateSimilarityScore(current, sameCatSamePurity);
    const scoreLow = calculateSimilarityScore(current, diffCatDiffPurity);
    assert(scoreHigh > scoreLow, `Same category/purity (${scoreHigh}) scores higher than different (${scoreLow}) for ${current.id}`);
  }
}

// 3. More from This Shop & Complete the Look
for (const current of INITIAL_PRODUCTS) {
  const similar = getSimilarProducts(current, INITIAL_PRODUCTS, 4, [current.id]);
  const excludeForShop = [current.id, ...similar.map(s => s.id)];
  const moreFromShop = getMoreFromShop(current, INITIAL_PRODUCTS, 4, excludeForShop);

  assert(!moreFromShop.some(m => m.id === current.id), `More from shop for ${current.id} excludes current piece`);
  assert(moreFromShop.every(m => m.shopId === current.shopId), `More from shop for ${current.id} strictly belongs to shop ${current.shopId}`);
  assert(!moreFromShop.some(m => similar.some(s => s.id === m.id)), `More from shop for ${current.id} does not duplicate similar items`);

  const excludeForLook = [current.id, ...similar.map(s => s.id), ...moreFromShop.map(m => m.id)];
  const look = getComplementaryProducts(current, INITIAL_PRODUCTS, 3, excludeForLook);
  assert(!look.some(l => l.id === current.id), `Complete the look excludes current piece`);
  assert(!look.some(l => similar.some(s => s.id === l.id)), `Complete the look does not duplicate similar items`);
  assert(!look.some(l => moreFromShop.some(m => m.id === l.id)), `Complete the look does not duplicate more from shop items`);
}

console.log("\n==================================================================");
console.log(` RESULTS: ALL ${testsPassed} / ${totalTests} CHECKS PASSED`);
console.log("==================================================================\n");
