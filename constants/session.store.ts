import { create } from "zustand";
import { SessionStorage } from "./session.secure-store";

interface AuthState {
    token: string | null;
    user: any | null;
    hydrate: () => Promise<void>;
    login: (token: string, user: any) => Promise<void>;
    logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    token: null,
    user: null,

    hydrate: async () => {
        const token = await SessionStorage.getAccessToken();
        const user = await SessionStorage.getUser();

        set({ token, user });
    },

    login: async (token, user) => {
        await SessionStorage.setAccessToken(token);
        await SessionStorage.setUser(user);

        set({ token, user });
    },

    logout: async () => {
        await SessionStorage.clear();
        set({ token: null, user: null });
    },
}));
