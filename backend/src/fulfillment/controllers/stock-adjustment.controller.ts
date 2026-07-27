import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { AdminAccess } from '../../auth/decorators/admin.decorator';
import { StockAdjustmentService } from '../services/stock-adjustment.service';
import { CreateStockAdjustmentDto } from '../dto/create-stock-adjustment.dto';

@Controller('fulfillment/stock-adjustments')
@UseGuards(AuthGuard, RolesGuard)
export class StockAdjustmentController {
  constructor(
    private readonly stockAdjustmentService: StockAdjustmentService,
  ) {}

  @Post()
  async create(@Body() dto: CreateStockAdjustmentDto, @Request() req) {
    return this.stockAdjustmentService.create(dto, req.idUser);
  }

  @Get('paginated')
  async findPaginated(
    @Query('page_number', new ParseIntPipe({ optional: true }))
    page_number: number = 1,
    @Query('page_size', new ParseIntPipe({ optional: true }))
    page_size: number = 20,
    @Query('sort_field') sort_field: string = 'createdAt',
    @Query('sort_direction') sort_direction: 'ASC' | 'DESC' = 'DESC',
    @Query('search_term') search_term: string = '',
  ) {
    return this.stockAdjustmentService.findPaginated({
      page_number,
      page_size,
      sort_field,
      sort_direction,
      search_term,
    });
  }

  @Get('products/by-company/:companyId')
  async getProductsByCompany(
    @Param('companyId', ParseUUIDPipe) companyId: string,
  ) {
    return this.stockAdjustmentService.getProductsByCompany(companyId);
  }

  @Get('variations/by-product/:productId')
  async getVariationsByProduct(
    @Param('productId', ParseUUIDPipe) productId: string,
  ) {
    return this.stockAdjustmentService.getVariationsByProduct(productId);
  }

  @Get('main-warehouse')
  async getMainWarehouse() {
    return this.stockAdjustmentService.getMainWarehouse();
  }

  @Put(':id/annul')
  async annul(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.stockAdjustmentService.annul(id, req.idUser);
  }
}
