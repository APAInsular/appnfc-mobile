import { useAuthStore } from "@/constants/session.store";
import ky from "ky";

export const API_URL = `${process.env.EXPO_PUBLIC_BACKEND_URL}`;

export const API = ky.create({
    baseUrl: API_URL,
    hooks: {
        beforeRequest: [
            ({ request }) => {
                const token = useAuthStore.getState().token;
                if (token)
                    request.headers.set("Authorization", `Bearer ${token}`);
            },
        ],
    },
});
