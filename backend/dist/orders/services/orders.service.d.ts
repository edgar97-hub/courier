import { Repository } from 'typeorm';
import { UpdateOrderRequestDto } from '../dto/order.dto';
import { OrdersEntity } from '../entities/orders.entity';
import { DistrictsEntity } from 'src/districts/entities/districts.entity';
import { ImportResult } from '../dto/import-result.dto';
import { UsersEntity } from 'src/users/entities/users.entity';
import { OrderLogEntity } from '../entities/orderLog.entity';
import { CashManagementService } from 'src/cashManagement/services/cashManagement.service';
import { SettingsEntity } from 'src/settings/entities/settings.entity';
import { StockAdjustmentService } from 'src/fulfillment/services/stock-adjustment.service';
import { KardexService } from 'src/fulfillment/services/kardex.service';
import { InventoryEntity } from 'src/fulfillment/entities/inventory.entity';
export declare class OrdersService {
    private readonly orderRepository;
    private readonly orderLogRepository;
    private readonly settingsRepository;
    private districtsRepository;
    private readonly userRepository;
    private readonly inventoryRepository;
    private readonly cashManagementService;
    private readonly stockAdjustmentService;
    private readonly kardexService;
    constructor(orderRepository: Repository<OrdersEntity>, orderLogRepository: Repository<OrderLogEntity>, settingsRepository: Repository<SettingsEntity>, districtsRepository: Repository<DistrictsEntity>, userRepository: Repository<UsersEntity>, inventoryRepository: Repository<InventoryEntity>, cashManagementService: CashManagementService, stockAdjustmentService: StockAdjustmentService, kardexService: KardexService);
    updateOrderStatus(body: any, idUser: string): Promise<any>;
    batchCreateOrders(payload: any, idUser: any): Promise<{
        success: boolean;
        message: string;
        createdOrders?: OrdersEntity[];
        errors?: any[];
    }>;
    private deductFulfillmentStock;
    importOrdersFromExcelData(excelRows: any[], idUser: string): Promise<ImportResult | undefined>;
    private applyDiscountsToBatch;
    private updateOrderDiscount;
    previewVolumeDiscount(userId: string, deliveryDate: string): Promise<{
        applies: boolean;
        message: string;
        currentDailyCount?: undefined;
        nextSequenceNumber?: undefined;
        discountPercentage?: undefined;
    } | {
        applies: boolean;
        message?: undefined;
        currentDailyCount?: undefined;
        nextSequenceNumber?: undefined;
        discountPercentage?: undefined;
    } | {
        applies: boolean;
        currentDailyCount: number;
        nextSequenceNumber: number;
        discountPercentage: number;
        message: string;
    } | {
        applies: boolean;
        currentDailyCount: number;
        nextSequenceNumber: number;
        message: string;
        discountPercentage?: undefined;
    }>;
    simulateBatchVolumeDiscount(tempOrders: any[]): Promise<{
        temp_id: any;
        appliedDiscount: number;
    }[]>;
    getActiveDistrictsByDateRange(req: any, startDate: string, endDate: string, status?: string): Promise<string[]>;
    findOrders({ pageNumber, pageSize, sortField, sortDirection, startDate, endDate, status, search_term, delivery_date, districts, }: {
        pageNumber?: number;
        pageSize?: number;
        sortField?: string;
        sortDirection?: string;
        startDate?: string;
        endDate?: string;
        status?: string;
        search_term?: string;
        delivery_date?: string;
        districts?: string;
    }, req: any): Promise<{
        items: any;
        total_count: number;
        page_number: number;
        page_size: number;
    }>;
    getFilteredOrders({ sortField, sortDirection, startDate, endDate, status, search_term, delivery_date, districts, }: {
        sortField?: string;
        sortDirection?: string;
        startDate?: string;
        endDate?: string;
        status?: string;
        search_term?: string;
        delivery_date?: string;
        districts?: string;
    }, req: any): Promise<{
        items: any;
        total_count: number;
    }>;
    getOrderByTrackingCode({ tracking_code, }: {
        tracking_code?: string;
    }): Promise<OrdersEntity | null>;
    findOrderById(id: string): Promise<any>;
    assignDriverToOrder(body: any, id: string, idUser: string): Promise<any>;
    rescheduleOrder(body: any, id: string, idUser: string): Promise<any>;
    updateOrder(id: string, updateData: UpdateOrderRequestDto, idUser: string): Promise<OrdersEntity>;
    dashboardOrders(req: any): Promise<any>;
    findOrdersByRegistrationDate({ pageNumber, pageSize, sortField, sortDirection, startDate, endDate, status, search_term, }: {
        pageNumber?: number;
        pageSize?: number;
        sortField?: string;
        sortDirection?: string;
        startDate?: string;
        endDate?: string;
        status?: string;
        search_term?: string;
    }, req: any): Promise<{
        items: any;
        total_count: number;
        page_number: number;
        page_size: number;
    }>;
    getVolumeDiscountReport(startDate: string, endDate: string, companyId?: string, statusMeta?: 'ALCANZADA' | 'NO_ALCANZADA'): Promise<{
        date: any;
        clientName: any;
        totalOrders: number;
        rangeReached: any;
        discount: string;
        totalInvoiced: string;
        hasReachedMeta: boolean;
    }[]>;
}
