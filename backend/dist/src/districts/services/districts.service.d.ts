import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { DistrictDTO, DistrictUpdateDTO } from '../dto/district.dto';
import { DistrictsEntity } from '../entities/districts.entity';
export declare class DistrictsService {
    private readonly userRepository;
    constructor(userRepository: Repository<DistrictsEntity>);
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
