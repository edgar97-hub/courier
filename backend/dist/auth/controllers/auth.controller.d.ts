import { AuthDTO } from '../dto/auth.dto';
import { AuthService } from '../services/auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login({ email, password }: AuthDTO): Promise<import("../interfaces/auth.interface").AuthResponse>;
}
