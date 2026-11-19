import { PlanningImportService } from '../services/planning-import.service';
import { ImportResult } from '../dto/import-result.dto';
export declare class PlanningImportController {
    private readonly planningImportService;
    constructor(planningImportService: PlanningImportService);
    uploadFile(importExcelDto: any[]): Promise<ImportResult>;
    getPlanningEvents(page_number?: number, page_size?: number, sort_field?: string, sort_direction?: 'asc' | 'desc', start_date?: string, end_date?: string, status?: string): Promise<{
        items: import("../entities/planning-event.entity").PlanningEvent[];
        total_count: number;
        page_number: number;
        page_size: number;
    }>;
    getPlanningEventDetails(id: number): Promise<import("../entities/planning-event.entity").PlanningEvent | null>;
}
