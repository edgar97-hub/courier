import { DistrictDTO, DistrictUpdateDTO } from '../dto/district.dto';
import { DistrictsService } from '../services/districts.service';
export declare class DistrictsController {
    private readonly usersService;
    constructor(usersService: DistrictsService);
    registerUser(body: DistrictDTO): Promise<import("../entities/districts.entity").DistrictsEntity>;
    findAllUsers(): Promise<import("../entities/districts.entity").DistrictsEntity[]>;
    findUserById(id: string): Promise<import("../entities/districts.entity").DistrictsEntity>;
    updateUser(id: string, body: DistrictUpdateDTO): Promise<import("typeorm").UpdateResult | undefined>;
    deleteUser(id: string): Promise<import("typeorm").DeleteResult | undefined>;
}
