import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { CartLine } from "@/lib/types";

type CartInput = Omit<CartLine, "quantity">;

type CartStore = {
  items: CartLine[];
  addItem: (item: CartInput, quantity?: number) => void;
  removeItem: (id: number) => void;
  setItemQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item, quantity = 1) => {
        const normalizedQty = Math.max(1, Math.floor(quantity));

        set((state) => {
          const existing = state.items.find((line) => line.id === item.id);
          if (existing) {
            return {
              items: state.items.map((line) =>
                line.id === item.id
                  ? { ...line, quantity: line.quantity + normalizedQty }
                  : line,
              ),
            };
          }

          return {
            items: [...state.items, { ...item, quantity: normalizedQty }],
          };
        });
      },
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((line) => line.id !== id),
        }));
      },
      setItemQuantity: (id, quantity) => {
        const normalizedQty = Math.floor(quantity);

        set((state) => {
          if (normalizedQty <= 0) {
            return {
              items: state.items.filter((line) => line.id !== id),
            };
          }

          return {
            items: state.items.map((line) =>
              line.id === id ? { ...line, quantity: normalizedQty } : line,
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
