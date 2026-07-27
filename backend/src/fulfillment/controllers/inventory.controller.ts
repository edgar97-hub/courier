import {
  Controller,
  Get,
  Query,
  ParseIntPipe,
  UseGuards,
  Header,
} from '@nestjs/common';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { AdminAccess } from '../../auth/decorators/admin.decorator';
import { InventoryService } from '../services/inventory.service';

@Controller('fulfillment/inventory')
@UseGuards(AuthGuard, RolesGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('query')
  async queryInventory(
    @Query('page_number', new ParseIntPipe({ optional: true }))
    page_number: number = 1,
    @Query('page_size', new ParseIntPipe({ optional: true }))
    page_size: number = 20,
    @Query('sort_field') sort_field: string = 'createdAt',
    @Query('sort_direction') sort_direction: 'ASC' | 'DESC' = 'DESC',
    @Query('search_term') search_term: string = '',
    @Query('low_stock_only') low_stock_only?: string,
    @Query('filter_company') filter_company?: string,
    @Query('filter_company_id') filter_company_id?: string,
    @Query('filter_product') filter_product?: string,
    @Query('filter_product_id') filter_product_id?: string,
    @Query('filter_variation_id') filter_variation_id?: string,
    @Query('filter_sku') filter_sku?: string,
    @Query('filter_color') filter_color?: string,
    @Query('filter_size') filter_size?: string,
    @Query('filter_model') filter_model?: string,
    @Query('filter_stock_from') filter_stock_from_str?: string,
    @Query('filter_stock_to') filter_stock_to_str?: string,
    @Query('filter_min_stock_from') filter_min_stock_from_str?: string,
    @Query('filter_min_stock_to') filter_min_stock_to_str?: string,
  ) {
    const filter_stock_from = filter_stock_from_str !== undefined ? Number(filter_stock_from_str) : undefined;
    const filter_stock_to = filter_stock_to_str !== undefined ? Number(filter_stock_to_str) : undefined;
    const filter_min_stock_from = filter_min_stock_from_str !== undefined ? Number(filter_min_stock_from_str) : undefined;
    const filter_min_stock_to = filter_min_stock_to_str !== undefined ? Number(filter_min_stock_to_str) : undefined;
    return this.inventoryService.queryInventory({
      page_number,
      page_size,
      sort_field,
      sort_direction,
      search_term,
      filter_company,
      filter_company_id,
      filter_product,
      filter_product_id,
      filter_variation_id,
      filter_sku,
      filter_color,
      filter_size,
      filter_model,
      filter_stock_from,
      filter_stock_to,
      filter_min_stock_from,
      filter_min_stock_to,
    });
  }
}
