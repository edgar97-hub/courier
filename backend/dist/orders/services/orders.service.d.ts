import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { OrderDTO, OrderUpdateDTO } from '../dto/order.dto';
import { OrdersEntity } from '../entities/orders.entity';
import { DistrictsEntity } from 'src/districts/entities/districts.entity';
import { ImportResult } from '../dto/import-result.dto';
import { EntityManager } from 'typeorm';
export declare class OrdersService {
    private readonly orderRepository;
    private districtsRepository;
    private entityManager;
    constructor(orderRepository: Repository<OrdersEntity>, districtsRepository: Repository<DistrictsEntity>, entityManager: EntityManager);
    createOrder(body: OrderDTO): Promise<OrdersEntity>;
    updateOrderStatus(body: any): Promise<UpdateResult>;
    batchCreateOrders(payload: any): Promise<{
        success: boolean;
        message: string;
        createdOrders?: OrdersEntity[];
        errors?: any[];
    }>;
    importOrdersFromExcelData(excelRows: any[]): Promise<ImportResult | undefined>;
    findOrders({ pageNumber, pageSize, sortField, sortDirection, startDate, endDate, status, }: {
        pageNumber?: number;
        pageSize?: number;
        sortField?: string;
        sortDirection?: string;
        startDate?: string;
        endDate?: string;
        status?: string;
    }): Promise<{
        items: any;
        total_count: number;
        page_number: number;
        page_size: number;
    }>;
    getFilteredOrders({ sortField, sortDirection, startDate, endDate, status, }: {
        sortField?: string;
        sortDirection?: string;
        startDate?: string;
        endDate?: string;
        status?: string;
    }): Promise<{
        items: any;
        total_count: number;
    }>;
    findOrderById(id: string): Promise<OrdersEntity>;
    findBy({ key, value }: {
        key: keyof OrderDTO;
        value: any;
    }): Promise<OrdersEntity>;
    updateOrder(body: OrderUpdateDTO, id: string): Promise<UpdateResult | undefined>;
    deleteOrder(id: string): Promise<DeleteResult | undefined>;
}
