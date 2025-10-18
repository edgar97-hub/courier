import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Param,
  Put,
  Delete,
  Query,
  ParseIntPipe,
  UsePipes,
  ValidationPipe,
  Patch,
  Req,
  Res,
} from '@nestjs/common';
import { DistributorRecordsService } from '../services/distributor-records.service';
import { Roles } from '../../auth/decorators/roles.decorator';
import { ROLES } from '../../constants/roles';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import {
  DistributorRecordDTO,
  UpdateDistributorRecordDTO,
} from '../dto/distributor-record.dto';
import { CreateDistributorRegistrationDto } from '../dto/create-distributor-registration.dto';
import { PublicAccess } from 'src/auth/decorators/public.decorator';
import { PdfGeneratorService } from '../services/pdf-generator.service';
import { NotFoundError } from 'rxjs';
import { Response } from 'express';

@UseGuards(AuthGuard, RolesGuard)
@Controller('distributor-records')
export class DistributorRecordsController {
  constructor(
    private readonly distributorRecordsService: DistributorRecordsService,
    private readonly pdfGeneratorService: PdfGeneratorService,
  ) {}

  @Get('')
  public async getRegistrations(
    @Request() req,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @Query('sortField') sortField: string = 'createdAt',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'DESC',
    @Query('search') search: string = '',
  ) {
    return this.distributorRecordsService.findAllPaginated(req, {
      page,
      limit,
      sortField,
      sortOrder,
      search,
    });
  }

  @Post('create')
  @UsePipes(new ValidationPipe({ transform: true }))
  @Roles(ROLES.EMPRESA_DISTRIBUIDOR, ROLES.ADMINISTRADOR, ROLES.RECEPCIONISTA)
  async createDistributorRecord(
    @Body() body: DistributorRecordDTO,
    @Request() req,
  ) {
    return await this.distributorRecordsService.createDistributorRecord(
      body,
      req.idUser,
    );
  }

  @Patch(':id')
  @Roles(ROLES.ADMINISTRADOR, ROLES.RECEPCIONISTA)
  async updateDistributorRecord(
    @Param('id') id: string,
    @Body() body: UpdateDistributorRecordDTO,
    @Request() req,
  ) {
    return await this.distributorRecordsService.updateDistributorRecord(
      id,
      body,
      req.idUser,
    );
  }

  @Delete(':id')
  @Roles(ROLES.ADMINISTRADOR, ROLES.RECEPCIONISTA)
  async deleteDistributorRecord(@Param('id') id: string) {
    return await this.distributorRecordsService.deleteDistributorRecord(id);
  }

  @Post('import-batch-json')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(ROLES.ADMINISTRADOR, ROLES.RECEPCIONISTA, ROLES.EMPRESA_DISTRIBUIDOR)
  async importBatchJson(
    @Body(new ValidationPipe())
    dtos: CreateDistributorRegistrationDto[],
    @Request() req,
  ) {
    return this.distributorRecordsService.importFromParsedJson(
      dtos,
      req.idUser,
    );
  }

  @PublicAccess()
  @Get(':id/pdf-rotulado')
  async getOrderPdfA4(
    @Param('id') orderId: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    try {
      await this.pdfGeneratorService.streamDistributorRecordPdfToResponse(
        orderId,
        res,
      );
    } catch (error) {
      console.error('Error in PDF streaming controller:', error);
      if (!res.headersSent) {
        if (error instanceof NotFoundError) {
          res.status(404).send({ message: error.message });
        } else {
          res.status(500).send({ message: 'Error generating PDF stream' });
        }
      }
    }
  }
}
