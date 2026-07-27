import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Req,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiHeader, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminAccess } from 'src/auth/decorators/admin.decorator';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import {
  RegistrationUserCompanyDTO,
  UserCompanyUpdateDTO,
  UserDTO,
  UserProfile,
  UserUpdateDTO,
} from '../dto/user.dto';
import { UsersService } from '../services/users.service';
import { PublicAccess } from 'src/auth/decorators/public.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ROLES } from 'src/constants/roles';

@Controller('users')
@UseGuards(AuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @AdminAccess()
  @Roles(ROLES.RECEPCIONISTA)
  @AdminAccess()
  @Post('register')
  public async registerUser(@Body() body: UserDTO) {
    return await this.usersService.createUser(body);
  }

  @PublicAccess()
  @Post('register-company')
  public async registerCompany(@Body() body: RegistrationUserCompanyDTO) {
    return await this.usersService.registerCompany(body);
  }

  @Get('all')
  public async findAllUsers() {
    return await this.usersService.findUsers();
  }

  @PublicAccess()
  @Get('filtered')
  public async findUsersByRol(
    @Query('search_term') search_term: string,
    @Query('role') role: string,
    @Query('fulfillment_enabled') fulfillment_enabled?: string,
  ) {
    const queryParams: {
      search_term?: string;
      role?: string;
      fulfillment_enabled?: boolean;
    } = {
      search_term,
      role,
    };

    if (fulfillment_enabled !== undefined) {
      queryParams.fulfillment_enabled = fulfillment_enabled === 'true';
    }

    return await this.usersService.findUsersByRol(queryParams);
  }

  @PublicAccess()
  @Get('paginated')
  public async findUsersPaginated(
    @Query('page_number', new ParseIntPipe({ optional: true }))
    page_number: number = 1,
    @Query('page_size', new ParseIntPipe({ optional: true }))
    page_size: number = 20,
    @Query('sort_field') sort_field: string = 'code',
    @Query('sort_direction') sort_direction: 'ASC' | 'DESC' = 'ASC',
    @Query('search_term') search_term: string = '',
    @Query('role') role: string = '',
  ) {
    return await this.usersService.findUsersPaginated({
      page_number,
      page_size,
      sort_field,
      sort_direction,
      search_term,
      role,
    });
  }

  @Get(':id')
  public async findUserById(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.usersService.findUserById(id);
  }

  @Get('/perfil/me')
  public async findUserPerfil(@Request() req) {
    console.log('idUser', req.idUser);

    return await this.usersService.findUserPerfil(req.idUser);
  }

  @AdminAccess()
  @Roles(ROLES.RECEPCIONISTA)
  @Put('edit/:id')
  public async updateUser(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UserUpdateDTO,
  ) {
    return await this.usersService.updateUser(body, id);
  }

  @Put('edit-user-company/:id')
  public async updateUserCompany(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UserCompanyUpdateDTO,
  ) {
    return await this.usersService.updateUserCompany(body, id);
  }

  @Put('update-profile/:id')
  public async updateProfile(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UserProfile,
  ) {
    return await this.usersService.updateProfile(body, id);
  }

  @Delete('delete/:id')
  public async deleteUser(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.usersService.deleteUser(id);
  }
}
