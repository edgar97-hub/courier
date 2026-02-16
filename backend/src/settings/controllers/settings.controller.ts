import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiHeader,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiOperation,
  ApiConsumes,
} from '@nestjs/swagger';
import { Response } from 'express';

import { AdminAccess } from 'src/auth/decorators/admin.decorator';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { PublicAccess } from 'src/auth/decorators/public.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ROLES } from 'src/constants/roles';

import { SettingDTO, SettingUpdateDTO } from '../dto/setting.dto';
import { SettingsService } from '../services/settings.service';
import { PromotionalSetItem } from '../entities/settings.entity';

/**
 * Controller for managing application settings.
 * Provides endpoints for CRUD operations on settings, file uploads, and retrieving promotional sets.
 */
@Controller('settings')
@UseGuards(AuthGuard, RolesGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  /**
   * Create new settings entry.
   * Restricted to admin and recepcionista roles.
   */
  @AdminAccess()
  @Roles(ROLES.RECEPCIONISTA)
  @Post('register')
  public async createSettings(@Body(ValidationPipe) body: SettingDTO) {
    return await this.settingsService.createSettings(body);
  }

  /**
   * Retrieve all settings entries.
   */
  @Get('all')
  public async findAllSettings() {
    return await this.settingsService.findAllSettings();
  }

  /**
   * Get active promotional sets.
   */
  @Get('promotional-sets')
  async getPromotionalSets(): Promise<PromotionalSetItem[]> {
    return this.settingsService.getPromotionalSets();
  }

  /**
   * Get settings by ID.
   */
  @Get(':id')
  public async findSettingsById(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.settingsService.findSettingsById(id);
  }

  /**
   * Update settings by ID.
   * Restricted to admin and recepcionista roles.
   */
  @AdminAccess()
  @Roles(ROLES.RECEPCIONISTA)
  @Put('edit/:id')
  public async updateSettings(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(ValidationPipe) body: SettingUpdateDTO,
  ) {
    return await this.settingsService.updateSettings(body, id);
  }

  /**
   * Upload company logo.
   */
  @Post('upload-logo')
  @UseInterceptors(FileInterceptor('logoFile'))
  public async uploadLogo(
    @UploadedFile() logoFile: Express.Multer.File,
    @Req() request: Request,
  ) {
    return await this.settingsService.uploadLogo(logoFile, request);
  }

  /**
   * Upload terms and conditions PDF.
   */
  @Post('upload-terms-pdf')
  @UseInterceptors(FileInterceptor('termsPdfFile'))
  public async uploadTermsPdf(
    @UploadedFile() termsPdfFile: Express.Multer.File,
    @Req() request: Request,
  ) {
    return await this.settingsService.uploadTermsPdf(termsPdfFile, request);
  }

  /**
   * Upload generic file.
   */
  @Post('upload-file')
  @UseInterceptors(FileInterceptor('file'))
  public async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Req() request: Request,
  ) {
    return await this.settingsService.uploadFile(file, request);
  }

  /**
   * Get company background image (public).
   */
  @PublicAccess()
  @Get('company/background-image')
  public async getBackgroundImage(@Res() res: Response): Promise<void> {
    return await this.settingsService.getBackgroundImage(res);
  }

  /**
   * Get company logo image (public).
   */
  @PublicAccess()
  @Get('company/logo-image')
  public async getLogoImage(@Res() res: Response): Promise<void> {
    return await this.settingsService.getLogoImage(res);
  }

  /**
   * Get global notice image (public).
   */
  @PublicAccess()
  @Get('company/global-notice-image')
  public async getGlobalNoticeImage(@Res() res: Response): Promise<void> {
    return await this.settingsService.getGlobalNoticeImage(res);
  }
}
