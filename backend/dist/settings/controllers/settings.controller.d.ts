import { SettingDTO, SettingUpdateDTO } from '../dto/setting.dto';
import { SettingsService } from '../services/settings.service';
import { Response } from 'express';
export declare class SettingsController {
    private readonly usersService;
    constructor(usersService: SettingsService);
    registerUser(body: SettingDTO): Promise<import("../entities/settings.entity").SettingsEntity>;
    findAllUsers(): Promise<import("../entities/settings.entity").SettingsEntity[]>;
    findUserById(id: string): Promise<import("../entities/settings.entity").SettingsEntity>;
    updateUser(id: string, body: SettingUpdateDTO): Promise<any>;
    deleteUser(id: string): Promise<import("typeorm").DeleteResult | undefined>;
    uploadLogo(logoFile: Express.Multer.File, request: Request): Promise<{
        logo_url: string;
    }>;
    uploadTermsPdf(termsPdfFile: Express.Multer.File, request: Request): Promise<{
        terms_conditions_url: string;
    }>;
    uploadFile(file: Express.Multer.File, request: Request): Promise<{
        file_url: string;
    }>;
    getBackgroundImage(res: Response): Promise<void>;
    getLogoImage(res: Response): Promise<void>;
}
