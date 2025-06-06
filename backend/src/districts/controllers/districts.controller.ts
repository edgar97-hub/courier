import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
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
  @Get('')
  public async findAllOrders(
    @Query('page_number') pageNumber = 0,
    @Query('page_size') pageSize = 0,
    @Query('sort_field') sortField = 'updatedAt',
    @Query('sort_direction') sortDirection = 'desc',
    @Query('search') search = '',
  ) {
    const queryParams = {
      pageNumber,
      pageSize,
      sortField,
      sortDirection,
      search,
    };
    return await this.usersService.findDistricts(queryParams);
  }

  @Get('filtered')
  public async findUsersByRol(@Query('search_term') search_term: string) {
    const queryParams = {
      search_term,
    };
    return await this.usersService.findDistricts2(queryParams);
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
