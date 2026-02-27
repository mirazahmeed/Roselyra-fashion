import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "@/types";

interface AuthStore {
	user: AuthUser | null;
	accessToken: string | null;
	isLoading: boolean;
	setUser: (user: AuthUser | null) => void;
	setAccessToken: (token: string | null) => void;
	setLoading: (loading: boolean) => void;
	logout: () => void;
	isAdmin: () => boolean;
	isEditor: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
	persist(
		(set, get) => ({
			user: null,
			accessToken: null,
			isLoading: false,

			setUser: (user) => set({ user }),
			setAccessToken: (accessToken) => set({ accessToken }),
			setLoading: (isLoading) => set({ isLoading }),

			logout: () => set({ user: null, accessToken: null }),

			isAdmin: () => get().user?.role === "ADMIN",
			isEditor: () =>
				get().user?.role === "ADMIN" || get().user?.role === "EDITOR",
		}),
		{
			name: "roselyra-auth",
			partialize: (state) => ({
				user: state.user,
				accessToken: state.accessToken,
			}),
		},
	),
);
