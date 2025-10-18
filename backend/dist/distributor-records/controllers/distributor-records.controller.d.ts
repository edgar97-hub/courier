import { DistributorRecordsService } from '../services/distributor-records.service';
import { DistributorRecordDTO, UpdateDistributorRecordDTO } from '../dto/distributor-record.dto';
import { CreateDistributorRegistrationDto } from '../dto/create-distributor-registration.dto';
import { PdfGeneratorService } from '../services/pdf-generator.service';
import { Response } from 'express';
export declare class DistributorRecordsController {
    private readonly distributorRecordsService;
    private readonly pdfGeneratorService;
    constructor(distributorRecordsService: DistributorRecordsService, pdfGeneratorService: PdfGeneratorService);
    getRegistrations(req: any, page?: number, limit?: number, sortField?: string, sortOrder?: 'ASC' | 'DESC', search?: string): Promise<import("../services/distributor-records.service").PaginatedRegistrations>;
    createDistributorRecord(body: DistributorRecordDTO, req: any): Promise<import("../entities/distributor-record.entity").DistributorRecordEntity>;
    updateDistributorRecord(id: string, body: UpdateDistributorRecordDTO, req: any): Promise<import("../entities/distributor-record.entity").DistributorRecordEntity>;
    deleteDistributorRecord(id: string): Promise<void>;
    importBatchJson(dtos: CreateDistributorRegistrationDto[], req: any): Promise<import("../../orders/dto/import-result.dto").ImportResult>;
    getOrderPdfA4(orderId: string, req: Request, res: Response): Promise<void>;
}
