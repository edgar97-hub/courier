import { Controller, Get, UseGuards, Request, Query, Patch, HttpCode, HttpStatus, ParseUUIDPipe, Param, Body, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { RoutesService } from '../services/routes.service';
import { GetMyRoutesDto } from '../dto/get-my-routes.dto';
import { UpdateLocationDto } from '../dto/update-location.dto';

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

   /**
   * Endpoint para que la app del motorizado actualice su ubicación.
   * Usamos PATCH porque es una actualización parcial de un recurso.
   * La ruta es más específica para evitar colisiones.
   */
  @Patch('routes/:routeId/location')
  @HttpCode(HttpStatus.NO_CONTENT) // Un 204 No Content es apropiado para una actualización exitosa sin respuesta
  async updateRouteLocation(
    @Param('routeId', ParseIntPipe) routeId: number,
    @Body() updateLocationDto: UpdateLocationDto,
  ): Promise<void> {
    await this.routesService.updateRouteLocation(routeId, updateLocationDto);
  }

  /**
   * Endpoint para que el panel del administrador obtenga todas las ubicaciones
   * en tiempo real de un evento de planificación.
   */
  @Get(':id/live-locations')
  async getLiveRouteLocations(@Param('id', ParseIntPipe) id: number) {
    return this.routesService.getLiveRouteLocations(id);
  }
}
