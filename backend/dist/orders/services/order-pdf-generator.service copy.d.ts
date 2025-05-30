import { Response } from 'express';
import { OrdersEntity } from '../entities/orders.entity';
import { Repository } from 'typeorm';
import { SettingsEntity } from 'src/settings/entities/settings.entity';
export declare class OrderPdfGeneratorService {
    private readonly orderRepository;
    private readonly settingRepository;
    private printer;
    constructor(orderRepository: Repository<OrdersEntity>, settingRepository: Repository<SettingsEntity>);
    streamOrderPdfToResponse(orderId: string, res: Response): Promise<void>;
    streamSimplifiedOrderPdfToResponse(orderId: string, res: Response): Promise<void>;
}
