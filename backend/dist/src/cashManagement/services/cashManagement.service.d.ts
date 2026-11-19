import { Repository } from 'typeorm';
import { CashManagementEntity } from '../entities/cashManagement.entity';
import { CreateCashMovementDto, QueryCashMovementDto, DetailedCashMovementSummaryDto } from '../dto/cashManagement.dto';
import { UsersService } from '../../users/services/users.service';
export declare class CashManagementService {
    private readonly cashMovementRepository;
    private readonly usersService;
    constructor(cashMovementRepository: Repository<CashManagementEntity>, usersService: UsersService);
    createManualMovement(dto: CreateCashMovementDto, userId: string): Promise<CashManagementEntity>;
    updateCashMovement(id: string, dto: CreateCashMovementDto, userId: string): Promise<CashManagementEntity>;
    deleteCashMovement(id: string): Promise<void>;
    createAutomaticIncome(amount: number, paymentMethod: string, userId: string, orderId: string, code: number, delivery_date: string): Promise<CashManagementEntity>;
    reverseAutomaticIncome(orderId: string): Promise<void>;
    updateDueToOrderModification(orderId: string, amount: number, paymentMethod: string): Promise<CashManagementEntity>;
    findAllMovements(query: QueryCashMovementDto, pageNumber?: number, pageSize?: number): Promise<{
        movements: CashManagementEntity[];
        total: number;
    }>;
    getBalanceSummary(query: QueryCashMovementDto): Promise<{
        totalIncome: number;
        totalExpense: number;
        balance: number;
    }>;
    getDetailedBalanceSummary(query: QueryCashMovementDto): Promise<DetailedCashMovementSummaryDto>;
    private buildWhereClauseForSummary;
}
