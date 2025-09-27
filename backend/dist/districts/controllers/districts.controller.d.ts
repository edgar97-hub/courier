import { DistrictDTO, DistrictUpdateDTO } from '../dto/district.dto';
import { DistrictsService } from '../services/districts.service';
export declare class DistrictsController {
    private readonly usersService;
    constructor(usersService: DistrictsService);
    registerUser(body: DistrictDTO): Promise<import("../entities/districts.entity").DistrictsEntity>;
    findAllUsers(is_express?: boolean): Promise<import("../entities/districts.entity").DistrictsEntity[]>;
    findAllOrders(pageNumber?: number, pageSize?: number, sortField?: string, sortDirection?: string, search?: string): Promise<{
        items: any;
        total_count: number;
        page_number: number;
        page_size: number;
    }>;
    findUsersByRol(search_term: string, is_express?: boolean): Promise<import("../entities/districts.entity").DistrictsEntity[]>;
    findUserById(id: string): Promise<import("../entities/districts.entity").DistrictsEntity>;
    updateUser(id: string, body: DistrictUpdateDTO): Promise<import("typeorm").UpdateResult | undefined>;
    deleteUser(id: string): Promise<import("typeorm").DeleteResult | undefined>;
}
