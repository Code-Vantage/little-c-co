"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { Address } from "@/lib/types";
import type { AddressSuggestion } from "@/app/api/geo/autocomplete/route";
import type { PincodeResult } from "@/app/api/geo/pincode/route";

const inputClass =
  "h-11 w-full border border-black/15 bg-transparent px-3.5 font-(family-name:--font-body) text-sm text-black placeholder:text-black/35 focus:border-black/40 focus:outline-none";
const labelClass =
  "mb-1.5 block font-(family-name:--font-body) text-[0.7rem] uppercase tracking-[0.14em] text-black/50";
const hintClass = "mt-1.5 font-(family-name:--font-body) text-xs leading-5 text-black/50";

const AUTOCOMPLETE_DEBOUNCE_MS = 250;
const PINCODE_DEBOUNCE_MS = 400;
const MIN_QUERY_LENGTH = 3;

function Field({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className={labelClass}>
        {label}
        {required ? " *" : ""}
      </label>
      {children}
    </div>
  );
}

export function AddressForm({
  address,
  onChange,
  idPrefix,
  showContactFields = false,
}: {
  address: Address;
  onChange: (next: Address) => void;
  idPrefix: string;
  showContactFields?: boolean;
}) {
  const listboxId = useId();

  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [suggestLoading, setSuggestLoading] = useState(false);
  // Set once the proxy reports no API key — suppresses the lookup entirely so a
  // store without MAPTILER_API_KEY behaves like a plain text field.
  const [autocompleteDisabled, setAutocompleteDisabled] = useState(false);

  const [pincodeStatus, setPincodeStatus] = useState<
    "idle" | "loading" | "filled" | "notfound" | "error"
  >("idle");
  const [areaOptions, setAreaOptions] = useState<string[]>([]);

  const suggestAbortRef = useRef<AbortController | null>(null);
  const pincodeAbortRef = useRef<AbortController | null>(null);
  const blurTimerRef = useRef<number | null>(null);
  // Suppresses the autocomplete fetch that a programmatic fill would otherwise
  // trigger (picking a suggestion writes to address_1, which re-runs the effect).
  const skipNextQueryRef = useRef(false);
  // Remembers the last PIN we looked up so re-renders don't refetch it.
  const lastPincodeRef = useRef("");
  // The exact city/state values this component auto-filled. A field is safe to
  // overwrite only if it still holds what we put there — that way a new PIN
  // corrects a stale auto-filled value, but never overwrites the customer's own
  // typing.
  const autofilledRef = useRef<{ city: string; state: string }>({ city: "", state: "" });

  // The address object is rebuilt by the parent on every keystroke, so `set`
  // must read from the latest props — keep a ref to avoid stale closures in the
  // debounced effects below.
  const addressRef = useRef(address);
  addressRef.current = address;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const set = useCallback(<K extends keyof Address>(key: K, value: Address[K]) => {
    onChangeRef.current({ ...addressRef.current, [key]: value });
  }, []);

  const patch = useCallback((next: Partial<Address>) => {
    onChangeRef.current({ ...addressRef.current, ...next });
  }, []);

  useEffect(() => {
    return () => {
      suggestAbortRef.current?.abort();
      pincodeAbortRef.current?.abort();
      if (blurTimerRef.current !== null) {
        window.clearTimeout(blurTimerRef.current);
      }
    };
  }, []);

  // --- Address line 1 autosuggest -----------------------------------------
  const query = address.address_1;

  useEffect(() => {
    if (autocompleteDisabled) {
      return;
    }

    if (skipNextQueryRef.current) {
      skipNextQueryRef.current = false;
      return;
    }

    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      setSuggestOpen(false);
      setSuggestLoading(false);
      return;
    }

    const timer = window.setTimeout(async () => {
      // Cancel any in-flight lookup so responses can't land out of order.
      suggestAbortRef.current?.abort();
      const controller = new AbortController();
      suggestAbortRef.current = controller;

      setSuggestLoading(true);
      try {
        const response = await fetch(
          `/api/geo/autocomplete?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal },
        );
        const data = (await response.json()) as {
          suggestions?: AddressSuggestion[];
          disabled?: boolean;
        };

        if (data.disabled) {
          setAutocompleteDisabled(true);
          setSuggestions([]);
          setSuggestOpen(false);
          return;
        }

        const next = data.suggestions ?? [];
        setSuggestions(next);
        setActiveIndex(-1);
        setSuggestOpen(next.length > 0);
      } catch (error) {
        if ((error as Error)?.name === "AbortError") {
          return;
        }
        // Network failure: stay silent and let the customer type it out.
        setSuggestions([]);
        setSuggestOpen(false);
      } finally {
        setSuggestLoading(false);
      }
    }, AUTOCOMPLETE_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [query, autocompleteDisabled]);

  function applySuggestion(suggestion: AddressSuggestion) {
    skipNextQueryRef.current = true;

    // Only overwrite fields the suggestion actually resolved; never clear a
    // value the customer already typed. Record what we filled so a later PIN
    // lookup is allowed to correct these same fields.
    const next: Partial<Address> = { address_1: suggestion.line1 };
    if (suggestion.city) {
      next.city = suggestion.city;
      autofilledRef.current.city = suggestion.city;
    }
    if (suggestion.state) {
      next.state = suggestion.state;
      autofilledRef.current.state = suggestion.state;
    }
    if (suggestion.postcode) {
      next.postcode = suggestion.postcode;
      // The suggestion already carries city/state, so don't let the PIN effect
      // re-fetch and re-fill them for this value.
      lastPincodeRef.current = suggestion.postcode;
    }
    patch(next);

    setSuggestions([]);
    setSuggestOpen(false);
    setActiveIndex(-1);
  }

  function handleAddressKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!suggestOpen || suggestions.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
    } else if (event.key === "Enter") {
      // Only intercept Enter when a suggestion is actively highlighted, so the
      // form can still be submitted normally.
      if (activeIndex >= 0) {
        event.preventDefault();
        applySuggestion(suggestions[activeIndex]);
      }
    } else if (event.key === "Escape") {
      setSuggestOpen(false);
      setActiveIndex(-1);
    }
  }

  // --- Postcode → city / state --------------------------------------------
  const postcode = address.postcode;

  useEffect(() => {
    const trimmed = postcode.trim();

    if (!/^\d{6}$/.test(trimmed)) {
      lastPincodeRef.current = "";
      setPincodeStatus("idle");
      setAreaOptions([]);
      return;
    }

    // Already resolved this PIN — don't hit the network again on re-render.
    if (lastPincodeRef.current === trimmed) {
      return;
    }

    const timer = window.setTimeout(async () => {
      pincodeAbortRef.current?.abort();
      const controller = new AbortController();
      pincodeAbortRef.current = controller;

      setPincodeStatus("loading");
      try {
        const response = await fetch(`/api/geo/pincode?pincode=${trimmed}`, {
          signal: controller.signal,
        });

        if (response.status === 404) {
          lastPincodeRef.current = trimmed;
          setPincodeStatus("notfound");
          setAreaOptions([]);
          return;
        }
        if (!response.ok) {
          throw new Error("Lookup failed");
        }

        const data = (await response.json()) as PincodeResult;
        lastPincodeRef.current = trimmed;

        // Fill a field when it's empty, or when it still holds a value we
        // auto-filled earlier (so changing the PIN corrects it). Leave anything
        // the customer typed themselves untouched.
        const current = addressRef.current;
        const filled = autofilledRef.current;
        const canFill = (value: string, previouslyFilled: string) =>
          !value.trim() || value === previouslyFilled;

        const next: Partial<Address> = {};
        if (data.city && canFill(current.city, filled.city)) {
          next.city = data.city;
          filled.city = data.city;
        }
        if (data.state && canFill(current.state, filled.state)) {
          next.state = data.state;
          filled.state = data.state;
        }
        if (!current.country.trim()) next.country = "IN";
        if (Object.keys(next).length > 0) {
          patch(next);
        }

        setAreaOptions(data.areas ?? []);
        setPincodeStatus("filled");
      } catch (error) {
        if ((error as Error)?.name === "AbortError") {
          return;
        }
        setPincodeStatus("error");
        setAreaOptions([]);
      }
    }, PINCODE_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [postcode, patch]);

  const pincodeMessage: Record<typeof pincodeStatus, string | null> = {
    idle: null,
    loading: "Looking up PIN code…",
    filled: "City and state filled from PIN code. Edit if needed.",
    notfound: "We couldn't find that PIN code. Please enter city and state manually.",
    error: "PIN lookup unavailable. Please enter city and state manually.",
  };

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="First Name" required>
          <input
            id={`${idPrefix}-first-name`}
            type="text"
            value={address.first_name}
            onChange={(e) => set("first_name", e.target.value)}
            className={inputClass}
            autoComplete="given-name"
          />
        </Field>
        <Field label="Last Name" required>
          <input
            id={`${idPrefix}-last-name`}
            type="text"
            value={address.last_name}
            onChange={(e) => set("last_name", e.target.value)}
            className={inputClass}
            autoComplete="family-name"
          />
        </Field>
      </div>

      {showContactFields && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email" required>
            <input
              id={`${idPrefix}-email`}
              type="email"
              value={address.email ?? ""}
              onChange={(e) => set("email", e.target.value)}
              className={inputClass}
              autoComplete="email"
            />
          </Field>
          <Field label="Phone" required>
            <input
              id={`${idPrefix}-phone`}
              type="tel"
              inputMode="tel"
              value={address.phone ?? ""}
              onChange={(e) => set("phone", e.target.value)}
              className={inputClass}
              autoComplete="tel"
            />
          </Field>
        </div>
      )}

      <Field label="Address Line 1" required>
        <div className="relative">
          <input
            id={`${idPrefix}-address1`}
            type="text"
            value={address.address_1}
            onChange={(e) => set("address_1", e.target.value)}
            onKeyDown={handleAddressKeyDown}
            onFocus={() => {
              if (suggestions.length > 0) setSuggestOpen(true);
            }}
            onBlur={() => {
              // Delay so a mousedown on a suggestion still registers.
              blurTimerRef.current = window.setTimeout(() => setSuggestOpen(false), 120);
            }}
            placeholder="House no., building, street"
            className={inputClass}
            autoComplete="address-line1"
            role="combobox"
            aria-expanded={suggestOpen}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={
              activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
            }
          />

          {suggestLoading && (
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-(family-name:--font-body) text-xs text-black/40">
              Searching…
            </span>
          )}

          {suggestOpen && suggestions.length > 0 && (
            <ul
              id={listboxId}
              role="listbox"
              className="absolute left-0 right-0 top-full z-20 mt-1 max-h-64 overflow-y-auto border border-black/15 bg-white shadow-[0_12px_28px_rgba(15,23,42,0.12)]"
            >
              {suggestions.map((suggestion, index) => (
                <li
                  key={suggestion.id}
                  id={`${listboxId}-option-${index}`}
                  role="option"
                  aria-selected={index === activeIndex}
                  onMouseDown={(event) => {
                    // mousedown, not click — the input's blur would close the
                    // list before a click ever landed.
                    event.preventDefault();
                    applySuggestion(suggestion);
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`cursor-pointer px-3.5 py-2.5 font-(family-name:--font-body) text-sm leading-5 ${
                    index === activeIndex ? "bg-black/5 text-black" : "text-black/75"
                  }`}
                >
                  {suggestion.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      </Field>

      <Field label="Address Line 2 (Optional)">
        <input
          id={`${idPrefix}-address2`}
          type="text"
          value={address.address_2 ?? ""}
          onChange={(e) => set("address_2", e.target.value)}
          placeholder="Landmark, apartment, suite"
          className={inputClass}
          autoComplete="address-line2"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Postcode" required>
          <input
            id={`${idPrefix}-postcode`}
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={address.postcode}
            // Digits only: a stray space or letter silently breaks the lookup.
            onChange={(e) => set("postcode", e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="6-digit PIN"
            className={inputClass}
            autoComplete="postal-code"
            aria-describedby={`${idPrefix}-postcode-hint`}
          />
          <p
            id={`${idPrefix}-postcode-hint`}
            aria-live="polite"
            className={`${hintClass} ${
              pincodeStatus === "notfound" || pincodeStatus === "error" ? "text-[#9f1239]" : ""
            }`}
          >
            {pincodeMessage[pincodeStatus] ?? "Enter your PIN code to fill city and state."}
          </p>
        </Field>
        <Field label="Country" required>
          <input
            id={`${idPrefix}-country`}
            type="text"
            value={address.country}
            onChange={(e) => set("country", e.target.value)}
            placeholder="IN"
            className={inputClass}
            autoComplete="country"
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="City" required>
          <input
            id={`${idPrefix}-city`}
            type="text"
            value={address.city}
            onChange={(e) => set("city", e.target.value)}
            className={inputClass}
            autoComplete="address-level2"
            list={areaOptions.length > 0 ? `${idPrefix}-areas` : undefined}
          />
          {areaOptions.length > 0 && (
            <datalist id={`${idPrefix}-areas`}>
              {areaOptions.map((area) => (
                <option key={area} value={area} />
              ))}
            </datalist>
          )}
        </Field>
        <Field label="State" required>
          <input
            id={`${idPrefix}-state`}
            type="text"
            value={address.state}
            onChange={(e) => set("state", e.target.value)}
            className={inputClass}
            autoComplete="address-level1"
          />
        </Field>
      </div>
    </div>
  );
}

export function emptyAddress(): Address {
  return {
    first_name: "",
    last_name: "",
    company: "",
    address_1: "",
    address_2: "",
    city: "",
    state: "",
    postcode: "",
    country: "IN",
    email: "",
    phone: "",
  };
}

export function addressMissingFields(address: Address, requireContact = false): string[] {
  const required: Array<keyof Address> = [
    "first_name",
    "last_name",
    "address_1",
    "city",
    "state",
    "postcode",
    "country",
  ];
  const missing = required.filter((field) => !String(address[field] ?? "").trim());
  if (requireContact) {
    if (!address.email?.trim()) missing.push("email");
    if (!address.phone?.trim()) missing.push("phone");
  }
  return missing;
}
