import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { UserDTO, UserUpdateDTO } from '../dto/user.dto';
import { UsersEntity } from '../entities/users.entity';
export declare class UsersService {
    private readonly userRepository;
    constructor(userRepository: Repository<UsersEntity>);
    createUser(body: UserDTO): Promise<UsersEntity>;
    findUsers(): Promise<UsersEntity[]>;
    findUsersByRol(rol: string): Promise<UsersEntity[]>;
    findUserById(id: string): Promise<UsersEntity>;
    findBy({ key, value }: {
        key: keyof UserDTO;
        value: any;
    }): Promise<UsersEntity>;
    updateUser(body: UserUpdateDTO, id: string): Promise<UpdateResult | undefined>;
    deleteUser(id: string): Promise<DeleteResult | undefined>;
}
