// ---------------------------------------------------------------------------
// Little C Co. pricing system — quantity-tier and set-based pricing.
//
// Transcribed verbatim from "Littlecco. Pricing System.pdf". This module is the
// single source of truth for effective prices; the WooCommerce `regular_price`
// on these products is only a fallback / catalogue-card figure.
//
// Rules are keyed by product SLUG. Both the storefront (product page, cart,
// checkout summary) and the server (checkout/create-order) resolve prices
// through the helpers here so the amount shown always equals the amount charged.
// ---------------------------------------------------------------------------

export type QtyTier = {
  /** inclusive lower bound on line quantity */
  min: number;
  /** inclusive upper bound; null = no upper bound */
  max: number | null;
  /** price per unit within this range */
  perUnit?: number;
  /** OR a fixed total for the whole line within this range (e.g. a "Pair") */
  flatTotal?: number;
};

// A "set"-priced product is sold in fixed base sets (e.g. a set of 6). The
// customer picks a plain quantity = number of sets; quantity 2 means two sets
// (12 pieces). The per-set price drops at higher quantities (volume discount).
export type SetTier = {
  /** inclusive lower bound on number of sets */
  minSets: number;
  /** inclusive upper bound on number of sets; null = no upper bound */
  maxSets: number | null;
  /** price for ONE base set within this range */
  perSet: number;
};

export type PricingRule =
  | { kind: "tiered"; basePrice: number; tiers: QtyTier[] }
  | {
      kind: "set";
      /** pieces in one base set */
      setSize: number;
      /** hard cap on number of sets orderable; null = no cap */
      maxSets: number | null;
      tiers: SetTier[];
    };

const MIRROR_STYLE_TIERS: QtyTier[] = [
  { min: 1, max: 3, perUnit: 1299 },
  { min: 4, max: 9, perUnit: 1149 },
  { min: 10, max: 24, perUnit: 999 },
  { min: 25, max: 49, perUnit: 899 },
  { min: 50, max: 99, perUnit: 799 },
  { min: 100, max: null, perUnit: 699 },
];

const FRAME_TOTE_TIERS: QtyTier[] = [
  { min: 1, max: 3, perUnit: 1499 },
  { min: 4, max: 9, perUnit: 1349 },
  { min: 10, max: 24, perUnit: 1249 },
  { min: 25, max: 49, perUnit: 1149 },
  { min: 50, max: 99, perUnit: 1099 },
  { min: 100, max: null, perUnit: 999 },
];

const CARD_HOLDER_TIERS: QtyTier[] = [
  { min: 1, max: 3, perUnit: 999 },
  { min: 4, max: 9, perUnit: 899 },
  { min: 10, max: 24, perUnit: 799 },
  { min: 25, max: 49, perUnit: 749 },
  { min: 50, max: 99, perUnit: 699 },
  { min: 100, max: null, perUnit: 649 },
];

const WINE_GLASS_TIERS: QtyTier[] = [
  { min: 1, max: 1, perUnit: 1799 },
  { min: 2, max: 2, flatTotal: 3299 }, // Pair
  { min: 3, max: 4, perUnit: 1799 },
  { min: 5, max: 9, perUnit: 1650 },
  { min: 10, max: 24, perUnit: 1499 },
  { min: 25, max: 49, perUnit: 1349 },
  { min: 50, max: 99, perUnit: 1249 },
  { min: 100, max: null, perUnit: 1149 },
];

const RING_BOX_TIERS: QtyTier[] = [
  { min: 1, max: 1, perUnit: 1699 },
  { min: 2, max: 2, flatTotal: 2999 }, // Pair
  { min: 3, max: 4, perUnit: 1699 },
  { min: 5, max: 9, perUnit: 1550 },
  { min: 10, max: 24, perUnit: 1450 },
  { min: 25, max: 49, perUnit: 1350 },
  { min: 50, max: null, perUnit: 1250 },
];

// Keyed by product slug (WooCommerce slug).
export const PRICING_RULES: Record<string, PricingRule> = {
  "personalised-compact-mirror": { kind: "tiered", basePrice: 1299, tiers: MIRROR_STYLE_TIERS },
  "personalised-frame": { kind: "tiered", basePrice: 1499, tiers: FRAME_TOTE_TIERS },
  "handpainted-tote-bag": { kind: "tiered", basePrice: 1499, tiers: FRAME_TOTE_TIERS },
  "engraved-custom-card-holder": { kind: "tiered", basePrice: 999, tiers: CARD_HOLDER_TIERS },
  "personalised-wine-glass": { kind: "tiered", basePrice: 1799, tiers: WINE_GLASS_TIERS },
  "personalised-glass-ring-box": { kind: "tiered", basePrice: 1699, tiers: RING_BOX_TIERS },

  // Sets of 6. Per-set price by number of sets (1 / 2–3 / 4+). Place cards and
  // napkins serve a maximum of 30 (5 sets); cutlery takes bulk orders (no cap).
  "linen-handpainted-table-napkins": {
    kind: "set",
    setSize: 6,
    maxSets: 5,
    tiers: [
      { minSets: 1, maxSets: 1, perSet: 3900 },
      { minSets: 2, maxSets: 3, perSet: 3750 },
      { minSets: 4, maxSets: null, perSet: 3594 },
    ],
  },
  "calligraphed-place-cards": {
    kind: "set",
    setSize: 6,
    maxSets: 5,
    tiers: [
      { minSets: 1, maxSets: 1, perSet: 900 },
      { minSets: 2, maxSets: 3, perSet: 870 },
      { minSets: 4, maxSets: null, perSet: 834 },
    ],
  },
  "engraved-personalised-cutlery": {
    kind: "set",
    setSize: 6,
    maxSets: null,
    tiers: [
      { minSets: 1, maxSets: 1, perSet: 3000 },
      { minSets: 2, maxSets: 3, perSet: 2850 },
      { minSets: 4, maxSets: null, perSet: 2694 },
    ],
  },
};

export function getPricingRule(slug: string | undefined | null): PricingRule | null {
  if (!slug) return null;
  return PRICING_RULES[slug] ?? null;
}

function findTier(tiers: QtyTier[], qty: number): QtyTier {
  const match = tiers.find((t) => qty >= t.min && (t.max === null || qty <= t.max));
  // Fall back to the last (highest) tier for quantities past the table.
  return match ?? tiers[tiers.length - 1];
}

/**
 * Resolve a tiered line's price for a given quantity.
 * `unitPrice` is rounded for display/storage; `lineTotal` is authoritative.
 */
export function priceTiered(
  rule: Extract<PricingRule, { kind: "tiered" }>,
  qtyInput: number,
): { unitPrice: number; lineTotal: number; tier: QtyTier } {
  const qty = Math.max(1, Math.floor(qtyInput) || 1);
  const tier = findTier(rule.tiers, qty);
  const lineTotal =
    tier.flatTotal !== undefined ? tier.flatTotal : (tier.perUnit ?? rule.basePrice) * qty;
  const unitPrice = Math.round((lineTotal / qty) * 100) / 100;
  return { unitPrice, lineTotal, tier };
}

/**
 * Resolve a set-priced line for a given number of sets (the plain quantity the
 * customer picks). `perSet` is the per-set price at that quantity's tier;
 * `lineTotal` is authoritative.
 */
export function priceSet(
  rule: Extract<PricingRule, { kind: "set" }>,
  numSetsInput: number,
): {
  numSets: number;
  pieces: number;
  perSet: number;
  perPiece: number;
  lineTotal: number;
} {
  const cap = rule.maxSets ?? Number.POSITIVE_INFINITY;
  const numSets = Math.min(cap, Math.max(1, Math.floor(numSetsInput) || 1));
  const tier =
    rule.tiers.find(
      (t) => numSets >= t.minSets && (t.maxSets === null || numSets <= t.maxSets),
    ) ?? rule.tiers[rule.tiers.length - 1];
  return {
    numSets,
    pieces: rule.setSize * numSets,
    perSet: tier.perSet,
    perPiece: Math.round(tier.perSet / rule.setSize),
    lineTotal: tier.perSet * numSets,
  };
}

/**
 * Entry price for a product with a rule — used for "From ₹X" catalogue cards.
 * Tiered: the single-unit base price. Set: the price of one set.
 */
export function getFromPrice(slug: string | undefined | null): number | null {
  const rule = getPricingRule(slug);
  if (!rule) return null;
  if (rule.kind === "set") {
    return rule.tiers[0].perSet;
  }
  return rule.basePrice;
}

/**
 * Live unit price + line total for a cart/checkout line. Tiered products
 * recompute from quantity; set-priced and flat products use the stored price.
 * Shared by the cart page and the checkout summary.
 */
export function cartLineInfo(line: {
  slug: string;
  price: number;
  quantity: number;
}): { unitPrice: number; lineTotal: number } {
  const rule = getPricingRule(line.slug);
  if (rule?.kind === "tiered") {
    const { unitPrice, lineTotal } = priceTiered(rule, line.quantity);
    return { unitPrice, lineTotal };
  }
  if (rule?.kind === "set") {
    // `quantity` on a set line is the number of sets.
    const { perSet, lineTotal } = priceSet(rule, line.quantity);
    return { unitPrice: perSet, lineTotal };
  }
  return { unitPrice: line.price, lineTotal: line.price * line.quantity };
}

/**
 * Authoritative line total for any cart/checkout line.
 * - tiered: computed from quantity
 * - set:    computed from quantity (= number of sets)
 * - no rule / bad input: null → caller falls back to WooCommerce's own price
 */
export function resolveLineTotal(args: {
  slug: string | undefined | null;
  quantity: number;
  /** Kept for call-site compatibility; set pricing derives everything from quantity. */
  setPieces?: number | null;
}): number | null {
  const rule = getPricingRule(args.slug);
  if (!rule) return null;
  const qty = Math.max(1, Math.floor(args.quantity) || 1);

  if (rule.kind === "tiered") {
    return priceTiered(rule, qty).lineTotal;
  }

  return priceSet(rule, qty).lineTotal;
}
