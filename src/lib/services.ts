export type ServiceItem = {
  slug: string;
  label: string;
  title: string;
  eyebrow: string;
  description: string;
  image: string;
  detailOneLabel: string;
  detailOneText: string;
  sourceCategories: string[];
};

export const services: ServiceItem[] = [
  {
    slug: "foil-stamping",
    label: "Foil stamping",
    title: "Foil stamping",
    eyebrow: "Foil impressions",
    description:
      "A design is pressed onto the surface using heat and foil, leaving behind a crisp, polished impression. Choose from classic metallic finishes for a subtle touch of shine.",
    image: "/services/heatfoiling.webp",
    detailOneLabel: "Crafted across surfaces",
    detailOneText: "Paper · Leather · Card",
    sourceCategories: ["Foil stamping"],
  },
  {
    slug: "engraving",
    label: "Hand Engraving",
    title: "Hand Engraving",
    eyebrow: "Precision engraved",
    description:
      "Each piece is engraved by hand, one detail at a time. The design is carefully marked and etched onto the surface to create a clean, permanent finish — made especially for you.",
    image: "/services/engraving.webp",
    detailOneLabel: "Crafted across surfaces",
    detailOneText: "Metal · Glass · Wood",
    sourceCategories: ["Engraving"],
  },
  {
    slug: "calligraphy",
    label: "Modern Calligraphy",
    title: "Modern Calligraphy",
    eyebrow: "The art of lettering",
    description:
      "Each piece is lettered by hand, giving your words the natural character of handwritten type. From names to notes and details, every line is written specifically for the piece it belongs to.",
    image: "/services/calligraphy.webp",
    detailOneLabel: "Crafted across surfaces",
    detailOneText: "Paper · Fabric · Wood · Acrylic",
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
