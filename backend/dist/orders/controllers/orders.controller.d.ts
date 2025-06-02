import { OrderDTO, OrderUpdateDTO } from '../dto/order.dto';
import { OrdersService } from '../services/orders.service';
import { Response } from 'express';
import { ImportResult } from '../dto/import-result.dto';
import { OrderPdfGeneratorService } from '../services/order-pdf-generator.service';
export declare class OrdersController {
    private readonly ordersService;
    private readonly orderPdfGeneratorService;
    constructor(ordersService: OrdersService, orderPdfGeneratorService: OrderPdfGeneratorService);
    register(body: OrderDTO): Promise<import("../entities/orders.entity").OrdersEntity>;
    batchCreateOrders(body: any, req: any): Promise<{
        success: boolean;
        message: string;
        createdOrders?: import("../entities/orders.entity").OrdersEntity[];
        errors?: any[];
    }>;
    importOrders(ordersData: any[], req: any): Promise<ImportResult | undefined>;
    findAllOrders(req: any, pageNumber?: number, pageSize?: number, sortField?: string, sortDirection?: string, startDate?: string, endDate?: string, status?: string): Promise<{
        items: any;
        total_count: number;
        page_number: number;
        page_size: number;
    }>;
    getFilteredOrders(req: any, pageNumber?: number, pageSize?: number, sortField?: string, sortDirection?: string, startDate?: string, endDate?: string, status?: string): Promise<{
        items: any;
        total_count: number;
    }>;
    getOrderByTrackingCode(tracking_code?: string): Promise<import("../entities/orders.entity").OrdersEntity | null>;
    findOrderById(id: string): Promise<import("../entities/orders.entity").OrdersEntity>;
    updateOrder(id: string, body: OrderUpdateDTO): Promise<import("typeorm").UpdateResult | undefined>;
    updateOrderStatus(body: any, req: any): Promise<any>;
    assignDriverToOrder(id: string, body: any, req: any): Promise<any>;
    rescheduleOrder(id: string, body: any, req: any): Promise<any>;
    deleteOrder(id: string): Promise<import("typeorm").DeleteResult | undefined>;
    getOrderPdfA4(orderId: string, req: Request, res: Response): Promise<void>;
    getOrderPdfA4Landscape(orderId: string, req: Request, res: Response): Promise<void>;
    getOrderPdfTicket80mm(orderId: string, req: Request, res: Response): Promise<void>;
    getDashboardSummary(): Promise<any>;
}
