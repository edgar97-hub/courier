import { UserDTO, UserUpdateDTO } from '../dto/user.dto';
import { UsersService } from '../services/users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    registerUser(body: UserDTO): Promise<import("../entities/users.entity").UsersEntity>;
    findAllUsers(): Promise<import("../entities/users.entity").UsersEntity[]>;
    findUserById(id: string): Promise<import("../entities/users.entity").UsersEntity>;
    updateUser(id: string, body: UserUpdateDTO): Promise<import("typeorm").UpdateResult | undefined>;
    deleteUser(id: string): Promise<import("typeorm").DeleteResult | undefined>;
}
