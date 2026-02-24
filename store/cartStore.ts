import { create } from 'zustand';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';
import type { Product } from '@models/Product';

export interface CartItem extends Product {
  quantity: number;
  selected: boolean; // New: flag for Taobao-style selection
  isReady?: boolean; // New: flag for stock availability
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  toggleItemSelection: (productId: string) => void; // New
  toggleAllSelection: (selected: boolean) => void; // New
  clearCart: () => void;
  getTotalItems: () => number;
  getSelectedTotalItems: () => number; // New
  getTotalPrice: () => number;
  getSelectedTotalPrice: () => number; // New
  getSelectedTotalItemsByStatus: (status: 'in-stock' | 'pre-order') => number; // New
  getSelectedTotalPriceByStatus: (status: 'in-stock' | 'pre-order') => number; // New
  setAuthenticated: (isAuth: boolean) => void;
}

/**
 * Custom storage that switches between localStorage (logged-in) and sessionStorage (guest).
 * Guests lose their cart on tab close / refresh.
 * Logged-in users keep their cart across sessions.
 */
let currentStorage: Storage | undefined =
  typeof window !== 'undefined' ? sessionStorage : undefined;

const adaptiveStorage: StateStorage = {
  getItem: (name) => currentStorage?.getItem(name) ?? null,
  setItem: (name, value) => currentStorage?.setItem(name, value),
  removeItem: (name) => currentStorage?.removeItem(name),
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        const items = get().items;
        const existingItem = items.find((item) => item.id === product.id);

        if (existingItem) {
          set({
            items: items.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          });
        } else {
          set({
            items: [
              ...items,
              {
                ...product,
                quantity: 1,
                selected: true,
                isReady: (product.stockStatus || 'in-stock') === 'in-stock'
              }
            ]
          });
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((item) => item.id !== productId) });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.id === productId ? { ...item, quantity } : item
          ),
        });
      },

      toggleItemSelection: (productId) => {
        set({
          items: get().items.map((item) =>
            item.id === productId ? { ...item, selected: !item.selected } : item
          ),
        });
      },

      toggleAllSelection: (selected) => {
        set({
          items: get().items.map((item) => ({ ...item, selected })),
        });
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSelectedTotalItems: () => {
        return get().items
          .filter(item => item.selected)
          .reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      getSelectedTotalPrice: () => {
        return get().items
          .filter(item => item.selected)
          .reduce((total, item) => total + item.price * item.quantity, 0);
      },

      getSelectedTotalItemsByStatus: (status) => {
        return get().items
          .filter(item => item.selected && (item.stockStatus || 'in-stock') === status)
          .reduce((total, item) => total + item.quantity, 0);
      },

      getSelectedTotalPriceByStatus: (status) => {
        return get().items
          .filter(item => item.selected && (item.stockStatus || 'in-stock') === status)
          .reduce((total, item) => total + item.price * item.quantity, 0);
      },

      setAuthenticated: (isAuth: boolean) => {
        if (typeof window === 'undefined') return;

        const key = 'soyol-cart-storage';

        if (isAuth) {
          // Switching to localStorage: Merge session items with saved local items
          const sessionItems = get().items;
          let localItems: CartItem[] = [];

          try {
            const localData = localStorage.getItem(key);
            if (localData) {
              const parsed = JSON.parse(localData);
              if (parsed.state && Array.isArray(parsed.state.items)) {
                localItems = parsed.state.items;
              }
            }
          } catch (e) {
            console.error('Failed to parse local cart:', e);
          }

          // Merge logic: Combine items, sum quantities for duplicates
          const mergedMap = new Map<string, CartItem>();
          
          // Start with local items
          localItems.forEach(item => mergedMap.set(item.id, item));
          
          // Merge session items
          sessionItems.forEach(item => {
            if (mergedMap.has(item.id)) {
              const existing = mergedMap.get(item.id)!;
              mergedMap.set(item.id, { 
                ...item, // Prefer session properties (e.g. updated price/name)
                quantity: existing.quantity + item.quantity 
              });
            } else {
              mergedMap.set(item.id, item);
            }
          });
          
          const finalItems = Array.from(mergedMap.values());

          // Update storage pointer and state
          currentStorage = localStorage;
          set({ items: finalItems });
          
          // Clear session storage to avoid duplicates/confusion
          sessionStorage.removeItem(key);
        } else {
          // Switching to sessionStorage (Logout): Clear user data
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
          currentStorage = sessionStorage;
          set({ items: [] });
        }
      },
    }),
    {
      name: 'soyol-cart-storage',
      storage: createJSONStorage(() => adaptiveStorage),
    }
  )
);
