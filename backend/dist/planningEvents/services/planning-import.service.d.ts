import { Repository, Connection } from 'typeorm';
import { PlanningEvent } from '../entities/planning-event.entity';
import { Route } from '../entities/route.entity';
import { Stop, StopStatus } from '../entities/stop.entity';
import { OrdersEntity } from '../../orders/entities/orders.entity';
import { ImportResult } from '../dto/import-result.dto';
export declare class PlanningImportService {
    private planningEventRepository;
    private routeRepository;
    private stopRepository;
    private orderRepository;
    private connection;
    constructor(planningEventRepository: Repository<PlanningEvent>, routeRepository: Repository<Route>, stopRepository: Repository<Stop>, orderRepository: Repository<OrdersEntity>, connection: Connection);
    importPlanning(excelRows: any[]): Promise<ImportResult>;
    getPlanningEvents(page_number: number, page_size: number, sort_field: string, sort_direction: 'asc' | 'desc', start_date?: string, end_date?: string, status?: string): Promise<{
        items: PlanningEvent[];
        total_count: number;
        page_number: number;
        page_size: number;
    }>;
    getPlanningEventDetails(id: number): Promise<PlanningEvent | null>;
    updateStopStatus(id: number, status: StopStatus): Promise<void>;
}
