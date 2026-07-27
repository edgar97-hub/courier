import { Controller, Get, Query } from '@nestjs/common';
import { KardexService } from '../services/kardex.service';

@Controller('fulfillment/kardex')
export class KardexController {
  constructor(private readonly kardexService: KardexService) {}

  @Get('query')
  async findPaginated(
    @Query('page_number') page_number: string = '1',
    @Query('page_size') page_size: string = '20',
    @Query('sort_field') sort_field: string = 'createdAt',
    @Query('sort_direction') sort_direction: 'ASC' | 'DESC' = 'DESC',
    @Query('search_term') search_term: string = '',
    @Query('filter_company') filter_company?: string,
    @Query('filter_company_id') filter_company_id?: string,
    @Query('filter_product') filter_product?: string,
    @Query('filter_sku') filter_sku?: string,
    @Query('filter_movement_type') filter_movement_type?: string,
    @Query('filter_date_from') filter_date_from?: string,
    @Query('filter_date_to') filter_date_to?: string,
    @Query('filter_responsible_user') filter_responsible_user?: string,
    @Query('filter_observation') filter_observation?: string,
    @Query('filter_quantity_from') filter_quantity_from?: string,
    @Query('filter_quantity_to') filter_quantity_to?: string,
    @Query('filter_stock_after_from') filter_stock_after_from?: string,
    @Query('filter_stock_after_to') filter_stock_after_to?: string,
  ) {
    return this.kardexService.findPaginated({
      page_number: parseInt(page_number, 10) || 1,
      page_size: parseInt(page_size, 10) || 20,
      sort_field,
      sort_direction,
      search_term,
      filter_company,
      filter_company_id,
      filter_product,
      filter_sku,
      filter_movement_type,
      filter_date_from,
      filter_date_to,
      filter_responsible_user,
      filter_observation,
      filter_quantity_from: filter_quantity_from
        ? parseInt(filter_quantity_from, 10)
        : undefined,
      filter_quantity_to: filter_quantity_to
        ? parseInt(filter_quantity_to, 10)
        : undefined,
      filter_stock_after_from: filter_stock_after_from
        ? parseInt(filter_stock_after_from, 10)
        : undefined,
      filter_stock_after_to: filter_stock_after_to
        ? parseInt(filter_stock_after_to, 10)
        : undefined,
    });
  }
}
