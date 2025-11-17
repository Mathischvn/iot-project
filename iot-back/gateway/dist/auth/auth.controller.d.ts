import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(body: {
        email: string;
        password: string;
    }): Promise<{
        access_token: any;
    }>;
    login(body: {
        email: string;
        password: string;
    }): Promise<{
        access_token: any;
    }>;
    getMe(req: any): Promise<any>;
}
