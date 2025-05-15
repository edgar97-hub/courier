import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { SettingDTO, SettingUpdateDTO } from '../dto/setting.dto';
import { SettingsEntity } from '../entities/settings.entity';
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
    updateUser(body: SettingUpdateDTO, id: string): Promise<UpdateResult | undefined>;
    deleteUser(id: string): Promise<DeleteResult | undefined>;
}
