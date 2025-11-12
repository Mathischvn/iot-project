import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private readonly prisma;
    private readonly jwt;
    constructor(prisma: PrismaService, jwt: JwtService);
    register(data: {
        email: string;
        password: string;
    }): Promise<{
        access_token: string;
    }>;
    login(email: string, password: string): Promise<{
        access_token: string;
    }>;
    getMe(userId: string): Promise<{
        id: string;
        createdAt: Date;
        email: string;
    }>;
    private generateToken;
}
