import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { OrderDTO, OrderUpdateDTO } from '../dto/order.dto';
import { OrdersEntity } from '../entities/orders.entity';
export declare class OrdersService {
    private readonly userRepository;
    constructor(userRepository: Repository<OrdersEntity>);
    createUser(body: OrderDTO): Promise<OrdersEntity>;
    batchCreateOrders(payload: any): Promise<{
        success: boolean;
        message: string;
        createdOrders?: OrdersEntity[];
        errors?: any[];
    }>;
    findUsers({ pageNumber, pageSize, sortField, sortDirection, startDate, endDate, }: {
        pageNumber?: number;
        pageSize?: number;
        sortField?: string;
        sortDirection?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<{
        items: any;
        total_count: number;
        page_number: number;
        page_size: number;
    }>;
    findUserById(id: string): Promise<OrdersEntity>;
    findBy({ key, value }: {
        key: keyof OrderDTO;
        value: any;
    }): Promise<OrdersEntity>;
    updateUser(body: OrderUpdateDTO, id: string): Promise<UpdateResult | undefined>;
    deleteUser(id: string): Promise<DeleteResult | undefined>;
}
