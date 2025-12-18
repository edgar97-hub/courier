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
@ApiTags('Settings')
@Controller('settings')
@UseGuards(AuthGuard, RolesGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  /**
   * Create new settings entry.
   * Restricted to admin and recepcionista roles.
   */
  @ApiOperation({ summary: 'Create settings' })
  @AdminAccess()
  @Roles(ROLES.RECEPCIONISTA)
  @Post('register')
  public async createSettings(@Body(ValidationPipe) body: SettingDTO) {
    return await this.settingsService.createSettings(body);
  }

  /**
   * Retrieve all settings entries.
   */
  @ApiOperation({ summary: 'Get all settings' })
  @Get('all')
  public async findAllSettings() {
    return await this.settingsService.findAllSettings();
  }

  /**
   * Get active promotional sets.
   */
  @ApiOperation({ summary: 'Get promotional sets' })
  @Get('promotional-sets')
  async getPromotionalSets(): Promise<PromotionalSetItem[]> {
    return this.settingsService.getPromotionalSets();
  }

  /**
   * Get settings by ID.
   */
  @ApiOperation({ summary: 'Get settings by ID' })
  @ApiParam({ name: 'id', description: 'Settings UUID' })
  @ApiHeader({ name: 'codrr_token' })
  @ApiResponse({ status: 400, description: 'No se encontro resultado' })
  @Get(':id')
  public async findSettingsById(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.settingsService.findSettingsById(id);
  }

  /**
   * Update settings by ID.
   * Restricted to admin and recepcionista roles.
   */
  @ApiOperation({ summary: 'Update settings' })
  @ApiParam({ name: 'id', description: 'Settings UUID' })
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
   * Delete settings by ID.
   * Restricted to admin and recepcionista roles.
   */
  @ApiOperation({ summary: 'Delete settings' })
  @ApiParam({ name: 'id', description: 'Settings UUID' })
  @AdminAccess()
  @Roles(ROLES.RECEPCIONISTA)
  @Delete('delete/:id')
  public async deleteSettings(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.settingsService.deleteSettings(id);
  }

  /**
   * Upload company logo.
   */
  @ApiOperation({ summary: 'Upload logo' })
  @ApiConsumes('multipart/form-data')
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
  @ApiOperation({ summary: 'Upload terms PDF' })
  @ApiConsumes('multipart/form-data')
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
  @ApiOperation({ summary: 'Upload generic file' })
  @ApiConsumes('multipart/form-data')
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
  @ApiOperation({ summary: 'Get background image' })
  @PublicAccess()
  @Get('company/background-image')
  public async getBackgroundImage(@Res() res: Response): Promise<void> {
    return await this.settingsService.getBackgroundImage(res);
  }

  /**
   * Get company logo image (public).
   */
  @ApiOperation({ summary: 'Get logo image' })
  @PublicAccess()
  @Get('company/logo-image')
  public async getLogoImage(@Res() res: Response): Promise<void> {
    return await this.settingsService.getLogoImage(res);
  }

  /**
   * Get global notice image (public).
   */
  @ApiOperation({ summary: 'Get global notice image' })
  @PublicAccess()
  @Get('company/global-notice-image')
  public async getGlobalNoticeImage(@Res() res: Response): Promise<void> {
    return await this.settingsService.getGlobalNoticeImage(res);
  }
}
