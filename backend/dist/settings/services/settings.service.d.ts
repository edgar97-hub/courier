import { DeleteResult, Repository } from 'typeorm';
import { SettingDTO, SettingUpdateDTO } from '../dto/setting.dto';
import { SettingsEntity } from '../entities/settings.entity';
import { Response } from 'express';
export declare class SettingsService {
    private readonly userRepository;
    constructor(userRepository: Repository<SettingsEntity>);
    createUser(body: SettingDTO): Promise<SettingsEntity>;
    findUsers(): Promise<SettingsEntity[]>;
    findUserById(id: string): Promise<SettingsEntity>;
    findBy({ key, value }: {
        key: keyof SettingDTO;
        value: any;
    }): Promise<SettingsEntity>;
    updateUser(body: SettingUpdateDTO, id: string): Promise<any | undefined>;
    deleteUser(id: string): Promise<DeleteResult | undefined>;
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
}
