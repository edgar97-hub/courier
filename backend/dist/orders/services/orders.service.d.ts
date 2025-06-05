import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { OrderDTO, OrderUpdateDTO } from '../dto/order.dto';
import { OrdersEntity } from '../entities/orders.entity';
import { DistrictsEntity } from 'src/districts/entities/districts.entity';
import { ImportResult } from '../dto/import-result.dto';
import { EntityManager } from 'typeorm';
import { OrderLogEntity } from '../entities/orderLog.entity';
export declare class OrdersService {
    private readonly orderRepository;
    private readonly orderLogRepository;
    private districtsRepository;
    private entityManager;
    constructor(orderRepository: Repository<OrdersEntity>, orderLogRepository: Repository<OrderLogEntity>, districtsRepository: Repository<DistrictsEntity>, entityManager: EntityManager);
    createOrder(body: OrderDTO): Promise<OrdersEntity>;
    updateOrderStatus(body: any, idUser: string): Promise<any>;
    batchCreateOrders(payload: any, idUser: any): Promise<{
        success: boolean;
        message: string;
        createdOrders?: OrdersEntity[];
        errors?: any[];
    }>;
    importOrdersFromExcelData(excelRows: any[], idUser: string): Promise<ImportResult | undefined>;
    findOrders({ pageNumber, pageSize, sortField, sortDirection, startDate, endDate, status, search_term, delivery_date, }: {
        pageNumber?: number;
        pageSize?: number;
        sortField?: string;
        sortDirection?: string;
        startDate?: string;
        endDate?: string;
        status?: string;
        search_term?: string;
        delivery_date?: string;
    }, req: any): Promise<{
        items: any;
        total_count: number;
        page_number: number;
        page_size: number;
    }>;
    getFilteredOrders({ pageNumber, pageSize, sortField, sortDirection, startDate, endDate, status, search_term, delivery_date, }: {
        pageNumber?: number;
        pageSize?: number;
        sortField?: string;
        sortDirection?: string;
        startDate?: string;
        endDate?: string;
        status?: string;
        search_term?: string;
        delivery_date?: string;
    }, req: any): Promise<{
        items: any;
        total_count: number;
    }>;
    getOrderByTrackingCode({ tracking_code, }: {
        tracking_code?: string;
    }): Promise<OrdersEntity | null>;
    findOrderById(id: string): Promise<OrdersEntity>;
    findBy({ key, value }: {
        key: keyof OrderDTO;
        value: any;
    }): Promise<OrdersEntity>;
    updateOrder(body: OrderUpdateDTO, id: string): Promise<UpdateResult | undefined>;
    assignDriverToOrder(body: any, id: string, idUser: string): Promise<any>;
    rescheduleOrder(body: any, id: string, idUser: string): Promise<any>;
    deleteOrder(id: string): Promise<DeleteResult | undefined>;
    dashboardOrders(): Promise<any>;
}
