export type ServiceItem = {
  slug: string;
  label: string;
  title: string;
  eyebrow: string;
  description: string;
  image: string;
  detailOneLabel: string;
  detailOneText: string;
  detailTwoLabel: string;
  detailTwoText: string;
  sourceCategories: string[];
};

export const services: ServiceItem[] = [
  {
    slug: "heat-foiling",
    label: "Heat foiling",
    title: "Heat foiling",
    eyebrow: "Foil impressions",
    description:
      "Heat foiling brings a luminous metallic finish to invitations, stationery, gifting pieces, and event details, adding polish, depth, and a quietly luxurious feel.",
    image: "/services/heatfoiling.webp",
    detailOneLabel: "Ideal for",
    detailOneText:
      "Invitations, menus, keepsake cards, name details, and elevated paper goods that benefit from a refined metallic finish.",
    detailTwoLabel: "Finish",
    detailTwoText:
      "Crisp foil impressions with a warm reflective quality that adds depth without overwhelming the design.",
    sourceCategories: ["Heat foiling"],
  },
  {
    slug: "engraving",
    label: "Engraving",
    title: "Engraving",
    eyebrow: "Precision engraved",
    description:
      "Engraving offers crisp, permanent personalization for keepsakes and gifting pieces, with a timeless finish that feels precise, lasting, and quietly elegant.",
    image: "/services/engraving.webp",
    detailOneLabel: "Ideal for",
    detailOneText:
      "Boxes, plaques, keychains, glassware, and personal keepsakes that call for durable detail and a more classic presentation.",
    detailTwoLabel: "Finish",
    detailTwoText:
      "Fine engraved lines and sharply defined lettering that feel permanent, tactile, and beautifully understated.",
    sourceCategories: ["Engraving"],
  },
  {
    slug: "calligraphy",
    label: "Calligraphy",
    title: "Calligraphy",
    eyebrow: "The art of lettering",
    description:
      "Calligraphy brings expressive, hand-lettered character to celebrations, gifting, decor, and custom pieces, making each detail feel personal and thoughtfully made.",
    image: "/services/calligraphy.webp",
    detailOneLabel: "Ideal for",
    detailOneText:
      "Place cards, framed artwork, event signage, letters, gifting details, and custom pieces designed to feel intimate and one of a kind.",
    detailTwoLabel: "Finish",
    detailTwoText:
      "Fluid hand lettering with an elegant rhythm, balanced composition, and a bespoke studio-made feel.",
    sourceCategories: ["Calligraphy + Doodle Art"],
  },
  // Leafing temporarily hidden from nav/site — keep entry here to re-enable later.
  // {
  //   slug: "leafing",
  //   label: "Leafing",
  //   title: "Leafing",
  //   eyebrow: "Gilded details",
  //   description:
  //     "Leafing adds hand-finished metallic accents that bring softness, texture, and a more artisanal sense of luxury to bespoke pieces and event details.",
  //   image: "/services/leafing.webp",
  //   detailOneLabel: "Ideal for",
  //   detailOneText:
  //     "Frames, monograms, celebration pieces, place details, and decorative surfaces that need warmth, shimmer, and visual depth.",
  //   detailTwoLabel: "Finish",
  //   detailTwoText:
  //     "Gilded highlights with a hand-applied character that catches the light beautifully and feels richly crafted.",
  //   sourceCategories: ["Leafing"],
  // },
];

export function getServiceBySlug(slug: string) {
  return services.find((service) => service.slug === slug) ?? null;
}
