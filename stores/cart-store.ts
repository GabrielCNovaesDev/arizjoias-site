import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  imageUrl: string;
  priceCents: number;
  quantity: number;
  weightGrams: number;
  widthCm: number;
  heightCm: number;
  lengthCm: number;
  maxStock: number;
}

export interface ShippingOption {
  id: number;
  name: string;
  company: string;
  priceCents: number;
  deliveryDays: number;
}

interface CartStore {
  items: CartItem[];
  selectedShipping: ShippingOption | null;

  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  setShipping: (option: ShippingOption | null) => void;

  getSubtotalCents: () => number;
  getTotalCents: () => number;
  getItemCount: () => number;

  // Legacy alias used by header.tsx
  totalItems: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      selectedShipping: null,

      addItem(item, quantity = 1) {
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId);
          if (existing) {
            const newQty = Math.min(existing.quantity + quantity, item.maxStock);
            return {
              items: state.items.map((i) =>
                i.productId === item.productId ? { ...i, quantity: newQty } : i
              ),
            };
          }
          return {
            items: [
              ...state.items,
              { ...item, quantity: Math.min(quantity, item.maxStock) },
            ],
          };
        });
      },

      removeItem(productId) {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
          // Reset shipping when cart changes
          selectedShipping: null,
        }));
      },

      updateQuantity(productId, quantity) {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId
              ? { ...i, quantity: Math.min(quantity, i.maxStock) }
              : i
          ),
          selectedShipping: null,
        }));
      },

      clear() {
        set({ items: [], selectedShipping: null });
      },

      setShipping(option) {
        set({ selectedShipping: option });
      },

      getSubtotalCents() {
        return get().items.reduce(
          (sum, item) => sum + item.priceCents * item.quantity,
          0
        );
      },

      getTotalCents() {
        const subtotal = get().getSubtotalCents();
        const shipping = get().selectedShipping?.priceCents ?? 0;
        return subtotal + shipping;
      },

      getItemCount() {
        return get().items.reduce((sum, i) => sum + i.quantity, 0);
      },

      // Legacy alias
      totalItems() {
        return get().getItemCount();
      },
    }),
    { name: 'ariz-cart' }
  )
);
