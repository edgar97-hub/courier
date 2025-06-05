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
  Request,
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
  public async batchCreateOrders(@Body() body: any, @Request() req) {
    return await this.ordersService.batchCreateOrders(body, req.idUser);
  }
  @Post('import-batch-json')
  @HttpCode(HttpStatus.OK)
  async importOrders(
    @Body() ordersData: any[],
    @Request() req,
  ): Promise<ImportResult | undefined> {
    return await this.ordersService.importOrdersFromExcelData(
      ordersData,
      req.idUser,
    );
  }

  @Get('')
  public async findAllOrders(
    @Request() req,
    @Query('page_number') pageNumber = 0,
    @Query('page_size') pageSize = 0,
    @Query('sort_field') sortField = 'created_at',
    @Query('sort_direction') sortDirection = 'asc',
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
    @Query('status') status?: string,
    @Query('search_term') search_term?: string,
    @Query('delivery_date') delivery_date?: string,
  ) {
    const queryParams = {
      pageNumber,
      pageSize,
      sortField,
      sortDirection,
      startDate,
      endDate,
      status,
      search_term,
      delivery_date,
    };
    return await this.ordersService.findOrders(queryParams, req);
  }

  @Get('filtered-orders')
  public async getFilteredOrders(
    @Request() req,
    @Query('page_number') pageNumber = 0,
    @Query('page_size') pageSize = 0,
    @Query('sort_field') sortField = 'created_at',
    @Query('sort_direction') sortDirection = 'asc',
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
    @Query('status') status?: string,
    @Query('search_term') search_term?: string,
    @Query('delivery_date') delivery_date?: string,
  ) {
    const queryParams = {
      pageNumber,
      pageSize,
      sortField,
      sortDirection,
      startDate,
      endDate,
      status,
      search_term,
      delivery_date,
    };
    return await this.ordersService.getFilteredOrders(queryParams, req);
  }

  @PublicAccess()
  @Get('tracking')
  public async getOrderByTrackingCode(
    @Query('tracking_code') tracking_code = '',
  ) {
    const queryParams = {
      tracking_code,
    };
    return await this.ordersService.getOrderByTrackingCode(queryParams);
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
  @Put('edit/:id')
  public async updateOrder(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: OrderUpdateDTO,
  ) {
    return await this.ordersService.updateOrder(body, id);
  }

  @Post('update-order-status')
  public async updateOrderStatus(@Body() body: any, @Request() req) {
    return await this.ordersService.updateOrderStatus(body, req.idUser);
  }

  @Put('assign-driver-to-order/:id')
  public async assignDriverToOrder(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: any,
    @Request() req,
  ) {
    return await this.ordersService.assignDriverToOrder(body, id, req.idUser);
  }

  @Put('reschedule-order/:id')
  public async rescheduleOrder(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: any,
    @Request() req,
  ) {
    return await this.ordersService.rescheduleOrder(body, id, req.idUser);
  }

  @ApiParam({
    name: 'id',
  })
  @Delete('delete/:id')
  public async deleteOrder(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.ordersService.deleteOrder(id);
  }

  @PublicAccess()
  @Get(':id/pdf-a4')
  async getOrderPdfA4(
    @Param('id') orderId: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    try {
      await this.orderPdfGeneratorService.streamOrderPdfToResponse(
        orderId,
        req,
        res,
      );
    } catch (error) {
      console.error('Error in PDF streaming controller:', error);
      if (!res.headersSent) {
        if (error instanceof NotFoundException) {
          res.status(404).send({ message: error.message });
        } else {
          res.status(500).send({ message: 'Error generating PDF stream' });
        }
      }
    }
  }

  @PublicAccess()
  @Get(':id/pdf-a4-landscape')
  async getOrderPdfA4Landscape(
    @Param('id') orderId: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    try {
      await this.orderPdfGeneratorService.streamOrderPdfLandscapeToResponse(
        orderId,
        req,
        res,
      );
    } catch (error) {
      console.error('Error in PDF streaming controller:', error);
      if (!res.headersSent) {
        if (error instanceof NotFoundException) {
          res.status(404).send({ message: error.message });
        } else {
          res.status(500).send({ message: 'Error generating PDF stream' });
        }
      }
    }
  }

  @PublicAccess()
  @Get(':id/pdf-ticket-80mm')
  async getOrderPdfTicket80mm(
    @Param('id') orderId: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    try {
      await this.orderPdfGeneratorService.streamOrderPdf80mmToResponse(
        orderId,
        req,
        res,
      );
    } catch (error) {
      console.error('Error in PDF streaming controller:', error);
      if (!res.headersSent) {
        if (error instanceof NotFoundException) {
          res.status(404).send({ message: error.message });
        } else {
          res.status(500).send({ message: 'Error generating PDF stream' });
        }
      }
    }
  }

  @PublicAccess()
  @Get('dashboard/data')
  async getDashboardSummary(): Promise<any> {
    return this.ordersService.dashboardOrders();
  }
}
