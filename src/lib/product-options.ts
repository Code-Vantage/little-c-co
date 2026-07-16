import type { OptionChoice, ProductOptionSchema, StoreProduct } from "@/lib/types";

// All customer-facing copy in this file is transcribed verbatim from
// `products.txt`, which is the ground truth for product customization content.
// Do not paraphrase, shorten, or drop wording when editing these schemas.

// Helper: turn a list of plain strings into OptionChoice[] (value === label).
function choices(...values: string[]): OptionChoice[] {
  return values.map((value) => ({ value, label: value }));
}

// ---------------------------------------------------------------------------
// PRODUCT 1 — Personalised Frame
// ---------------------------------------------------------------------------
const FRAME: ProductOptionSchema = {
  type: "frame",
  title: "Personalised Frame",
  options: [
    {
      kind: "radio",
      id: "style",
      label: "Style",
      help: "Choose your preferred artwork style.",
      required: true,
      options: [
        {
          value: "Doily Paper",
          label: "Doily Paper",
          description:
            "Handwritten calligraphy on premium doily paper, beautifully displayed within the glass frame.",
        },
        {
          value: "Glass Engraving",
          label: "Glass Engraving",
          description:
            "Precision engraving on the front glass surface, with optional decorative finishes.",
        },
      ],
    },
    {
      kind: "select",
      id: "frame_size",
      label: "Frame Size",
      help: "Select your preferred frame shape and size.",
      required: true,
      groups: [
        { label: "Rectangle", options: choices("5 × 7 in", "8 × 6 in", "8 × 10 in") },
        { label: "Square", options: choices("6 × 6 in", "8 × 8 in", "10 × 10 in") },
      ],
    },
    {
      kind: "radio",
      id: "botanical_accents",
      label: "Botanical Accents",
      help: "Add delicate natural elements to your artwork.",
      required: true,
      options: choices("Dried Flora", "No Florals"),
    },
    {
      kind: "radio",
      id: "decorative_accents",
      label: "Decorative Accents",
      help: "Enhance your design with subtle decorative details.",
      required: true,
      options: choices("Gold Flakes", "No Flakes"),
    },
    {
      kind: "radio",
      id: "calligraphy_ink",
      label: "Calligraphy Ink",
      help: "Available for Doily Paper artwork only.",
      required: true,
      options: choices("Black", "Red"),
      showIf: { optionId: "style", equals: "Doily Paper" },
    },
    {
      kind: "radio",
      id: "engraving_finish",
      label: "Engraving Finish",
      help: "Available for Glass Engraving only.",
      required: true,
      options: choices("Gold Fill", "Natural Finish"),
      showIf: { optionId: "style", equals: "Glass Engraving" },
    },
    {
      kind: "textarea",
      id: "personalisation",
      label: "Personalisation",
      help: "Enter your quote, message, name, date or any special text you'd like included.",
      required: false,
    },
    {
      kind: "textarea",
      id: "special_request",
      label: "Special Request",
      help: "Share any special requests, gifting occasion, recipient details, or ideas you'd like us to consider while creating your artwork",
      required: false,
    },
  ],
};

// ---------------------------------------------------------------------------
// PRODUCT 2 — Handwritten Letter in an Engraved Glass Box
// ---------------------------------------------------------------------------
const LETTER_GLASS_BOX: ProductOptionSchema = {
  type: "letter-glass-box",
  title: "Handwritten Letter in an Engraved Glass Box",
  options: [
    {
      kind: "radio",
      id: "letter_style",
      label: "Letter Style",
      help: "Choose how you'd like your letter to be presented.",
      required: true,
      options: [
        {
          value: "Handwritten Calligraphy",
          label: "Handwritten Calligraphy",
          description:
            "Your message is carefully handwritten in modern calligraphy on premium paper and delicately rolled to fit inside the glass box.",
        },
        {
          value: "Printed Letter",
          label: "Printed Letter",
          description:
            "Your message is professionally printed in a timeless serif font for a clean, elegant finish.",
        },
      ],
    },
    {
      kind: "select",
      id: "glass_box",
      label: "Glass Box",
      help: "Select your keepsake box.",
      required: true,
      groups: [{ label: "Rectangle", options: choices("9 × 2 × 2 in") }],
    },
    {
      kind: "radio",
      id: "glass_engraving",
      label: "Glass Engraving",
      help: "Personalise the glass box with name(s), initials, date or short quote.",
      required: true,
      options: choices("Engraving", "No Engraving Needed"),
    },
    {
      kind: "radio",
      id: "decorative_accents",
      label: "Decorative Accents",
      help: "Enhance your design with subtle decorative details.",
      required: true,
      options: choices("Gold Flakes", "No Flakes"),
    },
    {
      kind: "radio",
      id: "calligraphy_ink",
      label: "Calligraphy Ink",
      required: true,
      options: choices("Black", "Red", "Gold"),
    },
    {
      kind: "radio",
      id: "engraving_finish",
      label: "Engraving Finish (Optional)",
      help: "Select the finish for your engraved glass.",
      required: false,
      options: choices("Gold Fill", "Natural Finish"),
      showIf: { optionId: "glass_engraving", equals: "Engraving" },
    },
    {
      kind: "textarea",
      id: "letter_content",
      label: "Letter Content",
      help: "Enter the letter, vows, poem, message, or any text you'd like handwritten or printed inside the glass box.",
      required: true,
    },
    {
      kind: "text",
      id: "glass_engraving_text",
      label: "Glass Engraving Text (Optional)",
      help: "Custom text. Suggestions above.",
      required: false,
      showIf: { optionId: "glass_engraving", equals: "Engraving" },
    },
    {
      kind: "textarea",
      id: "special_request",
      label: "Special Request",
      help: "Share any special requests, gifting occasion, recipient details, or ideas you'd like us to consider while creating your keepsake.",
      required: false,
    },
  ],
};

// ---------------------------------------------------------------------------
// PRODUCT 3 — Personalised Compact Mirror (bulk)
// ---------------------------------------------------------------------------
const COMPACT_MIRROR: ProductOptionSchema = {
  type: "compact-mirror",
  title: "Personalised Compact Mirror",
  options: [
    {
      kind: "radio",
      id: "engraving_location",
      label: "Engraving Location",
      help: "Choose where you'd like your personalised engraving to be featured.",
      required: true,
      options: [
        {
          value: "Exterior Engraving",
          label: "Exterior Engraving",
          description:
            "Your personalised design is delicately engraved on the outer surface of the compact mirror for a timeless and elegant finish.",
        },
        {
          value: "Interior Engraving",
          label: "Interior Engraving",
          description:
            "A hidden personalised message engraved inside the compact, creating a meaningful detail revealed whenever it is opened.",
        },
      ],
    },
    { kind: "quantity", id: "quantity", label: "Quantity", min: 1 },
    {
      kind: "radio",
      id: "mirror_colour",
      label: "Mirror Colour",
      help: "Select the finish that best complements your design.",
      required: true,
      options: choices("Gold", "Silver"),
    },
    {
      kind: "select",
      id: "mirror_size",
      label: "Mirror Size",
      help: "Select your compact mirror size.",
      required: true,
      groups: [{ label: "Round Compact Mirror", options: choices("2.76 in") }],
    },
    {
      kind: "radio",
      id: "engraving_fill",
      label: "Engraving Fill",
      help: "Select the colour finish of your engraved details.",
      required: true,
      options: choices("Gold Fill", "Silver Fill", "Natural Finish"),
    },
    {
      kind: "textarea",
      id: "personalisation",
      label: "Personalisation",
      help: "Enter your name(s), initials, wedding date, or any special text you'd like included.",
      required: false,
    },
    {
      kind: "textarea",
      id: "special_request",
      label: "Special Request",
      help: "Share any special requests, gifting occasion, recipient details, or ideas you'd like us to consider while creating your personalised mirror.",
      required: false,
    },
  ],
};

// ---------------------------------------------------------------------------
// PRODUCT 4 — Personalised Cake Knife & Server Set
// ---------------------------------------------------------------------------
const CAKE_SET: ProductOptionSchema = {
  type: "cake-set",
  title: "Personalised Cake Knife & Server Set",
  options: [
    {
      kind: "radio",
      id: "set_colour",
      label: "Set Colour",
      help: "Select the finish that best complements your celebration.",
      required: true,
      options: choices("Gold", "Silver"),
    },
    { kind: "quantity", id: "quantity", label: "Quantity", min: 1 },
    {
      kind: "radio",
      id: "engraving_details",
      label: "Engraving Details",
      help: "Choose your preferred engraving style.",
      required: true,
      options: [
        { value: "Cake Knife Engraving", label: "Cake Knife Engraving" },
        { value: "Cake Server Engraving", label: "Cake Server Engraving" },
        {
          value: "Both",
          label: "Both",
          description:
            "Custom engraving on both the cake knife and server, creating a coordinated and elegant set designed for your special occasion.",
        },
      ],
    },
    {
      kind: "note",
      id: "custom_engraving_heading",
      label: "Custom Engraving",
      help: "Personalise each piece with meaningful details.",
    },
    {
      kind: "text",
      id: "engraving_knife",
      label: "Cake Knife",
      help: "Enter initials, names, date, quote, prefix, or any special text you'd like engraved on the knife.",
      required: false,
      showIf: { optionId: "engraving_details", equals: ["Cake Knife Engraving", "Both"] },
    },
    {
      kind: "text",
      id: "engraving_server",
      label: "Cake Server",
      help: "Enter initials, names, date, quote, prefix, or any special text you'd like engraved on the server.",
      required: false,
      showIf: { optionId: "engraving_details", equals: ["Cake Server Engraving", "Both"] },
    },
    {
      kind: "radio",
      id: "engraving_fill",
      label: "Engraving Fill",
      help: "Select the colour finish of your engraved details.",
      required: true,
      options: choices("Silver Fill", "Natural Finish"),
    },
    {
      kind: "select",
      id: "personalisation_ideas",
      label: "Personalisation Ideas",
      help: "Create a design that reflects your celebration.",
      required: false,
      options: choices(
        "Date",
        "Initials",
        "Quote",
        "Prefix (Mr. & Mrs.) & Last Name",
        "Custom Text",
      ),
    },
    {
      kind: "text",
      id: "personalisation_ideas_custom_text",
      label: "Custom Text",
      required: false,
      showIf: { optionId: "personalisation_ideas", equals: "Custom Text" },
    },
    {
      kind: "textarea",
      id: "special_request",
      label: "Special Request",
      help: "Share any special requests, gifting occasion, recipient details, design preferences, or ideas you'd like us to consider while creating your personalised set.",
      required: false,
    },
  ],
};

// ---------------------------------------------------------------------------
// PRODUCT 5 — Handpainted Signage (Material → Shape → Size dependent chain)
// ---------------------------------------------------------------------------
// Composite parent key is `${material}|${shape}`. Materials/shapes without a
// listed size table are "custom size upon request" and yield no dropdown sizes.
const SIGNAGE: ProductOptionSchema = {
  type: "signage",
  title: "Handpainted Signage",
  options: [
    {
      kind: "radio",
      id: "signage_type",
      label: "Signage Type",
      help: "Choose the type of signage you'd like.",
      required: true,
      options: [
        {
          value: "Food & Drinks Menu",
          label: "Food & Drinks Menu (For intimate and small hosting events only)",
          description:
            "Handpainted menu signage featuring elegant calligraphy with custom illustrations inspired by the food and beverages being served.",
        },
        {
          value: "Seating Arrangement Chart",
          label: "Seating Arrangement Chart (For intimate and small hosting events only)",
          description:
            "A handpainted seating display featuring guest names and table assignments, designed to suit your event theme.",
        },
      ],
    },
    {
      kind: "radio",
      id: "material",
      label: "Material",
      required: true,
      options: [
        { value: "White Canvas", label: "White Canvas" },
        { value: "Black Canvas", label: "Black Canvas" },
        { value: "MDF Wooden Board", label: "MDF Wooden Board" },
        {
          value: "Linen Fabric",
          label: "Linen Fabric",
          description: "Available in custom sizes upon request.",
        },
      ],
    },
    {
      kind: "radio",
      id: "shape",
      label: "Shape",
      required: true,
      options: [
        { value: "Rectangle", label: "Rectangle" },
        { value: "Square", label: "Square" },
        {
          value: "Arched Rectangle",
          label: "Arched Rectangle",
          description: "Available in custom sizes upon request.",
        },
      ],
    },
    {
      kind: "select",
      id: "size",
      label: "Size",
      help: "Sizes shown apply to your chosen material and shape. Custom sizes available upon request.",
      required: false,
      dependsOn: "material|shape",
      optionsByParent: {
        "White Canvas|Rectangle": choices(
          "12 × 14 in",
          "14 × 18 in",
          "16 × 20 in",
          "18 × 24 in",
          "24 × 36 in",
        ),
        "White Canvas|Square": choices(
          "12 × 12 in",
          "16 × 16 in",
          "18 × 18 in",
          "24 × 24 in",
        ),
        "Black Canvas|Rectangle": choices("8 × 10 in", "10 × 12 in", "12 × 16 in"),
        "Black Canvas|Square": choices("10 × 10 in", "12 × 12 in"),
        "MDF Wooden Board|Rectangle": choices("12 × 19 in", "24 × 36 in"),
        "MDF Wooden Board|Square": choices("14 × 14 in", "16 × 16 in", "18 × 18 in"),
      },
    },
    {
      kind: "radio",
      id: "illustration_style",
      label: "Illustration Style",
      required: true,
      options: choices(
        "Signature Doodle Artwork",
        "Handpainted Illustrated Artwork",
        "No Illustrations",
      ),
    },
    {
      kind: "radio",
      id: "calligraphy_ink",
      label: "Calligraphy Ink",
      required: true,
      options: choices("Black", "Red", "White", "Blue", "Green"),
    },
    {
      kind: "textarea",
      id: "personalisation",
      label: "Personalisation",
      help: "Enter your menu items, seating details, event names, dates, welcome message, or any wording you'd like included on your signage.",
      required: false,
    },
    {
      kind: "textarea",
      id: "special_request",
      label: "Special Request",
      help: "Share your event theme, colour palette, reference images, preferred illustration preferences, or any special requests you'd like us to consider while creating your signage.",
      required: false,
    },
  ],
  afterCart: [
    {
      kind: "note",
      id: "please_note",
      label: "Please Note",
      items: [
        "Pricing varies depending on the signage type, material, size, shape, and level of illustration.",
        "Each signage piece is individually handpainted and hand-lettered, making every creation one of a kind.",
        "Suitable for intimate celebrations and small hosting events.",
        "Custom sizes and bespoke signage designs are available upon request.",
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// PRODUCT 6 — Personalised Glass Ring Box
// ---------------------------------------------------------------------------
const RING_BOX: ProductOptionSchema = {
  type: "ring-box",
  title: "Personalised Glass Ring Box",
  options: [
    {
      kind: "radio",
      id: "box_size",
      label: "Box Size",
      required: true,
      options: [
        {
          value: "3 × 3 in",
          label: "3 × 3 in",
          description:
            "Perfect for engagement rings, wedding bands, proposal photos, and ceremony styling.",
        },
      ],
    },
    {
      kind: "radio",
      id: "botanical_accents",
      label: "Botanical Accents",
      help: "Add delicate natural elements to complement your design.",
      required: true,
      options: choices("Dried Flora", "No Florals"),
    },
    {
      kind: "text",
      id: "custom_engraving",
      label: "Custom Engraving",
      help: "Enter the names, initials, date, or short text you'd like engraved on your glass ring box.",
      required: false,
    },
    {
      kind: "radio",
      id: "engraving_finish",
      label: "Engraving Finish",
      help: "Choose your preferred engraving finish.",
      required: true,
      options: choices("Gold Fill", "Natural Finish"),
    },
    {
      kind: "textarea",
      id: "personalisation_ideas",
      label: "Personalisation Ideas",
      help: "Choose your preferred engraving design. For example: Mr. & Mrs., Bride & Groom, Names & Date, Date, Initials, or Short Text.",
      required: false,
    },
    {
      kind: "textarea",
      id: "special_request",
      label: "Special Request",
      help: "Share any special requests, gifting occasion, preferred layout, or design details you'd like us to consider while creating your personalised ring box.",
      required: false,
    },
  ],
};

// ---------------------------------------------------------------------------
// PRODUCT 7 — Personalised Wine Glass (bulk)
// ---------------------------------------------------------------------------
const WINE_GLASS: ProductOptionSchema = {
  type: "wine-glass",
  title: "Personalised Wine Glass",
  options: [
    { kind: "quantity", id: "quantity", label: "Quantity", min: 1 },
    {
      kind: "radio",
      id: "botanical_accents",
      label: "Botanical Accents",
      help: "Delicate hand-painted botanical accents paired with your personalised engraving for an elegant finish.",
      required: true,
      options: choices("Handpainted Botanicals", "No Botanicals"),
    },
    {
      kind: "radio",
      id: "engraving_placement",
      label: "Engraving Placement",
      help: "Choose where you'd like your engraving.",
      required: true,
      options: choices("Front Only", "Front & Back"),
    },
    {
      kind: "radio",
      id: "engraving_finish",
      label: "Engraving Finish",
      help: "Select your preferred finish.",
      required: true,
      options: choices("Natural Finish", "Gold Fill", "Silver Fill"),
    },
    {
      kind: "textarea",
      id: "personalisation",
      label: "Personalisation",
      help: "Enter the name(s), quote, date, initials, or any special text you'd like engraved.",
      required: false,
    },
    {
      kind: "textarea",
      id: "special_request",
      label: "Special Request",
      help: "Share any custom design ideas, gifting occasion, recipient details, or other requests you'd like us to consider while creating your personalised wine glass.",
      required: false,
    },
  ],
};

// ---------------------------------------------------------------------------
// PRODUCT 8 — Personalised Gift (local delivery only; photo upload)
// ---------------------------------------------------------------------------
const CURATED_GIFT: ProductOptionSchema = {
  type: "curated-gift",
  title: "Personalised Gift",
  options: [
    {
      kind: "radio",
      id: "gift_type",
      label: "Gift Type",
      help: "Choose your preferred personalised item.",
      required: true,
      options: choices("Mug", "Tumbler", "Keychain", "Book", "Other (Specify in Special Request)"),
    },
    {
      kind: "radio",
      id: "gift_presentation",
      label: "Gift Presentation",
      help: "Select your preferred gift packaging.",
      required: true,
      options: choices("Gift Box", "Gift Basket"),
    },
    {
      kind: "radio",
      id: "photograph",
      label: "Photograph",
      help: "Include a cherished photo with your gift.",
      required: true,
      options: choices("Yes", "No"),
    },
    {
      kind: "file",
      id: "photo_upload",
      label: "Upload Photo",
      accept: "image/*",
      maxSizeMB: 10,
      showIf: { optionId: "photograph", equals: "Yes" },
    },
    {
      kind: "radio",
      id: "floral_addon",
      label: "Floral Add-On",
      help: "Complete your gift with fresh flowers.",
      required: true,
      options: choices("Fresh Flower Bouquet", "Dried Floral Bouquet", "No Flowers"),
    },
    {
      kind: "radio",
      id: "greeting_card",
      label: "Greeting Card",
      help: "Add a personalised greeting card with your gift.",
      required: true,
      options: choices("Yes", "No"),
    },
    {
      kind: "text",
      id: "greeting_card_occasion",
      label: "Greeting Card Occasion",
      help: "Mention the occasion for your greeting card.",
      required: true,
      showIf: { optionId: "greeting_card", equals: "Yes" },
    },
    {
      kind: "textarea",
      id: "personalisation",
      label: "Personalisation",
      help: "Enter the name, personalised message, date, or any special text you'd like included.",
      required: false,
    },
    {
      kind: "textarea",
      id: "special_request",
      label: "Special Request",
      help: "Share the occasion, recipient details, preferred colours, gift theme, wrapping preferences, or any custom ideas you'd like us to consider while creating your personalised gift.",
      required: false,
    },
  ],
};

// ---------------------------------------------------------------------------
// PRODUCT 9 — Personalised Greeting Card
// ---------------------------------------------------------------------------
const DOODLE_ILLUSTRATION_OPTIONS = [
  "Floral Doodles",
  "Birthday Theme",
  "Wedding Theme",
  "Baby Theme",
  "Anniversary Theme",
  "Celebration Theme",
  "Custom Doodle",
];

const GREETING_CARD: ProductOptionSchema = {
  type: "greeting-card",
  title: "Personalised Greeting Card",
  options: [
    {
      kind: "radio",
      id: "style",
      label: "Style",
      help: "Choose your preferred card style.",
      required: true,
      options: [
        {
          value: "Handwritten Calligraphy",
          label: "Handwritten Calligraphy",
          description: "Beautifully hand-lettered with your personalised message.",
        },
      ],
    },
    {
      kind: "radio",
      id: "doodle_illustration",
      label: "Doodle Illustration (Optional)",
      help: "Add simple hand-drawn doodles to the card",
      required: false,
      options: choices(...DOODLE_ILLUSTRATION_OPTIONS),
    },
    {
      kind: "text",
      id: "doodle_idea",
      label: "Doodle Idea",
      help: "Tell us what you'd like doodled. For example: flowers, birthday cake, wedding rings or any other occasion specific detail to match your gift.",
      required: false,
      // Shown whenever any doodle illustration is chosen (not only "Custom Doodle").
      showIf: { optionId: "doodle_illustration", equals: DOODLE_ILLUSTRATION_OPTIONS },
    },
    {
      kind: "radio",
      id: "card_size",
      label: "Card Size",
      help: "Select your preferred size.",
      required: true,
      options: choices("A2", "A6"),
    },
    {
      kind: "radio",
      id: "paper_finish",
      label: "Paper Finish",
      help: "Choose your preferred paper.",
      required: true,
      options: choices("Smooth", "Textured"),
    },
    {
      kind: "radio",
      id: "decorative_accents",
      label: "Decorative Accents",
      help: "Enhance your design with elegant finishing touches.",
      required: true,
      options: choices("Gold Foil Details", "No Foil"),
    },
    {
      kind: "radio",
      id: "envelope",
      label: "Envelope",
      help: "Complete your greeting card with a special sealed envelope.",
      required: true,
      options: choices("Kraft Envelope", "No Envelope"),
    },
    {
      kind: "textarea",
      id: "personalisation",
      label: "Personalisation",
      help: "Enter your message, recipient name, occasion in detail, or any special text you'd like included.",
      required: false,
    },
    {
      kind: "textarea",
      id: "special_request",
      label: "Special Request",
      help: "Share your preferred colours, theme, or any custom requests you'd like us to consider while creating your greeting card.",
      required: false,
    },
  ],
};

export const PRODUCT_OPTION_SCHEMAS: Record<string, ProductOptionSchema> = {
  frame: FRAME,
  "letter-glass-box": LETTER_GLASS_BOX,
  "compact-mirror": COMPACT_MIRROR,
  "cake-set": CAKE_SET,
  signage: SIGNAGE,
  "ring-box": RING_BOX,
  "wine-glass": WINE_GLASS,
  "curated-gift": CURATED_GIFT,
  "greeting-card": GREETING_CARD,
};

// Fallback: map a product's WooCommerce category name to a schema type when the
// `customization_type` custom field is not set.
const CATEGORY_TO_TYPE: Record<string, string> = {
  frame: "frame",
  frames: "frame",
  "personalised frame": "frame",
  "letter glass box": "letter-glass-box",
  "glass box": "letter-glass-box",
  "compact mirror": "compact-mirror",
  mirrors: "compact-mirror",
  "cake set": "cake-set",
  "cake knife & server set": "cake-set",
  signage: "signage",
  signs: "signage",
  "ring box": "ring-box",
  "wine glass": "wine-glass",
  "wine glasses": "wine-glass",
  gift: "curated-gift",
  gifts: "curated-gift",
  "personalised gift": "curated-gift",
  "greeting card": "greeting-card",
  "greeting cards": "greeting-card",
  "personalised greeting card": "greeting-card",
};

/**
 * Resolve which option schema a product should use. Prefers the explicit
 * `customization_type` custom field; falls back to a category-name match.
 * Returns null when the product has no matching schema (legacy products).
 */
export function resolveOptionType(product: StoreProduct): string | null {
  const explicit = product.customizationType?.trim().toLowerCase();
  if (explicit && PRODUCT_OPTION_SCHEMAS[explicit]) {
    return explicit;
  }

  for (const category of product.categories ?? []) {
    const mapped = CATEGORY_TO_TYPE[category.trim().toLowerCase()];
    if (mapped && PRODUCT_OPTION_SCHEMAS[mapped]) {
      return mapped;
    }
  }

  return null;
}

export function getSchemaForProduct(product: StoreProduct): ProductOptionSchema | null {
  const type = resolveOptionType(product);
  return type ? PRODUCT_OPTION_SCHEMAS[type] : null;
}
