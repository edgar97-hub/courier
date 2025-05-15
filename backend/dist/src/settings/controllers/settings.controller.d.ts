import { SettingDTO, SettingUpdateDTO } from '../dto/setting.dto';
import { SettingsService } from '../services/settings.service';
export declare class SettingsController {
    private readonly usersService;
    constructor(usersService: SettingsService);
    registerUser(body: SettingDTO): Promise<import("../entities/settings.entity").SettingsEntity>;
    findAllUsers(): Promise<import("../entities/settings.entity").SettingsEntity[]>;
    findUserById(id: string): Promise<import("../entities/settings.entity").SettingsEntity>;
    updateUser(id: string, body: SettingUpdateDTO): Promise<import("typeorm").UpdateResult | undefined>;
    deleteUser(id: string): Promise<import("typeorm").DeleteResult | undefined>;
}
