import { Global, Module } from '@nestjs/common';
import { DistrictsService } from './services/districts.service';
import { DistrictsController } from './controllers/districts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DistrictsEntity } from './entities/districts.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([DistrictsEntity])],
  providers: [DistrictsService],
  controllers: [DistrictsController],
  exports: [DistrictsService, TypeOrmModule],
})
export class DistrictsModule {}
