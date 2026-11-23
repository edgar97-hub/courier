import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CashManagementEntity } from './entities/cashManagement.entity';
import { CashManagementService } from './services/cashManagement.service';
import { CashManagementController } from './controllers/cashManagement.controller';
import { UsersModule } from '../users/users.module';
import { CashMovementPdfGeneratorService } from './services/cash-movement-pdf-generator.service';
import { SettingsEntity } from 'src/settings/entities/settings.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CashManagementEntity, SettingsEntity]),
    UsersModule,
  ],
  providers: [CashManagementService, CashMovementPdfGeneratorService],
  controllers: [CashManagementController],
  exports: [CashManagementService],
})
export class CashManagementModule {}
