import { useAuthStore } from "@/constants/session.store";
import AuthService from "@/services/auth.service";
import { LoginRequest } from "@/services/dtos/auth";
import { useState } from "react";

export const useAuth = () => {
    const login = useAuthStore((s) => s.login);
    const logout = useAuthStore((s) => s.logout);

    const [loading, setLoading] = useState(false);

    const handleLogin = async (credentials: LoginRequest) => {
        setLoading(true);
        try {
            const { token, user } = await AuthService.login(
                credentials.email,
                credentials.password,
            );
            await login(token, user);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        setLoading(true);
        try {
            const success = await AuthService.logout();
            if (success) await logout();

            setLoading(true);
        } finally {
            setLoading(false);
        }
    };

    return { handleLogin, handleLogout, loading };
};
