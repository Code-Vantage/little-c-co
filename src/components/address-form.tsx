"use client";

import type { Address } from "@/lib/types";

const inputClass =
  "h-11 w-full border border-black/15 bg-transparent px-3.5 font-(family-name:--font-body) text-sm text-black placeholder:text-black/35 focus:border-black/40 focus:outline-none";
const labelClass =
  "mb-1.5 block font-(family-name:--font-body) text-[0.7rem] uppercase tracking-[0.14em] text-black/50";

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
  function set<K extends keyof Address>(key: K, value: Address[K]) {
    onChange({ ...address, [key]: value });
  }

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
              value={address.phone ?? ""}
              onChange={(e) => set("phone", e.target.value)}
              className={inputClass}
              autoComplete="tel"
            />
          </Field>
        </div>
      )}

      <Field label="Address Line 1" required>
        <input
          id={`${idPrefix}-address1`}
          type="text"
          value={address.address_1}
          onChange={(e) => set("address_1", e.target.value)}
          placeholder="House no., building, street"
          className={inputClass}
          autoComplete="address-line1"
        />
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
        <Field label="City" required>
          <input
            id={`${idPrefix}-city`}
            type="text"
            value={address.city}
            onChange={(e) => set("city", e.target.value)}
            className={inputClass}
            autoComplete="address-level2"
          />
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

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Postcode" required>
          <input
            id={`${idPrefix}-postcode`}
            type="text"
            value={address.postcode}
            onChange={(e) => set("postcode", e.target.value)}
            className={inputClass}
            autoComplete="postal-code"
          />
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
