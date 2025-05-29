import { Response } from 'express';
import { OrdersEntity } from '../entities/orders.entity';
import { Repository } from 'typeorm';
import { SettingsEntity } from 'src/settings/entities/settings.entity';
export declare class OrderPdfGeneratorService {
    private readonly orderRepository;
    private readonly settingRepository;
    private printer;
    constructor(orderRepository: Repository<OrdersEntity>, settingRepository: Repository<SettingsEntity>);
    streamOrderPdfToResponseTest(orderId: string, res: Response): Promise<void>;
    streamOrderPdfToResponse(orderId: string, req: Request, res: Response): Promise<void>;
    streamOrderPdfLandscapeToResponse(orderId: string, req: Request, res: Response): Promise<void>;
    streamOrderPdf80mmToResponse(orderId: string, req: Request, res: Response): Promise<void>;
}
