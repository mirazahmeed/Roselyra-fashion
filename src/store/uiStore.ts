import { create } from "zustand";

interface UIStore {
	isNavOpen: boolean;
	isSearchOpen: boolean;
	isCartOpen: boolean;
	activeFilter: string | null;
	openNav: () => void;
	closeNav: () => void;
	toggleNav: () => void;
	openSearch: () => void;
	closeSearch: () => void;
	toggleSearch: () => void;
	setActiveFilter: (filter: string | null) => void;
}

export const useUIStore = create<UIStore>((set) => ({
	isNavOpen: false,
	isSearchOpen: false,
	isCartOpen: false,
	activeFilter: null,

	openNav: () => set({ isNavOpen: true }),
	closeNav: () => set({ isNavOpen: false }),
	toggleNav: () => set((s) => ({ isNavOpen: !s.isNavOpen })),

	openSearch: () => set({ isSearchOpen: true }),
	closeSearch: () => set({ isSearchOpen: false }),
	toggleSearch: () => set((s) => ({ isSearchOpen: !s.isSearchOpen })),

	setActiveFilter: (filter) => set({ activeFilter: filter }),
}));
