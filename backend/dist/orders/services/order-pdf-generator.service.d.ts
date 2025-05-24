import { Response } from 'express';
import { OrdersEntity } from '../entities/orders.entity';
import { Repository } from 'typeorm';
export declare class OrderPdfGeneratorService {
    private readonly orderRepository;
    private printer;
    constructor(orderRepository: Repository<OrdersEntity>);
    streamOrderPdfToResponse(orderId: string, res: Response): Promise<void>;
}
