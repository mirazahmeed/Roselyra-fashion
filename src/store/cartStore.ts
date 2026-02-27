import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product, LocalCartItem } from "@/types";

interface CartStore {
	items: LocalCartItem[];
	isOpen: boolean;
	addItem: (
		product: Product,
		quantity?: number,
		size?: string | null,
		color?: string | null,
	) => void;
	removeItem: (
		productId: string,
		size?: string | null,
		color?: string | null,
	) => void;
	updateQuantity: (
		productId: string,
		quantity: number,
		size?: string | null,
		color?: string | null,
	) => void;
	clearCart: () => void;
	toggleCart: () => void;
	openCart: () => void;
	closeCart: () => void;
	totalItems: () => number;
	subtotal: () => number;
}

export const useCartStore = create<CartStore>()(
	persist(
		(set, get) => ({
			items: [],
			isOpen: false,

			addItem: (product, quantity = 1, size = null, color = null) => {
				set((state) => {
					const existing = state.items.find(
						(i) =>
							i.product.id === product.id &&
							i.size === size &&
							i.color === color,
					);
					if (existing) {
						return {
							items: state.items.map((i) =>
								(
									i.product.id === product.id &&
									i.size === size &&
									i.color === color
								) ?
									{ ...i, quantity: i.quantity + quantity }
								:	i,
							),
						};
					}
					return {
						items: [
							...state.items,
							{ product, quantity, size, color },
						],
					};
				});
			},

			removeItem: (productId, size = null, color = null) => {
				set((state) => ({
					items: state.items.filter(
						(i) =>
							!(
								i.product.id === productId &&
								i.size === size &&
								i.color === color
							),
					),
				}));
			},

			updateQuantity: (
				productId,
				quantity,
				size = null,
				color = null,
			) => {
				if (quantity < 1) {
					get().removeItem(productId, size, color);
					return;
				}
				set((state) => ({
					items: state.items.map((i) =>
						(
							i.product.id === productId &&
							i.size === size &&
							i.color === color
						) ?
							{ ...i, quantity }
						:	i,
					),
				}));
			},

			clearCart: () => set({ items: [] }),
			toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),
			openCart: () => set({ isOpen: true }),
			closeCart: () => set({ isOpen: false }),

			totalItems: () =>
				get().items.reduce((sum, i) => sum + i.quantity, 0),
			subtotal: () =>
				get().items.reduce(
					(sum, i) => sum + i.product.price * i.quantity,
					0,
				),
		}),
		{ name: "roselyra-cart" },
	),
);
