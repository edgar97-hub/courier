import { OrderDTO, OrderUpdateDTO } from '../dto/order.dto';
import { OrdersService } from '../services/orders.service';
export declare class OrdersController {
    private readonly usersService;
    constructor(usersService: OrdersService);
    register(body: OrderDTO): Promise<import("../entities/orders.entity").OrdersEntity>;
    batchCreateOrders(body: any): Promise<{
        success: boolean;
        message: string;
        createdOrders?: import("../entities/orders.entity").OrdersEntity[];
        errors?: any[];
    }>;
    findAllUsers(pageNumber?: number, pageSize?: number, sortField?: string, sortDirection?: string, startDate?: string, endDate?: string): Promise<{
        items: any;
        total_count: number;
        page_number: number;
        page_size: number;
    }>;
    findUserById(id: string): Promise<import("../entities/orders.entity").OrdersEntity>;
    updateUser(id: string, body: OrderUpdateDTO): Promise<import("typeorm").UpdateResult | undefined>;
    deleteUser(id: string): Promise<import("typeorm").DeleteResult | undefined>;
}
