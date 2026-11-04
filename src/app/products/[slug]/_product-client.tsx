"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { StoreProduct } from "@/lib/types";
import { getSchemaForProduct } from "@/lib/product-options";
import {
  getFromPrice,
  getPricingRule,
  priceSet,
  priceTiered,
} from "@/lib/pricing";
import { useCartStore } from "../../../lib/cart-store";
import { NoteBlock, ProductOptions } from "./_product-options";

// Videos hosted in /public (the WordPress plan does not accept video uploads).
const PRODUCT_VIDEOS: Record<string, string> = {
  "handpainted-linen-welcome-signage": "/videos/linen-welcome-signage.mp4",
};

function inr(value: number) {
  return value.toLocaleString("en-IN");
}

const MATERIAL_BY_SCHEMA_TYPE: Record<string, "linen" | "metal" | "glass"> = {
  "tote-bag": "linen",
  napkins: "linen",
  signage: "linen",
  "compact-mirror": "metal",
  "card-holder": "metal",
  cutlery: "metal",
  "wine-glass": "glass",
  "ring-box": "glass",
  "letter-glass-box": "glass",
  frame: "glass",
};

const PRODUCT_DETAILS_BY_SCHEMA_TYPE: Record<string, string> = {
  frame:
    "Available as Doily Paper or Glass Engraving, in rectangle sizes from 5 × 7 in to 8 × 10 in or square sizes from 6 × 6 in to 10 × 10 in, with optional dried florals and gold flake accents.",
  "letter-glass-box":
    "Your letter is presented inside a 9 × 2 × 2 in glass keepsake box, as handwritten calligraphy or a printed letter, with optional engraving on the glass itself.",
  "compact-mirror":
    "A 2.76 in round compact mirror in Gold or Silver, with your personalisation engraved on the interior or exterior.",
  "cake-set":
    "A cake knife & server set in Gold or Silver, with engraving available on the knife, the server, or both.",
  signage:
    "Handpainted as a Food & Drinks Menu or Seating Arrangement Chart, on White Canvas, Black Canvas, MDF Wooden Board, or Linen Fabric, in rectangle, square, or arched shapes.",
  "ring-box":
    "A 3 × 3 in glass ring box suited to rings, wedding bands, and proposal styling, with optional dried florals and custom engraving.",
  "wine-glass":
    "Engraved on the front only or front & back, with an option to add handpainted botanical accents.",
  "curated-gift":
    "Choose a Mug, Tumbler, Keychain, Book, or another item of your choice, presented in a gift box or basket, with optional photo, floral add-on, and greeting card.",
  "greeting-card":
    "A hand-lettered card in A2 or A6 size, on smooth or textured paper, with optional doodle illustration, gold foil detailing, and a kraft envelope.",
  "tote-bag":
    "A handpainted linen tote in Dark Blue, Black, or Ivory, with your choice of calligraphy text and an optional handpainted illustration.",
  "card-holder":
    "Available in Gold or Silver, with your personalisation engraved in your choice of fill.",
  "place-cards":
    "Available as Folded, Doily, or Ribbon style place cards, in a range of colours to match your table setting.",
  napkins:
    "Handpainted linen napkins in Ivory, Blue, or a special request colour, with an optional matching illustration.",
  cutlery:
    "An engraved cutlery set in Gold, Rose Gold, or Silver, with engraving available on the knife, the spoon, or both.",
};

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="mb-2 block font-(family-name:--font-body) text-sm uppercase tracking-[0.18em] text-black/48">
      {children}
    </label>
  );
}

function ProductInfoDropdown({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <details className="group border-b border-black/10">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-(family-name:--font-body) text-sm uppercase tracking-[0.2em] text-black [&::-webkit-details-marker]:hidden">
        {title}
        <span className="text-xl font-light leading-none transition-transform group-open:rotate-45" aria-hidden="true">
          +
        </span>
      </summary>
      <div className="pb-5 font-(family-name:--font-body) text-[0.98rem] leading-7 text-black/76">
        {children}
      </div>
    </details>
  );
}

function QtyStepper({
  label,
  value,
  onChange,
  min = 1,
  max,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="flex h-12 w-fit items-center border border-black/15">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="h-full w-12 border-r border-black/15 font-(family-name:--font-body) text-xl transition-colors hover:bg-black/5"
          aria-label={`Decrease ${label}`}
        >
          −
        </button>
        <span className="flex h-full w-16 items-center justify-center font-(family-name:--font-body) text-lg">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(max ? Math.min(max, value + 1) : value + 1)}
          className="h-full w-12 border-l border-black/15 font-(family-name:--font-body) text-xl transition-colors hover:bg-black/5"
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}

function RelatedProductCard({ product }: { product: StoreProduct }) {
  const image = product.images[0];
  const fromPrice = getFromPrice(product.slug);
  const salePrice = Number(product.price).toLocaleString("en-IN");
  const regularPrice = Number(product.regularPrice).toLocaleString("en-IN");

  return (
    <a
      href={`/products/${product.slug}`}
      className="lift-card group flex h-full flex-col overflow-hidden border border-[#d8d1c7] bg-[#fffdf9] shadow-[0px_12px_28px_rgba(15,23,42,0.07)] transition-all duration-300 hover:border-[#cfc5b7] hover:shadow-[0px_20px_40px_rgba(15,23,42,0.12)]"
    >
      <div className="flex h-full flex-col">
        <div className="bg-white p-2.5 sm:p-3">
          {image ? (
            <div className="flex aspect-[4/5] items-center justify-center overflow-hidden bg-white">
              <img
                src={image.src}
                alt={image.alt || product.name}
                className="h-full max-w-full object-contain transition-transform duration-700 group-hover:scale-[1.02]"
              />
            </div>
          ) : (
            <div className="aspect-[4/5] w-full bg-[#f3ede2]" />
          )}
        </div>
        <div className="flex flex-1 flex-col justify-between border-t border-black/8 px-3.5 pb-3.5 pt-4 sm:px-4 sm:pb-4">
          <div>
            <p className="line-clamp-2 min-h-[3.4rem] font-(family-name:--font-body) text-[1.08rem] leading-7 text-[#181411]">
              {product.name}
            </p>
          </div>
          <div className="mt-4 flex items-end gap-2">
            {fromPrice !== null ? (
              <span className="font-(family-name:--font-body) text-[1.35rem] leading-none text-[#181411]">
                ₹{inr(fromPrice)}
              </span>
            ) : (
              <>
                <span className="font-(family-name:--font-body) text-[1.35rem] leading-none text-[#181411]">₹{salePrice}</span>
                {regularPrice !== salePrice && (
                  <span className="relative mb-0.5 pb-0.5 font-(family-name:--font-body) text-[0.92rem] text-black/40">
                    ₹{regularPrice}
                    <span className="absolute left-0 top-1/2 w-full border-t border-black/30" />
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </a>
  );
}

export default function ProductDetailClient({
  product,
  related,
}: {
  product: StoreProduct;
  related: StoreProduct[];
}) {
  type CartButtonState = "idle" | "adding" | "added";

  const schema = useMemo(() => getSchemaForProduct(product), [product]);
  const material = schema ? MATERIAL_BY_SCHEMA_TYPE[schema.type] : undefined;
  const productSpecificDetails = schema ? PRODUCT_DETAILS_BY_SCHEMA_TYPE[schema.type] : undefined;
  const rule = useMemo(() => getPricingRule(product.slug), [product.slug]);
  const isSet = rule?.kind === "set";

  // For set-priced products `quantity` is the number of sets.
  const [quantity, setQuantity] = useState(1);
  const [color, setColor] = useState("");
  const [style, setStyle] = useState("");
  const [schemaCustomizations, setSchemaCustomizations] = useState<
    Array<{ key: string; value: string }>
  >([]);
  const [schemaQuantity, setSchemaQuantity] = useState(1);
  const [schemaValid, setSchemaValid] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [cartButtonState, setCartButtonState] = useState<CartButtonState>("idle");
  const resetAddedStateTimerRef = useRef<number | null>(null);
  const addItem = useCartStore((state) => state.addItem);
  const cartItemCount = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0),
  );

  const thumbnails = product.images.filter((img) => Boolean(img?.src));
  const videoSrc = PRODUCT_VIDEOS[product.slug];
  const videoSelected = Boolean(videoSrc) && selectedImageIndex === thumbnails.length;
  const mediaCount = thumbnails.length + (videoSrc ? 1 : 0);
  const stepMedia = (dir: 1 | -1) =>
    setSelectedImageIndex((i) => (i + dir + mediaCount) % mediaCount);
  const selectedImage = videoSelected ? undefined : (thumbnails[selectedImageIndex] ?? thumbnails[0]);
  const salePrice = Number(product.price).toLocaleString("en-IN");
  const regularPrice = Number(product.regularPrice).toLocaleString("en-IN");
  const primaryCategory =
    product.categories?.find((category) => category.toLowerCase() !== "uncategorized") ??
    "Gifts & Keepsakes";

  const description = product.description || product.shortDescription || "";
  // Local-delivery products carry the note in the title; surface it as its own
  // badge so it can never be lost in the description copy.
  const localDeliveryOnly = /local delivery only/i.test(
    `${product.name} ${description}`,
  );
  const colorOptions = useMemo(() => {
    const colorAttribute = (product.attributes ?? []).find((attribute) =>
      /color/i.test(attribute.name),
    );
    return colorAttribute?.options ?? [];
  }, [product.attributes]);
  const styleOptions = useMemo(() => {
    const styleAttribute = (product.attributes ?? []).find((attribute) =>
      /style|design/i.test(attribute.name),
    );
    return styleAttribute?.options ?? [];
  }, [product.attributes]);

  // Quantity that actually drives pricing: schema products report their own,
  // set products count sets, everything else uses the plain stepper.
  const effectiveQty = schema ? schemaQuantity : quantity;

  // Effective price for the current selection. `lineTotal` is authoritative;
  // `unitPrice` is what we store on the cart line (the cart + server recompute
  // the tiered total from the rule, so this is a display/fallback figure).
  const pricing = useMemo(() => {
    if (rule?.kind === "tiered") {
      const { unitPrice, lineTotal } = priceTiered(rule, effectiveQty);
      return { unitPrice, lineTotal, cartQty: effectiveQty, set: null as null };
    }
    if (rule?.kind === "set") {
      // `quantity` is the number of sets.
      const { numSets, pieces, perSet, perPiece, lineTotal } = priceSet(rule, quantity);
      return {
        unitPrice: perSet,
        lineTotal,
        cartQty: numSets,
        set: { numSets, pieces, perSet, perPiece, setSize: rule.setSize },
      };
    }
    const flat = Number(product.price || product.regularPrice || 0);
    return { unitPrice: flat, lineTotal: flat * effectiveQty, cartQty: effectiveQty, set: null as null };
  }, [rule, effectiveQty, quantity, product.price, product.regularPrice]);

  useEffect(() => {
    return () => {
      if (resetAddedStateTimerRef.current !== null) {
        window.clearTimeout(resetAddedStateTimerRef.current);
      }
    };
  }, []);

  const handleSchemaChange = useCallback(
    (result: {
      customizations: Array<{ key: string; value: string }>;
      quantity: number;
      valid: boolean;
    }) => {
      setSchemaCustomizations(result.customizations);
      setSchemaQuantity(result.quantity);
      setSchemaValid(result.valid);
    },
    [],
  );

  function handleAddToCart() {
    if (cartButtonState === "adding") {
      return;
    }

    if (schema && !schemaValid) {
      return;
    }

    setCartButtonState("adding");

    const setLine = pricing.set
      ? {
          key: "Quantity",
          value: `${pricing.set.numSets} × set of ${pricing.set.setSize} (${pricing.set.pieces} pieces)`,
        }
      : null;

    const customizations = schema
      ? setLine
        ? [setLine, ...schemaCustomizations]
        : schemaCustomizations
      : isSet
        ? [...(setLine ? [setLine] : [])]
        : [
            { key: "Color", value: color },
            { key: "Style", value: style },
          ];

    addItem(
      {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: pricing.unitPrice,
        image: selectedImage?.src || product.images[0]?.src || "",
        setPieces: pricing.set ? pricing.set.setSize : undefined,
        customizations,
      },
      pricing.cartQty,
    );

    setCartButtonState("added");

    if (resetAddedStateTimerRef.current !== null) {
      window.clearTimeout(resetAddedStateTimerRef.current);
    }

    resetAddedStateTimerRef.current = window.setTimeout(() => {
      setCartButtonState("idle");
    }, 1200);
  }

  return (
    <main className="min-h-screen">
      <section className="border-b border-black/10 lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="relative order-2 self-start lg:order-1">
          {videoSelected ? (
            <video
              key={videoSrc}
              src={videoSrc}
              controls
              autoPlay
              muted
              loop
              playsInline
              className="block h-auto w-full object-contain object-left-top"
            />
          ) : selectedImage ? (
            <img
              src={selectedImage.src}
              alt={selectedImage.alt || product.name}
              className="block h-auto w-full object-contain object-left-top"
            />
          ) : (
            <div className="aspect-[4/5] w-full bg-black/5" />
          )}


          {mediaCount > 1 && (
            <>
              <button
                type="button"
                onClick={() => stepMedia(-1)}
                aria-label="Previous image"
                className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-black/70 backdrop-blur-sm transition-colors hover:bg-white hover:text-black"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 5-7 7 7 7" /></svg>
              </button>
              <button
                type="button"
                onClick={() => stepMedia(1)}
                aria-label="Next image"
                className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-black/70 backdrop-blur-sm transition-colors hover:bg-white hover:text-black"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg>
              </button>
            </>
          )}

          {(thumbnails.length > 0 || videoSrc) && (
            <div className="absolute bottom-4 left-4 right-4 flex gap-3 overflow-x-auto bg-white/85 p-3 backdrop-blur-sm sm:bottom-6 sm:left-6 sm:right-auto sm:w-auto">
              {thumbnails.map((thumb, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedImageIndex(i)}
                  aria-label={`Show image ${i + 1}`}
                  className={`h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden border transition-all md:h-[5rem] md:w-[5rem] ${
                    selectedImageIndex === i
                      ? "border-black shadow-[0px_8px_20px_rgba(15,23,42,0.12)]"
                      : "border-black/10 hover:border-black/30"
                  }`}
                >
                  <img
                    src={thumb.src}
                    alt={thumb.alt || product.name}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
              {videoSrc && (
                <button
                  type="button"
                  onClick={() => setSelectedImageIndex(thumbnails.length)}
                  aria-label="Play video"
                  className={`flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center border bg-black/80 text-white transition-all md:h-[5rem] md:w-[5rem] ${
                    videoSelected ? "border-black" : "border-black/10 hover:border-black/30"
                  }`}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
                </button>
              )}
            </div>
          )}
        </div>

        <div className="order-1 px-4 py-8 sm:px-8 sm:py-12 md:px-12 lg:order-2 lg:flex lg:items-center lg:px-12 lg:py-14 xl:px-16">
          <div className="mx-auto w-full max-w-[42rem]">
            <p className="font-(family-name:--font-body) text-xs uppercase tracking-[0.3em] text-black/45">
              {primaryCategory}
            </p>

            <h1 className="mt-4 max-w-[26ch] font-(family-name:--font-body) text-[1.75rem] leading-[1.1] text-black sm:text-[1.95rem] xl:text-[2.15rem]">
              {product.name}
            </h1>

            <div className="mt-6">
              {rule ? (
                <>
                  <div className="flex items-end gap-2.5">
                    <span className="font-(family-name:--font-body) text-[2.25rem] leading-none text-black sm:text-[2.55rem]">
                      ₹{inr(pricing.lineTotal)}
                    </span>
                    <span className="mb-1 font-(family-name:--font-body) text-base text-black/55">
                      {pricing.set
                        ? `for ${pricing.set.numSets > 1 ? `${pricing.set.numSets} sets` : "a set"} of ${pricing.set.setSize}`
                        : effectiveQty > 1
                          ? `for ${effectiveQty}`
                          : "each"}
                    </span>
                  </div>
                  <p className="mt-1.5 font-(family-name:--font-body) text-sm text-black/60">
                    {pricing.set ? (
                      <>
                        ₹{inr(pricing.set.perSet)} per set of {pricing.set.setSize} · ₹
                        {inr(pricing.set.perPiece)} per piece
                        {pricing.set.numSets > 1 && <> · {pricing.set.pieces} pieces</>}
                      </>
                    ) : (
                      <>₹{inr(pricing.unitPrice)} each</>
                    )}
                  </p>
                </>
              ) : (
                <div className="flex items-end gap-3">
                  <span className="font-(family-name:--font-body) text-[2.25rem] leading-none text-black sm:text-[2.55rem]">
                    ₹{salePrice}
                  </span>
                  {regularPrice !== salePrice && (
                    <span className="relative mb-1 pb-0.5 font-(family-name:--font-body) text-lg text-black/38">
                      ₹{regularPrice}
                      <span className="absolute left-0 top-1/2 w-full border-t border-black/30" />
                    </span>
                  )}
                </div>
              )}
            </div>

            {localDeliveryOnly && (
              <p className="mt-4 inline-block border border-black/20 px-3 py-1.5 font-(family-name:--font-body) text-[0.72rem] uppercase tracking-[0.18em] text-black/65">
                Available for Local Delivery Only
              </p>
            )}

            {description && (
              <div
                className="mt-6 max-w-3xl font-(family-name:--font-body) text-[1.02rem] leading-8 text-black/72 [&>p]:mb-4 [&>ul]:ml-4 [&>ul]:list-disc"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            )}

            <div className="mt-8 border-t border-black/10 pt-7">
              <div className="grid gap-5">
                {schema ? (
                  <>
                    {rule?.kind === "set" && (
                      <>
                        {/* Set products are sold by the set (e.g. 6). The
                            customer picks a plain quantity = number of sets;
                            the schema itself carries no quantity field. */}
                        <QtyStepper
                          label={`Quantity (sets of ${rule.setSize})`}
                          value={quantity}
                          onChange={setQuantity}
                          max={rule.maxSets ?? undefined}
                        />
                      </>
                    )}
                    <ProductOptions schema={schema} onChange={handleSchemaChange} />
                  </>
                ) : rule?.kind === "set" ? (
                  <>
                    <QtyStepper
                      label={`Quantity (sets of ${rule.setSize})`}
                      value={quantity}
                      onChange={setQuantity}
                      max={rule.maxSets ?? undefined}
                    />
                  </>
                ) : rule ? (
                  <>
                    <QtyStepper label="Quantity" value={quantity} onChange={setQuantity} />
                  </>
                ) : (
                  <>
                    <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_9rem] sm:items-end">
                      <div>
                        <label className="mb-2 block font-(family-name:--font-body) text-sm uppercase tracking-[0.18em] text-black/48">
                          Color
                        </label>
                        <div className="relative">
                          <select
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            disabled={colorOptions.length === 0}
                            className={`h-12 w-full appearance-none border border-black/15 bg-transparent px-4 pr-10 font-(family-name:--font-body) text-sm text-black ${
                              colorOptions.length === 0 ? "cursor-not-allowed opacity-70" : "cursor-pointer"
                            }`}
                          >
                            <option value="">{colorOptions.length > 0 ? "Select Color" : "No Color Options"}</option>
                            {colorOptions.map((option, index) => (
                              <option key={`${option}-${index}`} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                            <svg width="11" height="6" viewBox="0 0 11 6" fill="none">
                              <path d="M1 1L5.5 5L10 1" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block font-(family-name:--font-body) text-sm uppercase tracking-[0.18em] text-black/48">
                          Quantity
                        </label>
                        <div className="flex h-12 items-center border border-black/15">
                          <button
                            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                            className="h-full w-12 border-r border-black/15 font-(family-name:--font-body) text-xl transition-colors hover:bg-black/5"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="flex h-full flex-1 items-center justify-center font-(family-name:--font-body) text-lg">
                            {quantity}
                          </span>
                          <button
                            onClick={() => setQuantity((q) => q + 1)}
                            className="h-full w-12 border-l border-black/15 font-(family-name:--font-body) text-xl transition-colors hover:bg-black/5"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block font-(family-name:--font-body) text-sm uppercase tracking-[0.18em] text-black/48">
                        Style
                      </label>
                      <div className="relative">
                        <select
                          value={style}
                          onChange={(e) => setStyle(e.target.value)}
                          disabled={styleOptions.length === 0}
                          className={`h-12 w-full appearance-none border border-black/15 bg-transparent px-4 pr-10 font-(family-name:--font-body) text-sm text-black ${
                            styleOptions.length === 0 ? "cursor-not-allowed opacity-70" : "cursor-pointer"
                          }`}
                        >
                          <option value="">{styleOptions.length > 0 ? "Select Style" : "No Style Options"}</option>
                          {styleOptions.map((option, index) => (
                            <option key={`${option}-${index}`} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                          <svg width="11" height="6" viewBox="0 0 11 6" fill="none">
                            <path d="M1 1L5.5 5L10 1" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </div>
                    </div>

                  </>
                )}

                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={cartButtonState === "adding" || (Boolean(schema) && !schemaValid)}
                  className={`relative mt-2 inline-flex h-14 w-full items-center justify-center overflow-hidden border font-(family-name:--font-body) text-[0.98rem] uppercase tracking-[0.18em] text-white transition-[background-color,border-color,transform] duration-300 ${
                    schema && !schemaValid
                      ? "cursor-not-allowed border-black/30 bg-black/40"
                      : cartButtonState === "added"
                      ? "border-[#1f3b2d] bg-[#1f3b2d]"
                      : cartButtonState === "adding"
                        ? "cursor-progress border-black/75 bg-black/75"
                        : "cursor-pointer border-black bg-black hover:-translate-y-0.5 hover:bg-[#1a1a1a]"
                  }`}
                >
                  <span
                    className={`absolute inset-0 bg-white/10 transition-opacity duration-300 ${
                      cartButtonState === "adding" ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  <span className="relative z-10 flex items-center gap-2.5">
                    {cartButtonState === "adding" && (
                      <svg
                        className="h-4 w-4 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.28" strokeWidth="2" />
                        <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    )}
                    {cartButtonState === "added" && (
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    <span>
                      {cartButtonState === "adding"
                        ? "Adding..."
                        : cartButtonState === "added"
                          ? "Added To Cart"
                          : "Add To Cart"}
                    </span>
                  </span>
                </button>
                <div
                  aria-live="polite"
                  className={`flex min-h-6 items-center gap-2 text-sm font-(family-name:--font-body) transition-all duration-300 ${
                    cartButtonState === "added"
                      ? "translate-y-0 opacity-100 text-[#1f3b2d]"
                      : "translate-y-1 opacity-0 text-black/60"
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  <span>
                    Added to cart. {cartItemCount} item{cartItemCount === 1 ? "" : "s"} in cart.
                  </span>
                </div>

                <div className="grid grid-cols-3 border-y border-black/10 py-5 sm:py-6">
                  {[
                    { label: "Premium Quality", icon: "/premium-quality.webp" },
                    { label: "Made Personal", icon: "/made-personal.webp" },
                    { label: "Elegance, Served", icon: "/elegance-served.webp" },
                  ].map((promise, index) => (
                    <div
                      key={promise.label}
                      className={`flex min-w-0 flex-col items-center px-2 text-center ${
                        index > 0 ? "border-l border-black/10" : ""
                      }`}
                    >
                      <img
                        src={promise.icon}
                        alt=""
                        className="h-9 w-9 object-contain sm:h-11 sm:w-11"
                      />
                      <p className="mt-2 font-(family-name:--font-body) text-[0.58rem] uppercase leading-4 tracking-[0.14em] text-black/65 sm:text-[0.65rem] sm:tracking-[0.18em]">
                        {promise.label}
                      </p>
                    </div>
                  ))}
                </div>

                {schema?.afterCart?.length ? (
                  <div className="grid gap-5 border-t border-black/10 pt-6">
                    {schema.afterCart.map((note) => (
                      <NoteBlock key={note.id} option={note} />
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="mt-8 border-t border-black/10">
              <ProductInfoDropdown title="Shipping">
                <p>
                  As each piece is thoughtfully handcrafted and personalised, please allow the following timelines:
                </p>
                <p className="mt-4 font-medium text-black">
                  Handpainted Tote Bags, Napkins &amp; Signages
                </p>
                <p>At least 2–3 weeks for creation.</p>
                <p className="mt-4 font-medium text-black">Engraved &amp; Foil Stamped Products</p>
                <p>At least 1–2 weeks for creation.</p>
                <p className="mt-4">Please allow an additional 3 days for shipping and delivery.</p>
                <p className="mt-4">
                  We recommend placing your orders well in advance, especially for weddings and celebrations, to allow enough time for your pieces to be carefully created and delivered.
                </p>
                <p className="mt-4">
                  <strong>Need it sooner?</strong> For urgent or emergency orders, drop us an email at{" "}
                  <a className="underline underline-offset-2" href="mailto:littleccoartmakes@gmail.com">
                    littleccoartmakes@gmail.com
                  </a>{" "}
                  and we&apos;ll do our best to accommodate your timeline.
                </p>
              </ProductInfoDropdown>
              <ProductInfoDropdown title="Returns">
                <p>
                  As every piece is individually hand-calligraphed, engraved, handpainted, or foil stamped specifically for you, personalised orders are non-returnable or exchangeable.
                </p>
                <p className="mt-4">
                  However, if your product arrives damaged, torn, cracked, or broken, please get in touch with us and we&apos;ll be happy to assist.
                </p>
              </ProductInfoDropdown>
              <ProductInfoDropdown title="Product Details">
                {productSpecificDetails && <p>{productSpecificDetails}</p>}
                <p className={productSpecificDetails ? "mt-4" : undefined}>
                  The product shown is included with the personalisation service unless specifically mentioned otherwise.
                </p>
                <p className="mt-4">
                  Every piece is individually created and personalised by hand, making each one unique. Slight variations in lettering, placement, finish, or artwork are a natural part of the handmade process and add to the character of your Little C Co. piece.
                </p>
              </ProductInfoDropdown>
              <ProductInfoDropdown title="Materials & Care">
                <p>We carefully select quality materials to complement our handcrafted personalisation.</p>

                {(!material || material === "linen") && (
                  <>
                    <p className="mt-5 font-medium text-black">Linen</p>
                    <p>Used for our tote bags, dining napkins, and signages.</p>
                    <ul className="mt-3 list-disc space-y-2 pl-5 marker:text-black/45">
                      <li>For small dirt marks, gently wipe with a damp cloth and mild soap.</li>
                      <li>Hand wash only: If the entire bag or napkin requires cleaning, hand wash in cold water with a gentle detergent.</li>
                      <li>Do not soak, wring, or twist the painted area, as excessive friction may cause the cured acrylic paint to crack or wear.</li>
                      <li>Dry flat: Reshape while damp and allow to air dry flat.</li>
                      <li>Avoid ironing directly over painted areas.</li>
                    </ul>
                  </>
                )}

                {(!material || material === "metal") && (
                  <>
                    <p className="mt-5 font-medium text-black">Metal</p>
                    <p>
                      Our compact mirrors and card holders are crafted using quality metal surfaces, selected to provide a smooth base for precise, lasting engraving.
                    </p>
                    <ul className="mt-3 list-disc space-y-2 pl-5 marker:text-black/45">
                      <li>Wipe gently with a soft, dry or slightly damp cloth.</li>
                      <li>Avoid abrasive cleaners, rough cloths, and prolonged exposure to moisture.</li>
                      <li>For engraved surfaces, handle gently to preserve the finish.</li>
                    </ul>
                  </>
                )}

                {(!material || material === "glass") && (
                  <>
                    <p className="mt-5 font-medium text-black">Glass</p>
                    <p>
                      Our wine glasses, tumblers, ring boxes, letter holders, and frames use quality glass selected for their clarity and elegant finish. Our ring boxes, letter holders, and frames feature gold-toned metal rims for an elevated look.
                    </p>
                    <ul className="mt-3 list-disc space-y-2 pl-5 marker:text-black/45">
                      <li>Handle glass pieces with care.</li>
                      <li>Clean gently with a soft cloth and mild soap.</li>
                      <li>Avoid abrasive materials and harsh cleaning products.</li>
                      <li>For personalised or engraved surfaces, avoid excessive scrubbing directly over the artwork or engraving.</li>
                    </ul>
                  </>
                )}

                <p className="mt-5 font-medium text-black">Handcrafted Details</p>
                <p>
                  Each calligraphed, handpainted, engraved, and foil-stamped detail is created individually. With proper care, your piece can be enjoyed long after the celebration it was created for.
                </p>
              </ProductInfoDropdown>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="px-4 pb-8 pt-10 sm:px-8 sm:pb-16 sm:pt-14 md:px-12 md:pb-20 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8">
              <h2 className="font-(family-name:--font-heading) text-[2.2rem] leading-tight text-black md:text-[2.65rem]">
                We&apos;d pair it with
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 sm:gap-x-8 sm:gap-y-8 lg:grid-cols-4">
              {related.slice(0, 4).map((p) => (
                <RelatedProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
