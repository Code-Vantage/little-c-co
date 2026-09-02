export type CollectionItem = {
  slug: string;
  label: string;
  title: string;
  eyebrow: string;
  description: string;
  image?: string;
  sourceCategories: string[];
  // When true, the `/shop/[slug]` page still exists but the collection is not
  // listed in the header Shop dropdown. Used for edits that are surfaced
  // elsewhere (e.g. as suggestions inside "Curate your hamper").
  hideFromNav?: boolean;
};

// Shop collections mirror the `services.ts` pattern: each collection is a curated
// view over one or more WooCommerce product category names. `sourceCategories`
// must match the WooCommerce category name exactly.
// NOTE: descriptions below are placeholders — replace when final copy arrives.
export const collections: CollectionItem[] = [
  {
    slug: "little-stuff",
    label: "Little Stuff",
    title: "Little Stuff",
    eyebrow: "Curated edit",
    description:
      "Small handcrafted pieces and everyday keepsakes — thoughtful little details made to gift, keep, and personalise.",
    image: "/collections/little-stuff.webp",
    sourceCategories: ["Little Stuff"],
  },
  {
    slug: "wedding-details",
    label: "Wedding Details",
    title: "Wedding Details",
    eyebrow: "Curated edit",
    description:
      "Personalised details for the ceremony and celebration — invitations, place settings, signage, and keepsakes for the day.",
    image: "/collections/wedding-details.webp",
    sourceCategories: ["Wedding Details"],
  },
  {
    slug: "the-table-edit",
    label: "The Table Edit",
    title: "The Table Edit",
    eyebrow: "Curated edit",
    description:
      "Handpainted and engraved pieces for the table — napkins, cutlery, place cards, and details that set the scene.",
    image: "/collections/the-table-edit.webp",
    sourceCategories: ["The Table Edit"],
  },
  {
    slug: "for-your-bridesmaids",
    label: "For your Bridesmaids",
    title: "For your Bridesmaids",
    eyebrow: "Curated edit",
    description:
      "Personalised gifting for the people standing beside you — keepsakes and details to say thank you.",
    image: "/collections/for-your-bridesmaids.webp",
    sourceCategories: ["For your Bridesmaids"],
    hideFromNav: true,
  },
  {
    slug: "for-a-babyshower-event",
    label: "For a Babyshower Event",
    title: "For a Babyshower Event",
    eyebrow: "Curated edit",
    description:
      "Soft, celebratory details and keepsakes for welcoming a little one.",
    image: "/collections/for-a-babyshower-event.webp",
    sourceCategories: ["For a Babyshower Event"],
    hideFromNav: true,
  },
  {
    slug: "for-couples",
    label: "For Couples",
    title: "For Couples",
    eyebrow: "Curated edit",
    description:
      "Personalised keepsakes for anniversaries, engagements, and everyday milestones shared by two.",
    image: "/collections/for-couples.webp",
    sourceCategories: ["For Couples"],
    hideFromNav: true,
  },
  {
    slug: "for-corporate",
    label: "For Corporate",
    title: "For Corporate",
    eyebrow: "Curated edit",
    description:
      "Considered, personalised gifting for teams, clients, and events — crafted with the same care as everything else.",
    image: "/collections/for-corporate.webp",
    sourceCategories: ["For Corporate"],
    hideFromNav: true,
  },
];

// Collections shown in the header Shop dropdown, in order. Excludes edits that
// are surfaced elsewhere (see `hideFromNav`).
export const navCollections = collections.filter((collection) => !collection.hideFromNav);

export function getCollectionBySlug(slug: string) {
  return collections.find((collection) => collection.slug === slug) ?? null;
}
