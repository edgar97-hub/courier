import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DistributorRecordsController } from './controllers/distributor-records.controller';
import { DistributorRecordsService } from './services/distributor-records.service';
import { DistributorRecordEntity } from './entities/distributor-record.entity';
import { UsersModule } from 'src/users/users.module';
import { UsersEntity } from 'src/users/entities/users.entity';
import { PdfGeneratorService } from './services/pdf-generator.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([DistributorRecordEntity, UsersEntity]),
    UsersModule,
  ],
  controllers: [DistributorRecordsController],
  providers: [DistributorRecordsService, PdfGeneratorService],
  exports: [DistributorRecordsService],
})
export class DistributorRecordsModule {}
