import * as jwt from 'jsonwebtoken';
import { UsersEntity } from 'src/users/entities/users.entity';
import { UsersService } from 'src/users/services/users.service';
import { AuthResponse } from '../interfaces/auth.interface';
export declare class AuthService {
    private readonly userService;
    constructor(userService: UsersService);
    validateUser(username: string, password: string): Promise<UsersEntity | null>;
    signJWT({ payload, secret, expires, }: {
        payload: jwt.JwtPayload;
        secret: string;
        expires: number | string;
    }): string;
    generateJWT(user: UsersEntity): Promise<AuthResponse>;
}
