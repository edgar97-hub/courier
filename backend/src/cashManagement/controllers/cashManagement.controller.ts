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

@UseGuards(AuthGuard, RolesGuard)
@Controller('cash-management')
export class CashManagementController {
  constructor(
    private readonly cashManagementService: CashManagementService,
    private readonly cashMovementPdfGeneratorService: CashMovementPdfGeneratorService,
  ) {}

  @Post('manual-movement')
  @Roles(ROLES.RECEPCIONISTA, ROLES.ADMINISTRADOR)
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
  @Roles(ROLES.RECEPCIONISTA, ROLES.ADMINISTRADOR)
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
  @Roles(ROLES.RECEPCIONISTA, ROLES.ADMINISTRADOR)
  async deleteCashMovement(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.cashManagementService.deleteCashMovement(id);
  }

  @Get('movements')
  @Roles(ROLES.RECEPCIONISTA, ROLES.ADMINISTRADOR)
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
  @Roles(ROLES.RECEPCIONISTA, ROLES.ADMINISTRADOR)
  async getBalanceSummary(@Query() query: QueryCashMovementDto) {
    return this.cashManagementService.getBalanceSummary(query);
  }

  @Get('detailed-summary')
  @Roles(ROLES.RECEPCIONISTA, ROLES.ADMINISTRADOR)
  async getDetailedBalanceSummary(@Query() query: QueryCashMovementDto) {
    return this.cashManagementService.getDetailedBalanceSummary(query);
  }

  @Get(':id/pdf')
  @Roles(ROLES.RECEPCIONISTA, ROLES.ADMINISTRADOR)
  async getCashMovementPdf(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    await this.cashMovementPdfGeneratorService.streamCashMovementPdfA4ToResponse(
      id,
      req,
      res,
    );
  }

  @Get(':id/pdf/ticket')
  @Roles(ROLES.RECEPCIONISTA, ROLES.ADMINISTRADOR)
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
