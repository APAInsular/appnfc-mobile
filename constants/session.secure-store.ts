import * as SecureStore from "expo-secure-store";

const KEYS = {
    accessToken: "session_access_token",
    refreshToken: "session_refresh_token",
    user: "session_user",
};

export const SessionStorage = {
    async setAccessToken(token: string) {
        await SecureStore.setItemAsync(KEYS.accessToken, token);
    },

    async getAccessToken() {
        return SecureStore.getItemAsync(KEYS.accessToken);
    },

    async setRefreshToken(token: string) {
        await SecureStore.setItemAsync(KEYS.refreshToken, token);
    },

    async getRefreshToken() {
        return SecureStore.getItemAsync(KEYS.refreshToken);
    },

    async setUser(user: any) {
        await SecureStore.setItemAsync(KEYS.user, JSON.stringify(user));
    },

    async getUser<T = any>(): Promise<T | null> {
        const data = await SecureStore.getItemAsync(KEYS.user);
        return data ? JSON.parse(data) : null;
    },

    async clear() {
        await SecureStore.deleteItemAsync(KEYS.accessToken);
        await SecureStore.deleteItemAsync(KEYS.refreshToken);
        await SecureStore.deleteItemAsync(KEYS.user);
    },
};
