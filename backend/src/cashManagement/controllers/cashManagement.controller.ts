import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  UseGuards,
  Req,
  BadRequestException,
  Put,
  Param,
  Delete,
  ParseUUIDPipe,
  Request,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { CashManagementService } from '../services/cashManagement.service';
import {
  CreateCashMovementDto,
  QueryCashMovementDto,
  DetailedCashMovementSummaryDto,
} from '../dto/cashManagement.dto';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { ROLES } from '../../constants/roles';
import { Response } from 'express';
import { CashMovementPdfGeneratorService } from '../services/cash-movement-pdf-generator.service';
import { AdminAccess } from 'src/auth/decorators/admin.decorator';
import { PublicAccess } from 'src/auth/decorators/public.decorator';

@ApiTags('Cash Management')
@Controller('cash-management')
@UseGuards(AuthGuard, RolesGuard)
export class CashManagementController {
  constructor(
    private readonly cashManagementService: CashManagementService,
    private readonly cashMovementPdfGeneratorService: CashMovementPdfGeneratorService,
  ) {}

  @Post('manual-movement')
  @AdminAccess()
  @Roles(ROLES.RECEPCIONISTA)
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'Movimiento de caja manual registrado exitosamente.',
  })
  @ApiResponse({ status: 403, description: 'Acceso denegado.' })
  async createManualMovement(
    @Body() createCashMovementDto: CreateCashMovementDto,
    @Request() req,
  ) {
    if (!req.idUser) {
      throw new BadRequestException('User ID not found in request');
    }
    const userId = req.idUser;
    return this.cashManagementService.createManualMovement(
      createCashMovementDto,
      userId,
    );
  }

  @Put(':id')
  @AdminAccess()
  @Roles(ROLES.RECEPCIONISTA)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'ID del movimiento de caja' })
  @ApiResponse({
    status: 200,
    description: 'Movimiento de caja actualizado exitosamente.',
  })
  @ApiResponse({ status: 403, description: 'Acceso denegado.' })
  @ApiResponse({
    status: 404,
    description: 'Movimiento de caja no encontrado.',
  })
  async updateCashMovement(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateCashMovementDto: CreateCashMovementDto,
    @Request() req,
  ) {
    if (!req.idUser) {
      throw new BadRequestException('User ID not found in request');
    }
    const userId = req.idUser;
    return this.cashManagementService.updateCashMovement(
      id,
      updateCashMovementDto,
      userId,
    );
  }

  @Delete(':id')
  @AdminAccess()
  @Roles(ROLES.RECEPCIONISTA)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'ID del movimiento de caja' })
  @ApiResponse({
    status: 200,
    description: 'Movimiento de caja eliminado exitosamente.',
  })
  @ApiResponse({ status: 403, description: 'Acceso denegado.' })
  @ApiResponse({
    status: 404,
    description: 'Movimiento de caja no encontrado.',
  })
  async deleteCashMovement(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.cashManagementService.deleteCashMovement(id);
  }

  @Get('movements')
  @AdminAccess()
  @Roles(ROLES.RECEPCIONISTA)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Listado de movimientos de caja.' })
  @ApiResponse({ status: 403, description: 'Acceso denegado.' })
  async findAllMovements(
    @Query() query: QueryCashMovementDto,
    @Query('page_number') pageNumber: number = 1,
    @Query('page_size') pageSize: number = 10,
  ) {
    return this.cashManagementService.findAllMovements(
      query,
      pageNumber,
      pageSize,
    );
  }

  @Get('summary')
  @AdminAccess()
  @Roles(ROLES.RECEPCIONISTA)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Resumen de saldos de caja.' })
  @ApiResponse({ status: 403, description: 'Acceso denegado.' })
  async getBalanceSummary(@Query() query: QueryCashMovementDto) {
    return this.cashManagementService.getBalanceSummary(query);
  }

  @Get('detailed-summary')
  @AdminAccess()
  @Roles(ROLES.RECEPCIONISTA)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Resumen detallado de saldos de caja.',
    type: DetailedCashMovementSummaryDto,
  })
  @ApiResponse({ status: 403, description: 'Acceso denegado.' })
  async getDetailedBalanceSummary(@Query() query: QueryCashMovementDto) {
    return this.cashManagementService.getDetailedBalanceSummary(query);
  }

  @Get(':id/pdf')
  @AdminAccess()
  @Roles(ROLES.RECEPCIONISTA)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'ID del movimiento de caja' })
  @ApiResponse({
    status: 200,
    description: 'PDF del movimiento de caja generado exitosamente.',
    type: 'application/pdf',
  })
  @ApiResponse({
    status: 404,
    description: 'Movimiento de caja no encontrado.',
  })
  async getCashMovementPdf(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: Request, // Changed to @Req() req: Request
    @Res() res: Response,
  ): Promise<void> {
    await this.cashMovementPdfGeneratorService.streamCashMovementPdfA4ToResponse(
      id,
      req,
      res,
    ); // Pass req
  }

  @Get(':id/pdf/ticket')
  @PublicAccess()
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'ID del movimiento de caja' })
  @ApiResponse({
    status: 200,
    description:
      'PDF del movimiento de caja en formato ticket generado exitosamente.',
    type: 'application/pdf',
  })
  @ApiResponse({
    status: 404,
    description: 'Movimiento de caja no encontrado.',
  })
  async getCashMovementPdfTicket(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    await this.cashMovementPdfGeneratorService.streamCashMovementPdf80mmToResponse(
      id,
      req,
      res,
    );
  }
}
