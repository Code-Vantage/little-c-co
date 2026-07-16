"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  NoteOption,
  OptionChoice,
  OptionCondition,
  ProductOption,
  ProductOptionSchema,
  SelectOption,
} from "@/lib/types";

export type OptionState = Record<string, string>;

type OptionsResult = {
  customizations: Array<{ key: string; value: string }>;
  quantity: number;
  valid: boolean;
};

const labelClass =
  "mb-2 block font-(family-name:--font-body) text-sm uppercase tracking-[0.18em] text-black/48";
const helpClass = "mb-2 font-(family-name:--font-body) text-xs leading-5 text-black/45";

/** Read-only informational block: heading, intro copy, and/or a bulleted list. */
export function NoteBlock({ option }: { option: NoteOption }) {
  return (
    <div>
      {option.label && <p className={labelClass}>{option.label}</p>}
      {option.help && <p className={helpClass}>{option.help}</p>}
      {option.items && option.items.length > 0 && (
        <ul className="ml-4 list-disc font-(family-name:--font-body) text-xs leading-6 text-black/55">
          {option.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function conditionMet(condition: OptionCondition | undefined, state: OptionState): boolean {
  if (!condition) {
    return true;
  }
  const current = state[condition.optionId] ?? "";
  return Array.isArray(condition.equals)
    ? condition.equals.includes(current)
    : condition.equals === current;
}

function showIfOf(option: ProductOption): OptionCondition | undefined {
  return "showIf" in option ? option.showIf : undefined;
}

// Resolve the choice list for a select/radio, honoring dependent (optionsByParent) lists.
function resolveChoices(option: SelectOption, state: OptionState): OptionChoice[] {
  if (option.optionsByParent && option.dependsOn) {
    const parentKey = option.dependsOn
      .split("|")
      .map((id) => state[id] ?? "")
      .join("|");
    return option.optionsByParent[parentKey] ?? [];
  }
  if (option.groups) {
    return option.groups.flatMap((group) => group.options);
  }
  return option.options ?? [];
}

function ChevronDown() {
  return (
    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
      <svg width="11" height="6" viewBox="0 0 11 6" fill="none">
        <path
          d="M1 1L5.5 5L10 1"
          stroke="black"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

/**
 * Schema-driven, conditional product-option renderer.
 * Owns option state, evaluates showIf, filters dependent lists, exposes the
 * assembled customizations + quantity + validity to the parent via onChange.
 */
export function ProductOptions({
  schema,
  onChange,
}: {
  schema: ProductOptionSchema;
  onChange: (result: OptionsResult) => void;
}) {
  const [state, setState] = useState<OptionState>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});

  // Which fields are currently visible (showIf satisfied).
  const visibleOptions = useMemo(
    () => schema.options.filter((option) => conditionMet(showIfOf(option), state)),
    [schema.options, state],
  );

  const buildResult = useCallback(
    (nextState: OptionState): OptionsResult => {
      const visible = schema.options.filter((option) =>
        conditionMet(showIfOf(option), nextState),
      );

      let quantity = 1;
      let valid = true;
      const customizations: Array<{ key: string; value: string }> = [];

      for (const option of visible) {
        if (option.kind === "note") {
          continue;
        }

        const value = (nextState[option.id] ?? "").trim();

        if (option.kind === "quantity") {
          const parsed = Number.parseInt(value, 10);
          quantity = Number.isFinite(parsed) && parsed > 0 ? parsed : option.min ?? 1;
          continue;
        }

        const required = "required" in option ? option.required : false;
        if (required && !value) {
          valid = false;
        }

        if (value) {
          customizations.push({ key: option.label, value });
        }
      }

      return { customizations, quantity, valid };
    },
    [schema.options],
  );

  const update = useCallback(
    (id: string, value: string) => {
      setState((prev) => {
        const next = { ...prev, [id]: value };

        // Reset dependent children whose parent chain changed.
        for (const option of schema.options) {
          if (option.kind !== "select" && option.kind !== "radio") {
            continue;
          }
          if (option.dependsOn && option.dependsOn.split("|").includes(id)) {
            next[option.id] = "";
          }
        }

        return next;
      });
    },
    [schema.options],
  );

  // Notify the parent after the state commit, never from inside the updater —
  // React can run updaters during render, which would set state in the parent
  // mid-render.
  useEffect(() => {
    onChange(buildResult(state));
  }, [state, buildResult, onChange]);

  async function handleFile(id: string, file: File | null, maxSizeMB?: number) {
    if (!file) {
      update(id, "");
      return;
    }
    if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
      window.alert(`Please choose an image under ${maxSizeMB}MB.`);
      return;
    }

    setUploading((prev) => ({ ...prev, [id]: true }));
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/uploads", { method: "POST", body });
      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) {
        throw new Error(data.error || "Upload failed");
      }
      update(id, data.url);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading((prev) => ({ ...prev, [id]: false }));
    }
  }

  return (
    <div className="grid gap-5">
      {visibleOptions.map((option) => {
        if (option.kind === "note") {
          return <NoteBlock key={option.id} option={option} />;
        }

        if (option.kind === "quantity") {
          const min = option.min ?? 1;
          const current = Number.parseInt(state[option.id] ?? "", 10);
          const quantity = Number.isFinite(current) && current >= min ? current : min;
          return (
            <div key={option.id}>
              <label className={labelClass}>{option.label}</label>
              <div className="flex h-12 w-fit items-center border border-black/15">
                <button
                  type="button"
                  onClick={() => update(option.id, String(Math.max(min, quantity - 1)))}
                  className="h-full w-12 border-r border-black/15 font-(family-name:--font-body) text-xl transition-colors hover:bg-black/5"
                  aria-label={`Decrease ${option.label}`}
                >
                  −
                </button>
                <span className="flex h-full w-16 items-center justify-center font-(family-name:--font-body) text-lg">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    update(
                      option.id,
                      String(option.max ? Math.min(option.max, quantity + 1) : quantity + 1),
                    )
                  }
                  className="h-full w-12 border-l border-black/15 font-(family-name:--font-body) text-xl transition-colors hover:bg-black/5"
                  aria-label={`Increase ${option.label}`}
                >
                  +
                </button>
              </div>
            </div>
          );
        }

        if (option.kind === "text" || option.kind === "textarea") {
          const commonProps = {
            value: state[option.id] ?? "",
            maxLength: option.maxLength,
            placeholder: option.placeholder,
            onChange: (
              event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
            ) => update(option.id, event.target.value),
            className:
              "w-full border border-black/15 bg-transparent px-4 py-3 font-(family-name:--font-body) text-sm text-black placeholder:text-black/40",
          };
          return (
            <div key={option.id}>
              <label className={labelClass}>
                {option.label}
                {option.required ? " *" : ""}
              </label>
              {option.help && <p className={helpClass}>{option.help}</p>}
              {option.kind === "textarea" ? (
                <textarea {...commonProps} rows={4} className={`${commonProps.className} resize-none`} />
              ) : (
                <input type="text" {...commonProps} className={`${commonProps.className} h-12`} />
              )}
            </div>
          );
        }

        if (option.kind === "file") {
          const value = state[option.id] ?? "";
          const isUploading = uploading[option.id];
          return (
            <div key={option.id}>
              <label className={labelClass}>{option.label}</label>
              {option.help && <p className={helpClass}>{option.help}</p>}
              <input
                type="file"
                accept={option.accept}
                onChange={(event) =>
                  handleFile(option.id, event.target.files?.[0] ?? null, option.maxSizeMB)
                }
                className="block w-full font-(family-name:--font-body) text-sm text-black/70 file:mr-4 file:border file:border-black/15 file:bg-transparent file:px-4 file:py-2 file:font-(family-name:--font-body) file:text-sm"
              />
              {isUploading && (
                <p className="mt-2 font-(family-name:--font-body) text-xs text-black/50">
                  Uploading…
                </p>
              )}
              {value && !isUploading && (
                <p className="mt-2 font-(family-name:--font-body) text-xs text-[#1f3b2d]">
                  Photo attached.
                </p>
              )}
            </div>
          );
        }

        // select / radio
        if (option.kind !== "select" && option.kind !== "radio") {
          return null;
        }

        // Radios render as a visible list so each choice can surface its own
        // description on hover/focus — a native <option> cannot.
        if (option.kind === "radio") {
          const radioChoices = resolveChoices(option, state);
          const selected = state[option.id] ?? "";
          return (
            <div key={option.id}>
              <label className={labelClass}>
                {option.label}
                {option.required ? " *" : ""}
              </label>
              {option.help && <p className={helpClass}>{option.help}</p>}
              <div className="grid gap-2">
                {radioChoices.map((choice) => {
                  const isSelected = selected === choice.value;
                  return (
                    <label
                      key={choice.value}
                      className={`flex cursor-pointer gap-3 border px-4 py-3 transition-colors ${
                        isSelected
                          ? "border-black bg-black/3"
                          : "border-black/15 hover:border-black/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name={option.id}
                        value={choice.value}
                        checked={isSelected}
                        onChange={() => update(option.id, choice.value)}
                        className="mt-1 h-4 w-4 shrink-0 accent-black"
                      />
                      <span className="min-w-0">
                        <span className="block font-(family-name:--font-body) text-sm text-black">
                          {choice.label}
                        </span>
                        {choice.description && (
                          <span className="mt-1 block font-(family-name:--font-body) text-xs leading-5 text-black/55">
                            {choice.description}
                          </span>
                        )}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        }

        const resolved = resolveChoices(option, state);
        const disabled = resolved.length === 0;
        return (
          <div key={option.id}>
            <label className={labelClass}>
              {option.label}
              {option.required ? " *" : ""}
            </label>
            {option.help && <p className={helpClass}>{option.help}</p>}
            <div className="relative">
              <select
                value={state[option.id] ?? ""}
                onChange={(event) => update(option.id, event.target.value)}
                disabled={disabled}
                className={`h-12 w-full appearance-none border border-black/15 bg-transparent px-4 pr-10 font-(family-name:--font-body) text-sm text-black ${
                  disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"
                }`}
              >
                <option value="">
                  {disabled
                    ? option.dependsOn
                      ? "Select earlier options first"
                      : "No options available"
                    : `Select ${option.label}`}
                </option>
                {option.groups && !option.dependsOn
                  ? option.groups.map((group) => (
                      <optgroup key={group.label} label={group.label}>
                        {group.options.map((choice) => (
                          <option key={choice.value} value={choice.value}>
                            {choice.label}
                          </option>
                        ))}
                      </optgroup>
                    ))
                  : resolved.map((choice) => (
                      <option key={choice.value} value={choice.value}>
                        {choice.label}
                      </option>
                    ))}
              </select>
              <ChevronDown />
            </div>
          </div>
        );
      })}
    </div>
  );
}
