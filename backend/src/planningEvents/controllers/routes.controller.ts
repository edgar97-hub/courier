import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { RoutesService } from '../services/routes.service';
import { GetMyRoutesDto } from '../dto/get-my-routes.dto';

@Controller('routes')
@UseGuards(AuthGuard)
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Get('my-routes')
  async getMyRoutesByDate(@Request() req, @Query() query: GetMyRoutesDto) {
    const userId = req.idUser;
    const { date } = query;
    return this.routesService.findMyRoutesByDate(userId, date);
  }
}
