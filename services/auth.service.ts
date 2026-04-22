import { API } from "./base.service";
import { LoginResponse } from "./dtos/auth";

export default class AuthService {
    static async login(
        email: string,
        password: string,
    ): Promise<LoginResponse> {
        const response = await API.post("api/v1/auth/login", {
            json: { email, password },
        }).json<{ data: LoginResponse }>();

        return response.data;
    }

    static async logout(): Promise<boolean> {
        const { message } = await API.post("api/v1/auth/logout").json<{
            message: string | null;
        }>();
        return !!message;
    }
}
