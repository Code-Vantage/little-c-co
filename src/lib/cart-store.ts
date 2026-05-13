import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { CartLine } from "@/lib/types";

type CartInput = Omit<CartLine, "key" | "quantity">;
type CartLineKey = number | string;

function normalizeCustomizations(customizations: CartLine["customizations"] = []) {
  return customizations
    .map((item) => ({
      key: item.key.trim(),
      value: item.value.trim(),
    }))
    .filter((item) => item.key && item.value);
}

function createCartLineKey(item: CartInput) {
  const customizations = normalizeCustomizations(item.customizations);
  return `${item.id}:${JSON.stringify(customizations)}`;
}

function getLineKey(line: CartLine) {
  return line.key ?? line.id;
}

type CartStore = {
  items: CartLine[];
  addItem: (item: CartInput, quantity?: number) => void;
  removeItem: (key: CartLineKey) => void;
  setItemQuantity: (key: CartLineKey, quantity: number) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item, quantity = 1) => {
        const normalizedQty = Math.max(1, Math.floor(quantity));
        const normalizedItem = {
          ...item,
          customizations: normalizeCustomizations(item.customizations),
        };
        const key = createCartLineKey(normalizedItem);

        set((state) => {
          const existing = state.items.find((line) => getLineKey(line) === key);
          if (existing) {
            return {
              items: state.items.map((line) =>
                getLineKey(line) === key
                  ? { ...line, quantity: line.quantity + normalizedQty }
                  : line,
              ),
            };
          }

          return {
            items: [...state.items, { ...normalizedItem, key, quantity: normalizedQty }],
          };
        });
      },
      removeItem: (key) => {
        set((state) => ({
          items: state.items.filter((line) => getLineKey(line) !== key),
        }));
      },
      setItemQuantity: (key, quantity) => {
        const normalizedQty = Math.floor(quantity);

        set((state) => {
          if (normalizedQty <= 0) {
            return {
              items: state.items.filter((line) => getLineKey(line) !== key),
            };
          }

          return {
            items: state.items.map((line) =>
              getLineKey(line) === key ? { ...line, quantity: normalizedQty } : line,
            ),
          };
        });
      },
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "littlecco-cart",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
