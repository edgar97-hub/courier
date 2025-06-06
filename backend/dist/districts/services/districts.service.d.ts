import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { DistrictDTO, DistrictUpdateDTO } from '../dto/district.dto';
import { DistrictsEntity } from '../entities/districts.entity';
export declare class DistrictsService {
    private readonly userRepository;
    constructor(userRepository: Repository<DistrictsEntity>);
    findDistricts({ pageNumber, pageSize, sortField, sortDirection, search, }: {
        pageNumber?: number;
        pageSize?: number;
        sortField?: string;
        sortDirection?: string;
        search?: String;
    }): Promise<{
        items: any;
        total_count: number;
        page_number: number;
        page_size: number;
    }>;
    findDistricts2({ search_term, }: {
        search_term?: string;
    }): Promise<DistrictsEntity[]>;
    createUser(body: DistrictDTO): Promise<DistrictsEntity>;
    findUsers(): Promise<DistrictsEntity[]>;
    findUserById(id: string): Promise<DistrictsEntity>;
    findBy({ key, value }: {
        key: keyof DistrictDTO;
        value: any;
    }): Promise<DistrictsEntity>;
    updateUser(body: DistrictUpdateDTO, id: string): Promise<UpdateResult | undefined>;
    deleteUser(id: string): Promise<DeleteResult | undefined>;
}
