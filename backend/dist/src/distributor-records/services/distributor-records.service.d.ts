import { DataSource, Repository } from 'typeorm';
import { DistributorRecordEntity } from '../entities/distributor-record.entity';
import { DistributorRecordDTO, UpdateDistributorRecordDTO } from '../dto/distributor-record.dto';
import { UsersEntity } from 'src/users/entities/users.entity';
import { UsersService } from 'src/users/services/users.service';
import { CreateDistributorRegistrationDto } from '../dto/create-distributor-registration.dto';
import { ImportResult } from 'src/orders/dto/import-result.dto';
export interface PaginatedRegistrations {
    data: any[];
    total: number;
    page: number;
    limit: number;
}
export declare class DistributorRecordsService {
    private readonly distributorRecordRepository;
    private readonly userRepository;
    private readonly usersService;
    private dataSource;
    constructor(distributorRecordRepository: Repository<DistributorRecordEntity>, userRepository: Repository<UsersEntity>, usersService: UsersService, dataSource: DataSource);
    findAllPaginated(req: any, options: {
        page: number;
        limit: number;
        sortField: string;
        sortOrder: 'ASC' | 'DESC';
        search: string;
        startDate: any;
        endDate: any;
    }): Promise<PaginatedRegistrations>;
    createDistributorRecord(body: DistributorRecordDTO, userId: string): Promise<DistributorRecordEntity>;
    findDistributorRecordById(id: string): Promise<DistributorRecordEntity>;
    updateDistributorRecord(id: string, body: UpdateDistributorRecordDTO, userId: string): Promise<DistributorRecordEntity>;
    deleteDistributorRecord(id: string): Promise<void>;
    importFromParsedJson(dtos: CreateDistributorRegistrationDto[], userId: string): Promise<ImportResult>;
}
