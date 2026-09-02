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

function inr(value: number) {
  return value.toLocaleString("en-IN");
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="mb-2 block font-(family-name:--font-body) text-sm uppercase tracking-[0.18em] text-black/48">
      {children}
    </label>
  );
}

function PersonalizationField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <FieldLabel>Personalization</FieldLabel>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Add names, wording, or details here"
        rows={4}
        className="w-full resize-none border border-black/15 bg-transparent px-4 py-3 font-(family-name:--font-body) text-sm text-black placeholder:text-black/40"
      />
    </div>
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
                From ₹{inr(fromPrice)}
              </span>
            ) : (
              <>
                <span className="font-(family-name:--font-body) text-[1.35rem] leading-none text-[#181411]">₹{salePrice}</span>
                <span className="relative mb-0.5 pb-0.5 font-(family-name:--font-body) text-[0.92rem] text-black/40">
                  ₹{regularPrice}
                  <span className="absolute left-0 top-1/2 w-full border-t border-black/30" />
                </span>
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
  const rule = useMemo(() => getPricingRule(product.slug), [product.slug]);
  const isSet = rule?.kind === "set";

  // For set-priced products `quantity` is the number of sets.
  const [quantity, setQuantity] = useState(1);
  const [color, setColor] = useState("");
  const [style, setStyle] = useState("");
  const [personalization, setPersonalization] = useState("");
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

  const thumbnails = product.images.filter((img) => Boolean(img?.src)).slice(0, 4);
  const selectedImage = thumbnails[selectedImageIndex] ?? thumbnails[0];
  const salePrice = Number(product.price).toLocaleString("en-IN");
  const regularPrice = Number(product.regularPrice).toLocaleString("en-IN");
  const primaryCategory = product.categories?.[0] ?? "Product";

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
        ? [
            ...(setLine ? [setLine] : []),
            { key: "Personalization", value: personalization },
          ]
        : [
            { key: "Color", value: color },
            { key: "Style", value: style },
            { key: "Personalization", value: personalization },
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
          {selectedImage ? (
            <img
              src={selectedImage.src}
              alt={selectedImage.alt || product.name}
              className="block h-auto w-full object-contain object-left-top"
            />
          ) : (
            <div className="aspect-[4/5] w-full bg-black/5" />
          )}

          {thumbnails.length > 0 && (
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
                  <span className="relative mb-1 pb-0.5 font-(family-name:--font-body) text-lg text-black/38">
                    ₹{regularPrice}
                    <span className="absolute left-0 top-1/2 w-full border-t border-black/30" />
                  </span>
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
                    <PersonalizationField value={personalization} onChange={setPersonalization} />
                  </>
                ) : rule ? (
                  <>
                    <QtyStepper label="Quantity" value={quantity} onChange={setQuantity} />
                    <PersonalizationField value={personalization} onChange={setPersonalization} />
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

                    <div>
                      <label className="mb-2 block font-(family-name:--font-body) text-sm uppercase tracking-[0.18em] text-black/48">
                        Personalization
                      </label>
                      <textarea
                        value={personalization}
                        onChange={(e) => setPersonalization(e.target.value)}
                        placeholder="Add names, wording, or details here"
                        rows={4}
                        className="w-full resize-none border border-black/15 bg-transparent px-4 py-3 font-(family-name:--font-body) text-sm text-black placeholder:text-black/40"
                      />
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

                {schema?.afterCart?.length ? (
                  <div className="grid gap-5 border-t border-black/10 pt-6">
                    {schema.afterCart.map((note) => (
                      <NoteBlock key={note.id} option={note} />
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="mt-8 grid gap-4 border-t border-black/10 pt-6 text-sm text-black/68 sm:grid-cols-3">
              <div>
                <p className="font-(family-name:--font-body) text-[0.72rem] uppercase tracking-[0.24em] text-black/45">
                  Crafted for
                </p>
                <p className="mt-2 leading-7">
                  Gifting, celebrations, and bespoke keepsakes.
                </p>
              </div>
              <div>
                <p className="font-(family-name:--font-body) text-[0.72rem] uppercase tracking-[0.24em] text-black/45">
                  Turnaround
                </p>
                <p className="mt-2 leading-7">
                  Timelines vary based on customization and quantity.
                </p>
              </div>
              <div>
                <p className="font-(family-name:--font-body) text-[0.72rem] uppercase tracking-[0.24em] text-black/45">
                  Note
                </p>
                <p className="mt-2 leading-7">
                  Carefully finished with attention to composition and detail.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-black/10">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-8 sm:py-14 md:px-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)] lg:gap-16 lg:px-16">
          <div>
            <p className="font-(family-name:--font-body) text-xs uppercase tracking-[0.3em] text-black/45">
              Product Details
            </p>
            <h2 className="mt-3 max-w-[16ch] font-(family-name:--font-body) text-[1.85rem] leading-tight text-black sm:text-[2.2rem]">
              Designed to feel considered, personal, and lasting.
            </h2>
            <div
              className="mt-6 max-w-3xl font-(family-name:--font-body) text-[1rem] leading-8 text-black/78 [&>p]:mb-4 [&>ul]:ml-4 [&>ul]:list-disc"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          </div>

          <div className="grid gap-8 self-start lg:pt-10">
            <div className="border-t border-black/10 pt-5">
              <p className="font-(family-name:--font-body) text-[0.72rem] uppercase tracking-[0.28em] text-black/45">
                Shipping & Returns
              </p>
              <div className="mt-3 space-y-3 font-(family-name:--font-body) text-[0.98rem] leading-7 text-black/76">
                <p><strong>Standard Shipping:</strong> 5-7 business days.</p>
                <p><strong>Express Shipping:</strong> 2-3 business days.</p>
                <p>Returns accepted within 15 days of delivery in original condition and packaging.</p>
              </div>
            </div>

            <div className="border-t border-black/10 pt-5">
              <p className="font-(family-name:--font-body) text-[0.72rem] uppercase tracking-[0.28em] text-black/45">
                Materials & Care
              </p>
              <div className="mt-3 space-y-3 font-(family-name:--font-body) text-[0.98rem] leading-7 text-black/76">
                <p>Crafted with premium materials for longevity and everyday display.</p>
                <p>Wipe gently with a soft, dry cloth and avoid extended exposure to heat or moisture.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="px-4 pb-8 pt-10 sm:px-8 sm:pb-16 sm:pt-14 md:px-12 md:pb-20 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8">
              <p className="font-(family-name:--font-body) text-xs uppercase tracking-[0.28em] text-black/45">
                Related
              </p>
              <h2 className="mt-2 font-(family-name:--font-body) text-[1.9rem] leading-tight text-black md:text-[2.3rem]">
                You may also like
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
