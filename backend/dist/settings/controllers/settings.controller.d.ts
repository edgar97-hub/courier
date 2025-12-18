import { Response } from 'express';
import { SettingDTO, SettingUpdateDTO } from '../dto/setting.dto';
import { SettingsService } from '../services/settings.service';
import { PromotionalSetItem } from '../entities/settings.entity';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    createSettings(body: SettingDTO): Promise<import("../entities/settings.entity").SettingsEntity>;
    findAllSettings(): Promise<import("../entities/settings.entity").SettingsEntity[]>;
    getPromotionalSets(): Promise<PromotionalSetItem[]>;
    findSettingsById(id: string): Promise<import("../entities/settings.entity").SettingsEntity | null>;
    updateSettings(id: string, body: SettingUpdateDTO): Promise<import("../entities/settings.entity").SettingsEntity>;
    deleteSettings(id: string): Promise<import("typeorm").DeleteResult>;
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
    getGlobalNoticeImage(res: Response): Promise<void>;
}
