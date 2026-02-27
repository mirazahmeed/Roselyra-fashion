import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/types";

interface WishlistStore {
	items: Product[];
	addItem: (product: Product) => void;
	removeItem: (productId: string) => void;
	toggleItem: (product: Product) => void;
	isWishlisted: (productId: string) => boolean;
	clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
	persist(
		(set, get) => ({
			items: [],

			addItem: (product) => {
				if (!get().isWishlisted(product.id)) {
					set((s) => ({ items: [...s.items, product] }));
				}
			},

			removeItem: (productId) => {
				set((s) => ({
					items: s.items.filter((i) => i.id !== productId),
				}));
			},

			toggleItem: (product) => {
				if (get().isWishlisted(product.id)) {
					get().removeItem(product.id);
				} else {
					get().addItem(product);
				}
			},

			isWishlisted: (productId) =>
				get().items.some((i) => i.id === productId),

			clearWishlist: () => set({ items: [] }),
		}),
		{ name: "roselyra-wishlist" },
	),
);
