import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CashManagementEntity } from './entities/cashManagement.entity';
import { CashManagementService } from './services/cashManagement.service'; // Corrected import path
import { CashManagementController } from './controllers/cashManagement.controller';
import { UsersModule } from '../users/users.module';
import { CashMovementPdfGeneratorService } from './services/cash-movement-pdf-generator.service'; // Import new service
import { SettingsEntity } from 'src/settings/entities/settings.entity'; // Import SettingsEntity

@Module({
  imports: [
    TypeOrmModule.forFeature([CashManagementEntity, SettingsEntity]), // Add SettingsEntity to TypeOrmModule
    UsersModule
  ],
  providers: [CashManagementService, CashMovementPdfGeneratorService], // Add new service to providers
  controllers: [CashManagementController],
  exports: [CashManagementService],
})
export class CashManagementModule {}
