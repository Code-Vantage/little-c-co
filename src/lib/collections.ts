export type CollectionItem = {
  slug: string;
  label: string;
  title: string;
  eyebrow: string;
  description: string;
  image?: string;
  sourceCategories: string[];
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
  },
];

export function getCollectionBySlug(slug: string) {
  return collections.find((collection) => collection.slug === slug) ?? null;
}
