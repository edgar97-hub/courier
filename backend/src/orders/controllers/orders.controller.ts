import {
  Body,
  Controller,
  Delete,
  Get,
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
import { ProjectsEntity } from 'src/projects/entities/projects.entity';
import { OrderDTO, OrderUpdateDTO } from '../dto/order.dto';
import { OrdersService } from '../services/orders.service';
import { PdfService } from '../pdf/pdf.service';
import { Response } from 'express'; // Asegúrate de importar Response de 'express'

@ApiTags('Orders')
@Controller('orders')
@UseGuards(AuthGuard, RolesGuard, AccessLevelGuard)
export class OrdersController {
  constructor(
    private readonly usersService: OrdersService,
    // private readonly pdfService: PdfService,
  ) {}

  // @Get('pdf') // GET /shipments/:id/label/pdf
  // async getShipmentLabelPdf(
  //   @Param('id', ParseIntPipe) id: string,
  //   @Res() res: Response,
  // ): Promise<void> {
  //   const shipment = await this.usersService.findUserById(id); // Tu método para obtener datos

  //   if (!shipment) {
  //     throw new NotFoundException(`Envío con ID "${id}" no encontrado.`);
  //   }

  //   const pdfBuffer = await this.pdfService.generateShipmentLabel(shipment);

  //   res.set({
  //     'Content-Type': 'application/pdf',
  //     'Content-Disposition': `attachment; filename="etiqueta_envio_${shipment.code || id}.pdf"`,
  //     'Content-Length': pdfBuffer.length.toString(), // Content-Length debe ser string
  //   });

  //   res.end(pdfBuffer);
  // }

  // @AdminAccess()
  @Post('create')
  public async register(@Body() body: OrderDTO) {
    return await this.usersService.createUser(body);
  }

  @Post('batch-create')
  public async batchCreateOrders(@Body() body: any) {
    return await this.usersService.batchCreateOrders(body);
  }

  // @AdminAccess()
  @Get('')
  public async findAllUsers(
    @Query('page_number') pageNumber = 1,
    @Query('page_size') pageSize = 10,
    @Query('sort_field') sortField = 'created_at',
    @Query('sort_direction') sortDirection = 'desc',
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
  ) {
    const queryParams = {
      pageNumber,
      pageSize,
      sortField,
      sortDirection,
      startDate,
      endDate,
    };
    return await this.usersService.findUsers(queryParams);
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
  // @AdminAccess()
  @Get(':id')
  public async findUserById(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.usersService.findUserById(id);
  }

  @ApiParam({
    name: 'id',
  })
  @AdminAccess()
  @Put('edit/:id')
  public async updateUser(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: OrderUpdateDTO,
  ) {
    return await this.usersService.updateUser(body, id);
  }

  @ApiParam({
    name: 'id',
  })
  @AdminAccess()
  @Delete('delete/:id')
  public async deleteUser(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.usersService.deleteUser(id);
  }
}
