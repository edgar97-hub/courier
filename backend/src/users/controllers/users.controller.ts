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
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiHeader, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminAccess } from 'src/auth/decorators/admin.decorator';
import { AccessLevelGuard } from 'src/auth/guards/access-level.guard';
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

@ApiTags('Users')
@Controller('users')
@UseGuards(AuthGuard, RolesGuard, AccessLevelGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @AdminAccess()
  @Roles('RECEPTIONIST')
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
  ) {
    const queryParams = {
      search_term,
      role,
    };
    return await this.usersService.findUsersByRol(queryParams);
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
  @Get(':id')
  public async findUserById(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.usersService.findUserById(id);
  }

  @Get('/perfil/me')
  public async findUserPerfil(@Request() req) {
    console.log('idUser', req.idUser);

    return await this.usersService.findUserPerfil(req.idUser);
  }

  @ApiParam({
    name: 'id',
  })
  @AdminAccess()
  @Roles('RECEPTIONIST')
  @Put('edit/:id')
  public async updateUser(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UserUpdateDTO,
  ) {
    return await this.usersService.updateUser(body, id);
  }

  @ApiParam({
    name: 'id',
  })
  @Put('edit-user-company/:id')
  public async updateUserCompany(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UserCompanyUpdateDTO,
  ) {
    return await this.usersService.updateUserCompany(body, id);
  }

  @ApiParam({
    name: 'id',
  })
  @Put('update-profile/:id')
  public async updateProfile(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UserProfile,
  ) {
    return await this.usersService.updateProfile(body, id);
  }

  @ApiParam({
    name: 'id',
  })
  @Delete('delete/:id')
  public async deleteUser(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.usersService.deleteUser(id);
  }
}
