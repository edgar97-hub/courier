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
  UseGuards,
} from '@nestjs/common';
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
import { DistrictDTO, DistrictUpdateDTO } from '../dto/district.dto';
import { DistrictsService } from '../services/districts.service';

@ApiTags('Districts')
@Controller('districts')
@UseGuards(AuthGuard, RolesGuard, AccessLevelGuard)
export class DistrictsController {
  constructor(private readonly usersService: DistrictsService) {}

  // @AdminAccess()
  @Post('register')
  public async registerUser(@Body() body: DistrictDTO) {
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
    @Body() body: DistrictUpdateDTO,
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
}
