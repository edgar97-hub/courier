import { DeleteResult, Repository } from 'typeorm';
import { Response } from 'express';
import { SettingDTO, SettingUpdateDTO } from '../dto/setting.dto';
import { PromotionalSetItem, SettingsEntity } from '../entities/settings.entity';
export declare class SettingsService {
    private readonly settingsRepository;
    constructor(settingsRepository: Repository<SettingsEntity>);
    createSettings(body: SettingDTO): Promise<SettingsEntity>;
    findAllSettings(): Promise<SettingsEntity[]>;
    findSettingsById(id: string): Promise<SettingsEntity | null>;
    findBy({ key, value, }: {
        key: keyof SettingDTO;
        value: any;
    }): Promise<SettingsEntity>;
    getPromotionalSets(): Promise<PromotionalSetItem[] | []>;
    updateSettings(body: SettingUpdateDTO, id: string): Promise<SettingsEntity>;
    deleteSettings(id: string): Promise<DeleteResult>;
    uploadLogo(logoFile: Express.Multer.File, req: Request): Promise<{
        logo_url: string;
    }>;
    uploadTermsPdf(termsPdfFile: Express.Multer.File, req: Request): Promise<{
        terms_conditions_url: string;
    }>;
    uploadFile(file: Express.Multer.File, req: Request): Promise<{
        file_url: string;
    }>;
    getBackgroundImage(res: Response): Promise<void>;
    getLogoImage(res: Response): Promise<void>;
    getGlobalNoticeImage(res: Response): Promise<void>;
}
