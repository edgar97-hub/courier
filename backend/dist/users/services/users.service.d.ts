import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { RegistrationUserCompanyDTO, UserCompanyUpdateDTO, UserDTO, UserProfile, UserUpdateDTO } from '../dto/user.dto';
import { UsersEntity } from '../entities/users.entity';
export interface PaginatedUsers {
    items: UsersEntity[];
    total_count: number;
    page_number: number;
    page_size: number;
}
export declare class UsersService {
    private readonly userRepository;
    constructor(userRepository: Repository<UsersEntity>);
    createUser(body: UserDTO): Promise<UsersEntity>;
    registerCompany(body: RegistrationUserCompanyDTO): Promise<UsersEntity>;
    findUsers(): Promise<UsersEntity[]>;
    findUsersByRol({ search_term, role, fulfillment_enabled, }: {
        search_term?: string;
        role?: string;
        fulfillment_enabled?: boolean;
    }): Promise<UsersEntity[]>;
    findUsersPaginated(options: {
        page_number: number;
        page_size: number;
        sort_field: string;
        sort_direction: 'ASC' | 'DESC';
        search_term: string;
        role: string;
    }): Promise<PaginatedUsers>;
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
