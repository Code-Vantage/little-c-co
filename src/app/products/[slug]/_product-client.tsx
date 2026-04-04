"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { StoreProduct } from "@/lib/types";
import { useCartStore } from "../../../lib/cart-store";

function RelatedProductCard({ product }: { product: StoreProduct }) {
  const image = product.images[0];
  const salePrice = Number(product.price).toLocaleString("en-IN");
  const regularPrice = Number(product.regularPrice).toLocaleString("en-IN");

  return (
    <a
      href={`/products/${product.slug}`}
      className="relative block bg-[#fbf3e0] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] overflow-hidden hover:shadow-[0px_6px_16px_0px_rgba(0,0,0,0.18)] transition-shadow"
    >
      <div className="absolute inset-1.5 border-3 border-dashed border-[#93a267] pointer-events-none z-10" />
      <div className="p-3.5">
        <div className="border border-[#d2bc70] overflow-hidden">
          {image ? (
            <img
              src={image.src}
              alt={image.alt || product.name}
              className="w-full aspect-square object-cover"
            />
          ) : (
            <div className="w-full aspect-square bg-[#f0e6c8]" />
          )}
        </div>
        <p className="font-(family-name:--font-body) text-lg text-black mt-2.5 truncate">
          {product.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5 mb-1.5">
          <span className="text-lg text-black font-normal">₹{salePrice}</span>
          <span className="relative text-lg text-[#666]">
            {regularPrice}
            <span className="absolute left-0 top-1/2 w-full border-t border-[#666]" />
          </span>
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

  const [quantity, setQuantity] = useState(1);
  const [color, setColor] = useState("");
  const [style, setStyle] = useState("");
  const [personalization, setPersonalization] = useState("");
  const [showFullDesc, setShowFullDesc] = useState(false);
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

  const description = product.description || product.shortDescription || "";
  const descPreview = description.length > 260 ? description.slice(0, 260) : description;
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

  useEffect(() => {
    setSelectedImageIndex(0);
    setColor("");
    setStyle("");
  }, [product.id]);

  useEffect(() => {
    return () => {
      if (resetAddedStateTimerRef.current !== null) {
        window.clearTimeout(resetAddedStateTimerRef.current);
      }
    };
  }, []);

  function handleAddToCart() {
    if (cartButtonState === "adding") {
      return;
    }

    setCartButtonState("adding");

    addItem(
      {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: Number(product.price || product.regularPrice || 0),
        image: selectedImage?.src || product.images[0]?.src || "",
      },
      quantity,
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
    <main className="bg-[#f5f0e8] min-h-screen">
      {/* ── Product section ─────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-12 md:px-16 md:py-16">
        <div className="flex flex-col md:flex-row gap-10 lg:gap-14 items-start">

          {/* Left: thumbnails + main image */}
          <div className="flex flex-col-reverse md:flex-row gap-3 w-full md:w-[48%] shrink-0">
            {/* Thumbnail column */}
            {thumbnails.length > 0 && (
              <div className="flex flex-row md:flex-col gap-2.5 overflow-x-auto pb-2 md:pb-0">
                {thumbnails.map((thumb, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedImageIndex(i)}
                    aria-label={`Show image ${i + 1}`}
                    className={`w-16 h-16 md:w-18 md:h-18 overflow-hidden shrink-0 border cursor-pointer transition-colors ${
                      selectedImageIndex === i ? "border-black" : "border-black/10"
                    }`}
                  >
                    <img
                      src={thumb.src}
                      alt={thumb.alt || product.name}
                      className="w-full h-full object-contain bg-[#f0e6c8]"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main image */}
            <div className="relative flex-1 aspect-3/4 overflow-hidden bg-[#fbf3e0] shadow-[0px_0px_12px_1px_rgba(0,0,0,0.25)]">
              <div className="absolute inset-1.5 pointer-events-none z-10" />
              {selectedImage ? (
                <img
                  src={selectedImage.src}
                  alt={selectedImage.alt || product.name}
                  className="w-full h-full object-cover object-top bg-[#f0e6c8]"
                />
              ) : (
                <div className="w-full h-full bg-[#f0e6c8]" />
              )}
            </div>
          </div>

          {/* Right: product info */}
          <div className="flex-1 min-w-0">
            {/* Price row */}
            <div className="flex items-baseline gap-3">
              <span className="font-(family-name:--font-body) text-3xl text-black">₹{salePrice}</span>
              <span className="relative font-(family-name:--font-body) text-xl text-[#666]">
                ₹{regularPrice}
                <span className="absolute left-0 top-1/2 w-full border-t border-[#666]" />
              </span>
            </div>

            {/* Product name */}
            <h1 className="font-(family-name:--font-body) text-[1.33rem] text-black mt-5 leading-snug">
              {product.name}
            </h1>

            {/* Color + Quantity row */}
            <div className="mt-6">
              <label className="block font-(family-name:--font-body) text-sm text-black mb-1.5">
                Color
              </label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-3">
                <div className="relative">
                  <select
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    disabled={colorOptions.length === 0}
                    className={`appearance-none font-(family-name:--font-body) text-sm text-black bg-[#f2f2f2] border border-black h-11.5 w-full sm:w-52 px-4 pr-8 ${
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
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                    <svg width="11" height="6" viewBox="0 0 11 6" fill="none">
                      <path d="M1 1L5.5 5L10 1" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>

                {/* Quantity */}
                <div className="flex items-center border border-black h-11.5">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-12 h-full bg-[#e3e3e3] border-r border-black font-(family-name:--font-body) text-xl cursor-pointer hover:bg-[#d7d7d7]"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="w-14 h-full flex items-center justify-center font-(family-name:--font-body) text-xl">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-12 h-full bg-[#e3e3e3] border-l border-black font-(family-name:--font-body) text-xl cursor-pointer hover:bg-[#d7d7d7]"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Style select */}
            <div className="mt-4">
              <label className="block font-(family-name:--font-body) text-sm text-black mb-1.5">
                Style
              </label>
              <div className="relative">
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  disabled={styleOptions.length === 0}
                  className={`appearance-none font-(family-name:--font-body) text-sm text-black bg-[#f2f2f2] border border-black h-11.5 w-full px-4 pr-8 ${
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
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                  <svg width="11" height="6" viewBox="0 0 11 6" fill="none">
                    <path d="M1 1L5.5 5L10 1" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Personalization */}
            <div className="mt-4">
              <label className="block font-(family-name:--font-body) text-sm text-black mb-1.5">
                Personalization
              </label>
              <textarea
                value={personalization}
                onChange={(e) => setPersonalization(e.target.value)}
                placeholder="Description"
                rows={5}
                className="font-(family-name:--font-body) text-sm text-black bg-[#f2f2f2] border border-black w-full px-4 py-3 resize-none placeholder:text-black/60"
              />
            </div>

            {/* Add To Cart */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={cartButtonState === "adding"}
              className={`mt-6 sm:mt-5 w-full text-white font-(family-name:--font-body) text-xl h-14 transition-colors ${
                cartButtonState === "adding"
                  ? "bg-black/75 cursor-progress"
                  : "bg-black cursor-pointer hover:bg-[#1a1a1a]"
              }`}
            >
              {cartButtonState === "adding"
                ? "Adding..."
                : cartButtonState === "added"
                  ? "Added To Cart"
                  : "Add To Cart"}
            </button>
            <p className="font-(family-name:--font-body) text-sm text-black/70 mt-2 min-h-5">
              {cartButtonState === "added"
                ? `Added to cart. ${cartItemCount} item${cartItemCount === 1 ? "" : "s"} in cart.`
                : ""}
            </p>

            {/* Details Accordion */}
            <div className="mt-10 border-t border-black/15">
              {/* Product Description */}
              <div className="py-6 border-b border-black/10">
                <div className="flex items-center gap-2 mb-4">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
                  </svg>
                  <h3 className="font-(family-name:--font-body) font-semibold text-lg text-black">Description</h3>
                </div>
                <div 
                  className="font-(family-name:--font-body) text-base text-black/80 leading-relaxed [&>p]:mb-4 [&>ul]:list-disc [&>ul]:ml-4"
                  dangerouslySetInnerHTML={{ __html: showFullDesc ? description : descPreview + (description.length > 260 && !showFullDesc ? "..." : "") }}
                />
                {description.length > 260 && !showFullDesc && (
                  <button
                    onClick={() => setShowFullDesc(true)}
                    className="text-black font-(family-name:--font-body) font-medium underline mt-2 hover:text-black/70 transition-colors cursor-pointer"
                  >
                    Read full description
                  </button>
                )}
              </div>

              {/* Shipping & Returns */}
              <div className="py-6 border-b border-black/10">
                 <div className="flex items-center gap-2 mb-4">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 9l2 9h10l2-9M9 5h6M3 9h18"/>
                  </svg>
                  <h3 className="font-(family-name:--font-body) font-semibold text-lg text-black">Shipping & Returns</h3>
                </div>
                <div className="font-(family-name:--font-body) text-base text-black/80 leading-relaxed space-y-2">
                  <p><strong>Standard Shipping:</strong> 5-7 business days.</p>
                  <p><strong>Express Shipping:</strong> 2-3 business days.</p>
                  <p>Returns accepted within 15 days of delivery. Items must be unused and in original packaging.</p>
                </div>
              </div>

               {/* Care Instructions */}
               <div className="py-6 border-b border-black/10">
                 <div className="flex items-center gap-2 mb-4">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
                  </svg>
                  <h3 className="font-(family-name:--font-body) font-semibold text-lg text-black">Materials & Care</h3>
                </div>
                <div className="font-(family-name:--font-body) text-base text-black/80 leading-relaxed space-y-2">
                  <p>Crafted with premium materials for longevity.</p>
                  <p>Wipe clean with a soft, dry cloth. Avoid exposure to extreme heat or moisture.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── You may also like ─────────────────────────────────────────── */}
      {related.length > 0 && (
        <div className="bg-[#f5f0e8] px-4 pb-8 sm:px-8 sm:pb-16 md:px-16 md:pb-20">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-(family-name:--font-body) text-3xl font-bold text-black mb-8">
              You may also like
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-6 sm:gap-x-8 sm:gap-y-8">
              {related.slice(0, 4).map((p) => (
                <RelatedProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
