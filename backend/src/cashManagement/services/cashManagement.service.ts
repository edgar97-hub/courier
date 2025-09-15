import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets, Between, ILike, Raw } from 'typeorm';
import {
  CashManagementEntity,
  TYPES_MOVEMENTS,
} from '../entities/cashManagement.entity';
import {
  CreateCashMovementDto,
  QueryCashMovementDto,
  DetailedCashMovementSummaryDto,
  PaymentMethodSummary,
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
    code: number,
    delivery_date: string,
  ): Promise<CashManagementEntity> {
    const user = await this.usersService.findUserById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    // formatInTimeZone(new Date(), 'America/Lima', 'yyyy-MM-dd')
    const newMovement = this.cashMovementRepository.create({
      date: delivery_date,
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

  async updateDueToOrderModification(
    orderId: string,
    amount: number,
    paymentMethod: string,
  ): Promise<CashManagementEntity> {
    const existingMovement = await this.cashMovementRepository.findOne({
      where: {
        order: { id: orderId },
      },
    });

    if (!existingMovement) {
      throw new NotFoundException(`Cash movement ID not found`);
    }
    const updatedMovement = this.cashMovementRepository.merge(
      existingMovement,
      {
        amount: amount,
        paymentsMethod: paymentMethod,
      },
    );
    return await this.cashMovementRepository.save(updatedMovement);
  }

  async findAllMovements(
    query: QueryCashMovementDto,
    pageNumber: number = 1,
    pageSize: number = 10,
  ): Promise<{ movements: CashManagementEntity[]; total: number }> {
    // Inicializa el QueryBuilder
    const queryBuilder = this.cashMovementRepository
      .createQueryBuilder('movement')
      .leftJoinAndSelect('movement.user', 'user');

    // Condiciones AND para filtrar
    if (query.startDate && query.endDate) {
      queryBuilder.andWhere('movement.date BETWEEN :startDate AND :endDate', {
        startDate: query.startDate,
        endDate: query.endDate,
      });
    }

    if (query.typeMovement) {
      queryBuilder.andWhere('movement.typeMovement = :typeMovement', {
        typeMovement: query.typeMovement,
      });
    }

    if (query.paymentsMethod) {
      queryBuilder.andWhere('movement.paymentsMethod = :paymentsMethod', {
        paymentsMethod: query.paymentsMethod,
      });
    }

    if (query.userId) {
      queryBuilder.andWhere('user.id = :userId', {
        userId: query.userId,
      });
    }

    // Lógica de búsqueda OR con Brackets
    if (query.search) {
      const searchQuery = query.search.toLowerCase();
      const searchNumber = parseFloat(query.search);

      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('LOWER(movement.description) LIKE :searchQuery', {
            searchQuery: `%${searchQuery}%`,
          })
            .orWhere('LOWER(movement.paymentsMethod) LIKE :searchQuery', {
              searchQuery: `%${searchQuery}%`,
            })
            .orWhere('LOWER(user.username) LIKE :searchQuery', {
              searchQuery: `%${searchQuery}%`,
            });

          if (!isNaN(searchNumber)) {
            qb.orWhere('movement.code = :searchNumber', {
              searchNumber: searchNumber,
            }).orWhere('movement.amount = :searchNumber', {
              searchNumber: searchNumber,
            });
          }
        }),
      );
    }

    // Ordenamiento
    const orderBy = query.orderBy || 'code';
    const orderDirection =
      (query.orderDirection?.toUpperCase() as 'ASC' | 'DESC') || 'DESC';
    queryBuilder.orderBy(`movement.${orderBy}`, orderDirection);

    // Paginación y ejecución de la consulta
    const [movements, total] = await queryBuilder
      .skip((pageNumber - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

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

  async getDetailedBalanceSummary(
    query: QueryCashMovementDto,
  ): Promise<DetailedCashMovementSummaryDto> {
    const movements = await this.cashMovementRepository.find({
      where: this.buildWhereClauseForSummary(query),
      relations: ['user'],
    });

    const paymentMethods = [
      'Efectivo',
      'Yape/Transferencia BCP',
      'Plin/Transferencia INTERBANK',
      'POS',
    ];

    const summary: DetailedCashMovementSummaryDto = {
      Efectivo: { income: 0, expense: 0, balance: 0 },
      'Yape/Transferencia BCP': { income: 0, expense: 0, balance: 0 },
      'Plin/Transferencia INTERBANK': { income: 0, expense: 0, balance: 0 },
      POS: { income: 0, expense: 0, balance: 0 },
      totalCashIncome: 0,
      totalCashExpense: 0,
      totalCashBalance: 0,
    };

    for (const movement of movements) {
      const method =
        movement.paymentsMethod as keyof DetailedCashMovementSummaryDto;
      if (paymentMethods.includes(method)) {
        if (movement.typeMovement === TYPES_MOVEMENTS.INCOME) {
          (summary[method] as PaymentMethodSummary).income += movement.amount;
          summary.totalCashIncome += movement.amount;
        } else if (movement.typeMovement === TYPES_MOVEMENTS.OUTCOME) {
          (summary[method] as PaymentMethodSummary).expense += movement.amount;
          summary.totalCashExpense += movement.amount;
        }
      }
    }

    for (const method of paymentMethods) {
      const methodKey = method as keyof DetailedCashMovementSummaryDto;
      (summary[methodKey] as PaymentMethodSummary).balance =
        (summary[methodKey] as PaymentMethodSummary).income -
        (summary[methodKey] as PaymentMethodSummary).expense;
    }

    summary.totalCashBalance =
      summary.totalCashIncome - summary.totalCashExpense;

    return summary;
  }

  private buildWhereClauseForSummary(query: QueryCashMovementDto): any {
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
    return where;
  }
}
