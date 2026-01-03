import { Repository } from 'typeorm';
import { UpdateOrderRequestDto } from '../dto/order.dto';
import { OrdersEntity } from '../entities/orders.entity';
import { DistrictsEntity } from 'src/districts/entities/districts.entity';
import { ImportResult } from '../dto/import-result.dto';
import { EntityManager } from 'typeorm';
import { OrderLogEntity } from '../entities/orderLog.entity';
import { CashManagementService } from 'src/cashManagement/services/cashManagement.service';
import { SettingsEntity } from 'src/settings/entities/settings.entity';
export declare class OrdersService {
    private readonly orderRepository;
    private readonly orderLogRepository;
    private readonly settingsRepository;
    private districtsRepository;
    private readonly cashManagementService;
    private entityManager;
    constructor(orderRepository: Repository<OrdersEntity>, orderLogRepository: Repository<OrderLogEntity>, settingsRepository: Repository<SettingsEntity>, districtsRepository: Repository<DistrictsEntity>, cashManagementService: CashManagementService, entityManager: EntityManager);
    updateOrderStatus(body: any, idUser: string): Promise<any>;
    batchCreateOrders(payload: any, idUser: any): Promise<{
        success: boolean;
        message: string;
        createdOrders?: OrdersEntity[];
        errors?: any[];
    }>;
    importOrdersFromExcelData(excelRows: any[], idUser: string): Promise<ImportResult | undefined>;
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
}
