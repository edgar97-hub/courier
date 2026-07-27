import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { AdminAccess } from '../../auth/decorators/admin.decorator';
import { FulfillmentService } from '../services/products.service';
import { CreateFulfillmentProductDto } from '../dto/create-fulfillment-product.dto';

@Controller('fulfillment')
@UseGuards(AuthGuard, RolesGuard)
export class ProductsController {
  constructor(private readonly fulfillmentService: FulfillmentService) {}

  @Post('products')
  async create(@Body() dto: CreateFulfillmentProductDto) {
    return this.fulfillmentService.create(dto);
  }

  @Get('products/names')
  async findProductNames() {
    return this.fulfillmentService.findDistinctProductNames();
  }

  @Get('variations/values')
  async findVariationValues() {
    return this.fulfillmentService.findDistinctVariationValues();
  }

  @Get('products')
  async findAll() {
    return this.fulfillmentService.findAll();
  }

  @Get('products/paginated')
  async findProductsPaginated(
    @Query('page_number', new ParseIntPipe({ optional: true }))
    page_number: number = 1,
    @Query('page_size', new ParseIntPipe({ optional: true }))
    page_size: number = 20,
    @Query('sort_field') sort_field: string = 'createdAt',
    @Query('sort_direction') sort_direction: 'ASC' | 'DESC' = 'DESC',
    @Query('search_term') search_term: string = '',
  ) {
    return this.fulfillmentService.findProductsPaginated({
      page_number,
      page_size,
      sort_field,
      sort_direction,
      search_term,
    });
  }

  @Get('products/:id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.fulfillmentService.findOne(id);
  }

  @Put('products/:id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreateFulfillmentProductDto>,
  ) {
    return this.fulfillmentService.update(id, dto);
  }

  @Delete('products/:id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.fulfillmentService.remove(id);
  }
}
