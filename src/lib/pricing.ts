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

export type SetOption = {
  pieces: number;
  label: string;
  /** fixed total for one set of this size */
  total: number;
  /** per-piece figure, for display only */
  perPiece: number;
};

export type PricingRule =
  | { kind: "tiered"; basePrice: number; tiers: QtyTier[] }
  | { kind: "set"; sets: SetOption[] };

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

function setOptions(base: number, table: Array<[pieces: number, total: number]>): SetOption[] {
  return table.map(([pieces, total]) => ({
    pieces,
    label: `Set of ${pieces}`,
    total,
    perPiece: Math.round(total / pieces),
  }));
}

// Keyed by product slug (WooCommerce slug).
export const PRICING_RULES: Record<string, PricingRule> = {
  "personalised-compact-mirror": { kind: "tiered", basePrice: 1299, tiers: MIRROR_STYLE_TIERS },
  "personalised-frame": { kind: "tiered", basePrice: 1499, tiers: FRAME_TOTE_TIERS },
  "handpainted-tote-bag": { kind: "tiered", basePrice: 1499, tiers: FRAME_TOTE_TIERS },
  "engraved-custom-card-holder": { kind: "tiered", basePrice: 999, tiers: CARD_HOLDER_TIERS },
  "personalised-wine-glass": { kind: "tiered", basePrice: 1799, tiers: WINE_GLASS_TIERS },
  "personalised-glass-ring-box": { kind: "tiered", basePrice: 1699, tiers: RING_BOX_TIERS },

  "linen-handpainted-table-napkins": {
    kind: "set",
    sets: setOptions(650, [
      [6, 3900],
      [12, 3750],
      [18, 3750],
      [24, 3594],
      [30, 3594],
    ]),
  },
  "calligraphed-place-cards": {
    kind: "set",
    sets: setOptions(150, [
      [6, 900],
      [12, 870],
      [18, 870],
      [24, 834],
      [30, 834],
    ]),
  },
  "engraved-personalised-cutlery": {
    kind: "set",
    sets: setOptions(500, [
      [6, 3000],
      [12, 2850],
      [18, 2850],
      [24, 2694],
      [30, 2694],
    ]),
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

export function findSetOption(
  rule: Extract<PricingRule, { kind: "set" }>,
  pieces: number,
): SetOption | null {
  return rule.sets.find((s) => s.pieces === pieces) ?? null;
}

/**
 * Entry price for a product with a rule — used for "From ₹X" catalogue cards.
 * Tiered: the single-unit base price. Set: the smallest set's total (which is
 * also what the product page shows by default).
 */
export function getFromPrice(slug: string | undefined | null): number | null {
  const rule = getPricingRule(slug);
  if (!rule) return null;
  if (rule.kind === "set") {
    return rule.sets[0].total;
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
  return { unitPrice: line.price, lineTotal: line.price * line.quantity };
}

/**
 * Authoritative line total for any cart/checkout line.
 * - tiered: computed from quantity
 * - set:    set total (looked up by `setPieces`) × quantity (number of sets)
 * - no rule / bad input: null → caller falls back to WooCommerce's own price
 */
export function resolveLineTotal(args: {
  slug: string | undefined | null;
  quantity: number;
  setPieces?: number | null;
}): number | null {
  const rule = getPricingRule(args.slug);
  if (!rule) return null;
  const qty = Math.max(1, Math.floor(args.quantity) || 1);

  if (rule.kind === "tiered") {
    return priceTiered(rule, qty).lineTotal;
  }

  const opt = args.setPieces ? findSetOption(rule, args.setPieces) : null;
  if (!opt) return null;
  return opt.total * qty;
}
