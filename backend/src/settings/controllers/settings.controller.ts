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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiHeader,
  ApiHeaders,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AdminAccess } from 'src/auth/decorators/admin.decorator';
import { AccessLevelGuard } from 'src/auth/guards/access-level.guard';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { SettingDTO, SettingUpdateDTO } from '../dto/setting.dto';
import { SettingsService } from '../services/settings.service';
import { PublicAccess } from 'src/auth/decorators/public.decorator';

import { Response } from 'express'; // ← IMPORTANTE

@ApiTags('Settings')
@Controller('settings')
@UseGuards(AuthGuard, RolesGuard, AccessLevelGuard)
export class SettingsController {
  constructor(private readonly usersService: SettingsService) {}

  // @AdminAccess()
  @Post('register')
  public async registerUser(@Body() body: SettingDTO) {
    return await this.usersService.createUser(body);
  }

  // @AdminAccess()
  @Get('all')
  public async findAllUsers() {
    return await this.usersService.findUsers();
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
  // @AdminAccess()
  @Put('edit/:id')
  public async updateUser(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: SettingUpdateDTO,
  ) {
    return await this.usersService.updateUser(body, id);
  }

  @ApiParam({
    name: 'id',
  })
  // @AdminAccess()
  @Delete('delete/:id')
  public async deleteUser(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.usersService.deleteUser(id);
  }

  @Post('upload-logo')
  @UseInterceptors(FileInterceptor('logoFile'))
  public async uploadLogo(
    @UploadedFile() logoFile: Express.Multer.File,
    @Req() request: Request,
  ) {
    return await this.usersService.uploadLogo(logoFile, request);
  }

  @Post('upload-terms-pdf')
  @UseInterceptors(FileInterceptor('termsPdfFile'))
  public async uploadTermsPdf(
    @UploadedFile() termsPdfFile: Express.Multer.File,
    @Req() request: Request,
  ) {
    return await this.usersService.uploadTermsPdf(termsPdfFile, request);
  }

  @Post('upload-file')
  @UseInterceptors(FileInterceptor('file'))
  public async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Req() request: Request,
  ) {
    return await this.usersService.uploadFile(file, request);
  }

  @PublicAccess()
  @Get('company/background-image')
  public async getBackgroundImage(@Res() res: Response): Promise<void> {
    return await this.usersService.getBackgroundImage(res);
  }
}
