import {
  Controller,
  Post,
  Res,
  HttpStatus,
  Patch,
  Param,
  Body,
  UsePipes,
  ValidationPipe,
  Get,
  Query,
  ParseIntPipe, // Importar ParseIntPipe
  HttpCode, // Importar HttpCode
} from '@nestjs/common';
import { PlanningImportService } from '../services/planning-import.service';
import { ImportResult } from '../dto/import-result.dto';
import { UpdateLocationDto } from '../dto/update-location.dto'; // Importar el nuevo DTO

@Controller('planning-events')
export class PlanningImportController {
  constructor(private readonly planningImportService: PlanningImportService) {}

  @Post('import-batch-json')
  @UsePipes(new ValidationPipe({ transform: true }))
  async uploadFile(@Body() importExcelDto: any[]): Promise<ImportResult> {
    return await this.planningImportService.importPlanning(importExcelDto);
  }

  @Get('')
  async getPlanningEvents(
    @Query('page_number') page_number: number = 1,
    @Query('page_size') page_size: number = 10,
    @Query('sort_field') sort_field: string = 'planningDate',
    @Query('sort_direction') sort_direction: 'asc' | 'desc' = 'desc',
    @Query('start_date') start_date?: string,
    @Query('end_date') end_date?: string,
    @Query('status') status?: string,
  ) {
    try {
      return await this.planningImportService.getPlanningEvents(
        +page_number,
        +page_size,
        sort_field,
        sort_direction,
        start_date,
        end_date,
        status,
      );
    } catch (error) {
      throw new Error(`Failed to fetch planning events: ${error.message}`); // Throw error for NestJS to handle
    }
  }

  @Get(':id')
  async getPlanningEventDetails(@Param('id') id: number) {
    try {
      return await this.planningImportService.getPlanningEventDetails(id);
    } catch (error) {
      throw new Error(
        `Failed to fetch planning event details: ${error.message}`,
      );
    }
  }
 
}
