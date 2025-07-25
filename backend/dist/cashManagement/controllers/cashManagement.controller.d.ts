import { CashManagementService } from '../services/cashManagement.service';
import { CreateCashMovementDto, QueryCashMovementDto, DetailedCashMovementSummaryDto } from '../dto/cashManagement.dto';
import { Response } from 'express';
import { CashMovementPdfGeneratorService } from '../services/cash-movement-pdf-generator.service';
export declare class CashManagementController {
    private readonly cashManagementService;
    private readonly cashMovementPdfGeneratorService;
    constructor(cashManagementService: CashManagementService, cashMovementPdfGeneratorService: CashMovementPdfGeneratorService);
    createManualMovement(createCashMovementDto: CreateCashMovementDto, req: any): Promise<import("../entities/cashManagement.entity").CashManagementEntity>;
    updateCashMovement(id: string, updateCashMovementDto: CreateCashMovementDto, req: any): Promise<import("../entities/cashManagement.entity").CashManagementEntity>;
    deleteCashMovement(id: string): Promise<void>;
    findAllMovements(query: QueryCashMovementDto, pageNumber?: number, pageSize?: number): Promise<{
        movements: import("../entities/cashManagement.entity").CashManagementEntity[];
        total: number;
    }>;
    getBalanceSummary(query: QueryCashMovementDto): Promise<{
        totalIncome: number;
        totalExpense: number;
        balance: number;
    }>;
    getDetailedBalanceSummary(query: QueryCashMovementDto): Promise<DetailedCashMovementSummaryDto>;
    getCashMovementPdf(id: string, req: Request, res: Response): Promise<void>;
}
