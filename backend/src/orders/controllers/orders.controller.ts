import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiHeader,
  ApiHeaders,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AccessLevel } from 'src/auth/decorators/access-level.decorator';
import { AdminAccess } from 'src/auth/decorators/admin.decorator';
import { PublicAccess } from 'src/auth/decorators/public.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { AccessLevelGuard } from 'src/auth/guards/access-level.guard';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { OrderDTO, OrderUpdateDTO } from '../dto/order.dto';
import { OrdersService } from '../services/orders.service';
import { Response } from 'express'; // Asegúrate de importar Response de 'express'
import { ImportResult } from '../dto/import-result.dto';
import { OrderPdfGeneratorService } from '../services/order-pdf-generator.service';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(AuthGuard, RolesGuard, AccessLevelGuard)
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly orderPdfGeneratorService: OrderPdfGeneratorService,
  ) {}

  @Post('create')
  public async register(@Body() body: OrderDTO) {
    return await this.ordersService.createOrder(body);
  }

  @Post('batch-create')
  public async batchCreateOrders(@Body() body: any) {
    return await this.ordersService.batchCreateOrders(body);
  }

  @Post('import-batch-json')
  @HttpCode(HttpStatus.OK)
  async importOrders(
    @Body() ordersData: any[],
  ): Promise<ImportResult | undefined> {
    return await this.ordersService.importOrdersFromExcelData(ordersData);
  }

  @Get('')
  public async findAllOrders(
    @Query('page_number') pageNumber = 0,
    @Query('page_size') pageSize = 0,
    @Query('sort_field') sortField = 'created_at',
    @Query('sort_direction') sortDirection = 'desc',
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
    @Query('status') status?: string,
  ) {
    const queryParams = {
      pageNumber,
      pageSize,
      sortField,
      sortDirection,
      startDate,
      endDate,
      status,
    };
    return await this.ordersService.findOrders(queryParams);
  }

  @Get('filtered-orders')
  public async getFilteredOrders(
    @Query('page_number') pageNumber = 0,
    @Query('page_size') pageSize = 0,
    @Query('sort_field') sortField = 'created_at',
    @Query('sort_direction') sortDirection = 'desc',
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
    @Query('status') status?: string,
  ) {
    const queryParams = {
      pageNumber,
      pageSize,
      sortField,
      sortDirection,
      startDate,
      endDate,
      status,
    };
    return await this.ordersService.getFilteredOrders(queryParams);
  }

  @ApiParam({
    name: 'id',
  })
  @ApiHeader({
    name: 'codrr_token',
  })
  @ApiResponse({
    status: 400,
    description: 'No se encontro resultado',
  })
  @Get(':id')
  public async findOrderById(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.ordersService.findOrderById(id);
  }

  @ApiParam({
    name: 'id',
  })
  // @AdminAccess()
  @Put('edit/:id')
  public async updateOrder(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: OrderUpdateDTO,
  ) {
    return await this.ordersService.updateOrder(body, id);
  }

  @Post('update-order-status')
  public async updateOrderStatus(@Body() body: any) {
    return await this.ordersService.updateOrderStatus(body);
  }

  @ApiParam({
    name: 'id',
  })
  // @AdminAccess()
  @Delete('delete/:id')
  public async deleteOrder(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.ordersService.deleteOrder(id);
  }

  @PublicAccess()
  @Get(':id/pdf')
  async getOrderPdf(
    @Param('id' /*, ParseUUIDPipe opcional si ID es UUID */) orderId: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      await this.orderPdfGeneratorService.streamOrderPdfToResponse(
        orderId,
        res,
      );
    } catch (error) {
      // El manejo de errores dentro de streamOrderPdfToResponse debe ser robusto
      // o manejarlo aquí si lanza excepciones antes de empezar el stream.
      console.error('Error in PDF streaming controller:', error);
      if (!res.headersSent) {
        // Solo enviar respuesta si no se ha enviado nada aún
        if (error instanceof NotFoundException) {
          res.status(404).send({ message: error.message });
        } else {
          res.status(500).send({ message: 'Error generating PDF stream' });
        }
      }
    }
  }
}
