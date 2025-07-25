import { Repository } from 'typeorm';
import { CashManagementEntity } from '../entities/cashManagement.entity';
import { Response } from 'express';
import { SettingsEntity } from '../../settings/entities/settings.entity';
export declare class CashMovementPdfGeneratorService {
    private readonly cashMovementRepository;
    private readonly settingRepository;
    private printer;
    constructor(cashMovementRepository: Repository<CashManagementEntity>, settingRepository: Repository<SettingsEntity>);
    streamCashMovementPdfToResponse(movementId: string, req: Request, res: Response): Promise<void>;
}
