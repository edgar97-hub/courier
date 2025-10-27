import { Response } from 'express';
import { Repository } from 'typeorm';
import { SettingsEntity } from 'src/settings/entities/settings.entity';
import { DistributorRecordEntity } from '../entities/distributor-record.entity';
export declare class PdfGeneratorService {
    private readonly distributorRecordRepository;
    private readonly settingRepository;
    private printer;
    constructor(distributorRecordRepository: Repository<DistributorRecordEntity>, settingRepository: Repository<SettingsEntity>);
    streamDistributorRecordPdfToResponseq(recordId: string, res: Response): Promise<void>;
    streamDistributorRecordPdfToResponse2(recordId: string, res: Response): Promise<void>;
    streamDistributorRecordPdfToResponse(recordId: string, res: Response): Promise<void>;
}
