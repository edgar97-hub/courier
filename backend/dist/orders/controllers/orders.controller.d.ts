import { OrderDTO, OrderUpdateDTO } from '../dto/order.dto';
import { OrdersService } from '../services/orders.service';
import { ImportResult } from '../dto/import-result.dto';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    register(body: OrderDTO): Promise<import("../entities/orders.entity").OrdersEntity>;
    batchCreateOrders(body: any): Promise<{
        success: boolean;
        message: string;
        createdOrders?: import("../entities/orders.entity").OrdersEntity[];
        errors?: any[];
    }>;
    importOrders(ordersData: any[]): Promise<ImportResult | undefined>;
    findAllOrders(pageNumber?: number, pageSize?: number, sortField?: string, sortDirection?: string, startDate?: string, endDate?: string, status?: string): Promise<{
        items: any;
        total_count: number;
        page_number: number;
        page_size: number;
    }>;
    getFilteredOrders(pageNumber?: number, pageSize?: number, sortField?: string, sortDirection?: string, startDate?: string, endDate?: string, status?: string): Promise<{
        items: any;
        total_count: number;
    }>;
    findOrderById(id: string): Promise<import("../entities/orders.entity").OrdersEntity>;
    updateOrder(id: string, body: OrderUpdateDTO): Promise<import("typeorm").UpdateResult | undefined>;
    updateOrderStatus(body: any): Promise<import("typeorm").UpdateResult>;
    deleteOrder(id: string): Promise<import("typeorm").DeleteResult | undefined>;
}
