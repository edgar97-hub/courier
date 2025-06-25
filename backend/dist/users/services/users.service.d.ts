import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { RegistrationUserCompanyDTO, UserCompanyUpdateDTO, UserDTO, UserProfile, UserUpdateDTO } from '../dto/user.dto';
import { UsersEntity } from '../entities/users.entity';
export declare class UsersService {
    private readonly userRepository;
    constructor(userRepository: Repository<UsersEntity>);
    createUser(body: UserDTO): Promise<UsersEntity>;
    registerCompany(body: RegistrationUserCompanyDTO): Promise<UsersEntity>;
    findUsers(): Promise<UsersEntity[]>;
    findUsersByRol({ search_term, role, }: {
        search_term?: string;
        role?: string;
    }): Promise<UsersEntity[]>;
    findUserById(id: string): Promise<UsersEntity>;
    findUserPerfil(idUser: string): Promise<UsersEntity>;
    findBy({ key, value }: {
        key: keyof UserDTO;
        value: any;
    }): Promise<UsersEntity>;
    updateUser(body: UserUpdateDTO, id: string): Promise<UpdateResult | undefined>;
    updateUserCompany(body: UserCompanyUpdateDTO, id: string): Promise<UpdateResult | undefined>;
    updateProfile(body: UserProfile, id: string): Promise<any | undefined>;
    deleteUser(id: string): Promise<DeleteResult | undefined>;
}
