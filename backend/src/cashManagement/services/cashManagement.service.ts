import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import {
  CashManagementEntity,
  TYPES_MOVEMENTS,
} from '../entities/cashManagement.entity';
import {
  CreateCashMovementDto,
  QueryCashMovementDto,
} from '../dto/cashManagement.dto';
import { UsersService } from '../../users/services/users.service';
import { UsersEntity } from '../../users/entities/users.entity';
import { formatInTimeZone } from 'date-fns-tz';

@Injectable()
export class CashManagementService {
  constructor(
    @InjectRepository(CashManagementEntity)
    private readonly cashMovementRepository: Repository<CashManagementEntity>,
    private readonly usersService: UsersService,
  ) {}

  async createManualMovement(
    dto: CreateCashMovementDto,
    userId: string,
  ): Promise<CashManagementEntity> {
    const user = await this.usersService.findUserById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const newMovement = this.cashMovementRepository.create({
      ...dto,
      date: dto.date
        ? formatInTimeZone(new Date(dto.date), 'America/Lima', 'yyyy-MM-dd')
        : undefined,
      paymentsMethod: dto.paymentsMethod,
      user: user,
    });
    return await this.cashMovementRepository.save(newMovement);
  }

  async updateCashMovement(
    id: string,
    dto: CreateCashMovementDto,
    userId: string,
  ): Promise<CashManagementEntity> {
    const existingMovement = await this.cashMovementRepository.findOne({
      where: { id },
    });
    if (!existingMovement) {
      throw new NotFoundException(`Cash movement with ID ${id} not found`);
    }

    const user = await this.usersService.findUserById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const updatedMovement = this.cashMovementRepository.merge(
      existingMovement,
      {
        ...dto,
        date: dto.date
          ? formatInTimeZone(new Date(dto.date), 'America/Lima', 'yyyy-MM-dd')
          : undefined,
        paymentsMethod: dto.paymentsMethod,
        user: user,
      },
    );
    return await this.cashMovementRepository.save(updatedMovement);
  }

  async deleteCashMovement(id: string): Promise<void> {
    const result = await this.cashMovementRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Cash movement with ID ${id} not found`);
    }
  }

  async createAutomaticIncome(
    amount: number,
    paymentMethod: string,
    userId: string,
    orderId: string,
    code?: number,
  ): Promise<CashManagementEntity> {
    const user = await this.usersService.findUserById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    const newMovement = this.cashMovementRepository.create({
      date: formatInTimeZone(new Date(), 'America/Lima', 'yyyy-MM-dd'),
      amount,
      typeMovement: TYPES_MOVEMENTS.INCOME,
      paymentsMethod: paymentMethod,
      description: 'Ingreso automático por pedido # ' + code,
      user: user,
      order: { id: orderId },
    });
    return await this.cashMovementRepository.save(newMovement);
  }

  async reverseAutomaticIncome(orderId: string): Promise<void> {
    const movement = await this.cashMovementRepository.findOne({
      where: {
        order: { id: orderId },
      },
    });
    if (movement) {
      await this.cashMovementRepository.remove(movement);
    }
  }

  async findAllMovements(
    query: QueryCashMovementDto,
    pageNumber: number = 1,
    pageSize: number = 10,
  ): Promise<{ movements: CashManagementEntity[]; total: number }> {
    const where: any = {};

    if (query.startDate && query.endDate) {
      where.date = Between(query.startDate, query.endDate);
    }

    if (query.typeMovement) {
      where.typeMovement = query.typeMovement;
    }
    if (query.paymentsMethod) {
      where.paymentsMethod = query.paymentsMethod;
    }
    if (query.userId) {
      where.user = { id: query.userId };
    }

    const [movements, total] = await this.cashMovementRepository.findAndCount({
      where,
      order: { date: 'DESC' },
      relations: ['user'],
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
    });

    return { movements, total };
  }

  async getBalanceSummary(
    query: QueryCashMovementDto,
  ): Promise<{ totalIncome: number; totalExpense: number; balance: number }> {
    const movements = await this.cashMovementRepository.find({
      where: this.buildWhereClauseForSummary(query),
      relations: ['user'],
    });

    let totalIncome = 0;
    let totalExpense = 0;

    for (const movement of movements) {
      if (movement.typeMovement === TYPES_MOVEMENTS.INCOME) {
        totalIncome += movement.amount;
      } else if (movement.typeMovement === TYPES_MOVEMENTS.OUTCOME) {
        totalExpense += movement.amount;
      }
    }

    const balance = totalIncome - totalExpense;
    return { totalIncome, totalExpense, balance };
  }

  private buildWhereClauseForSummary(query: QueryCashMovementDto): any {
    const where: any = {};

    if (query.startDate && query.endDate) {
      where.date = Between(query.startDate, query.startDate);
    }
    if (query.typeMovement) {
      where.typeMovement = query.typeMovement;
    }
    if (query.paymentsMethod) {
      where.paymentsMethod = query.paymentsMethod;
    }
    if (query.userId) {
      where.user = { id: query.userId };
    }
    return where;
  }
}
