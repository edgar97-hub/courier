import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { ErrorManager } from 'src/utils/error.manager';
import { Brackets, DeleteResult, Repository, UpdateResult } from 'typeorm';
import {
  RegistrationUserCompanyDTO,
  UserCompanyUpdateDTO,
  UserDTO,
  UserProfile,
  UserUpdateDTO,
} from '../dto/user.dto';
import { UsersEntity } from '../entities/users.entity';
import { ROLES } from 'src/constants/roles';
import {
  DiscountRuleType,
  SettingsEntity,
  VolumeDiscountRule,
} from 'src/settings/entities/settings.entity';

export interface PaginatedUsers {
  items: UsersEntity[];
  total_count: number;
  page_number: number;
  page_size: number;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersEntity)
    private readonly userRepository: Repository<UsersEntity>,
    @InjectRepository(SettingsEntity)
    private readonly settingsRepository: Repository<SettingsEntity>,
  ) {}

  public async createUser(body: UserDTO): Promise<UsersEntity> {
    try {
      await this.validateVolumeDiscountAssignment(
        body.isVolumeDiscountEnabled,
        body.assignedVolumeDiscountRuleIds,
      );
      body.password = await bcrypt.hash(
        body.password,
        Number(process.env.HASH_SALT),
      );
      return await this.userRepository.save(body);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async registerCompany(
    body: RegistrationUserCompanyDTO,
  ): Promise<UsersEntity> {
    try {
      body.password = await bcrypt.hash(
        body.password,
        Number(process.env.HASH_SALT),
      );
      body.role = ROLES.EMPRESA;
      body.isVolumeDiscountEnabled = false;
      body.assignedVolumeDiscountRuleIds = [];

      const savedUser = await this.userRepository.save(body);
      return savedUser;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findUsers(): Promise<UsersEntity[]> {
    try {
      const users: UsersEntity[] = await this.userRepository.find({
        order: {
          code: 'ASC',
        },
      });
      return users;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findUsersByRol({
    search_term = '',
    role = '',
    fulfillment_enabled,
  }: {
    search_term?: string;
    role?: string;
    fulfillment_enabled?: boolean;
  }): Promise<UsersEntity[]> {
    try {
      const queryBuilder = this.userRepository.createQueryBuilder('user');

      if (search_term) {
        queryBuilder.andWhere('LOWER(user.username) LIKE LOWER(:search)', {
          search: `%${search_term}%`,
        });
      }

      if (role) {
        queryBuilder.andWhere('user.role IN (:...role)', {
          role: role.split(','),
        });
      }

      if (fulfillment_enabled !== undefined) {
        queryBuilder.andWhere('user.is_fulfillment_enabled = :fulfillment_enabled', {
          fulfillment_enabled,
        });
      }

      const users: UsersEntity[] = await queryBuilder.getMany();

      return users;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findUsersPaginated(options: {
    page_number: number;
    page_size: number;
    sort_field: string;
    sort_direction: 'ASC' | 'DESC';
    search_term: string;
    role: string;
  }): Promise<PaginatedUsers> {
    try {
      const {
        page_number,
        page_size,
        sort_field,
        sort_direction,
        search_term,
        role,
      } = options;

      const skip = (page_number - 1) * page_size;
      const queryBuilder =
        this.userRepository.createQueryBuilder('user');

      if (search_term) {
        queryBuilder.andWhere(
          new Brackets((qb) => {
            qb.where('user.username ILIKE :search', {
              search: `%${search_term}%`,
            })
              .orWhere('user.email ILIKE :search', {
                search: `%${search_term}%`,
              })
              .orWhere('CAST(user.code AS TEXT) ILIKE :search', {
                search: `%${search_term}%`,
              })
              .orWhere('user.business_name ILIKE :search', {
                search: `%${search_term}%`,
              })
              .orWhere('CAST(user.role AS TEXT) ILIKE :search', {
                search: `%${search_term}%`,
              });
          }),
        );
      }

      if (role) {
        queryBuilder.andWhere('user.role IN (:...role)', {
          role: role.split(','),
        });
      }

      const sortFieldMap: Record<string, string> = {
        code: 'user.code',
        username: 'user.username',
        email: 'user.email',
        role: 'user.role',
        business_name: 'user.business_name',
        createdAt: 'user.createdAt',
      };
      const sortBy = sortFieldMap[sort_field] || `user.${sort_field}`;

      queryBuilder
        .orderBy(sortBy, sort_direction)
        .skip(skip)
        .take(page_size);

      const [items, total_count] = await queryBuilder.getManyAndCount();

      return { items, total_count, page_number, page_size };
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findUserById(id: string): Promise<UsersEntity> {
    try {
      const user: UsersEntity = (await this.userRepository
        .createQueryBuilder('user')
        .where({ id })
        .getOne()) as any;
      if (!user) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se encontro resultado',
        });
      }
      return user;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findUserPerfil(idUser: string): Promise<UsersEntity> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: idUser },
      });
      if (!user) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se encontro resultado',
        });
      }
      return user;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findBy({ key, value }: { key: keyof UserDTO; value: any }) {
    try {
      const user: UsersEntity = (await this.userRepository
        .createQueryBuilder('user')
        .addSelect('user.password')
        .where({ [key]: value })
        .getOne()) as any;

      return user;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updateUser(
    body: UserUpdateDTO,
    id: string,
  ): Promise<UpdateResult | undefined> {
    try {
      const currentUser = await this.userRepository.findOne({
        where: { id },
      });
      await this.validateVolumeDiscountAssignment(
        body.isVolumeDiscountEnabled,
        body.assignedVolumeDiscountRuleIds,
        currentUser,
      );

      if (body.password) {
        body.password = await bcrypt.hash(
          body.password,
          Number(process.env.HASH_SALT),
        );
      } else {
        delete body.password;
      }

      const user: UpdateResult = await this.userRepository.update(id, body);
      if (user.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo actualizar',
        });
      }
      return user;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updateUserCompany(
    body: UserCompanyUpdateDTO,
    id: string,
  ): Promise<UpdateResult | undefined> {
    try {
      const user: UpdateResult = await this.userRepository.update(id, body);
      if (user.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo actualizar',
        });
      }
      return user;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updateProfile(
    body: UserProfile,
    id: string,
  ): Promise<any | undefined> {
    try {
      if (body.password) {
        body.password = await bcrypt.hash(
          body.password,
          Number(process.env.HASH_SALT),
        );
      } else {
        delete body.password;
      }
      await this.userRepository.update(id, body);
      const updatedUser = await this.userRepository.findOne({
        where: { id },
      });

      return updatedUser;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async deleteUser(id: string): Promise<DeleteResult | undefined> {
    try {
      // Verificar si el usuario existe
      const userExists = await this.userRepository.findOne({
        where: { id },
        select: ['id'],
      });

      if (!userExists) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo borrar',
        });
      }

      // Contar registros relacionados usando consultas directas
      const orderCountAsUser = await this.userRepository.query(
        `SELECT COUNT(*) as count FROM orders WHERE user_id = $1`,
        [id],
      );
      const orderCountAsDriver = await this.userRepository.query(
        `SELECT COUNT(*) as count FROM orders WHERE assigned_driver_id = $1`,
        [id],
      );
      const orderCountAsCompany = await this.userRepository.query(
        `SELECT COUNT(*) as count FROM orders WHERE company_id = $1`,
        [id],
      );
      const cashCount = await this.userRepository.query(
        `SELECT COUNT(*) as count FROM cash_management WHERE user_id = $1`,
        [id],
      );
      const distributorCount = await this.userRepository.query(
        `SELECT COUNT(*) as count FROM distributor_records WHERE user_id = $1`,
        [id],
      );

      const relatedRecords: string[] = [];
      const asUser = parseInt(orderCountAsUser[0]?.count || '0', 10);
      const asDriver = parseInt(orderCountAsDriver[0]?.count || '0', 10);
      const asCompany = parseInt(orderCountAsCompany[0]?.count || '0', 10);
      const cash = parseInt(cashCount[0]?.count || '0', 10);
      const distributor = parseInt(distributorCount[0]?.count || '0', 10);

      if (asUser > 0) relatedRecords.push(`${asUser} orden(es) como cliente`);
      if (asDriver > 0) relatedRecords.push(`${asDriver} orden(es) como motorista`);
      if (asCompany > 0) relatedRecords.push(`${asCompany} orden(es) como empresa`);
      if (cash > 0) relatedRecords.push(`${cash} registro(s) de caja`);
      if (distributor > 0) relatedRecords.push(`${distributor} registro(s) de distribuidor`);

      if (relatedRecords.length > 0) {
        throw new BadRequestException(
          `No se puede eliminar el usuario porque tiene registros relacionados: ${relatedRecords.join(', ')}.`,
        );
      }

      const result: DeleteResult = await this.userRepository.delete(id);
      if (result.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo borrar',
        });
      }
      return result;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  private async validateVolumeDiscountAssignment(
    isEnabled: boolean | undefined,
    assignedRuleIds: string[] | undefined,
    currentUser?: UsersEntity | null,
  ): Promise<void> {
    const effectiveEnabled =
      isEnabled ?? currentUser?.isVolumeDiscountEnabled ?? false;
    const effectiveRuleIds =
      assignedRuleIds ?? currentUser?.assignedVolumeDiscountRuleIds ?? [];

    if (!effectiveEnabled || effectiveRuleIds.length === 0) {
      return;
    }

    const settings = await this.settingsRepository.findOne({
      where: {},
    });
    const rules = settings?.volumeDiscountRules ?? [];
    const selectedRules = rules.filter(
      (rule) => effectiveRuleIds.includes(rule.id) && rule.isActive !== false,
    );

    const errors: string[] = [];

    for (let i = 0; i < selectedRules.length; i++) {
      for (let j = i + 1; j < selectedRules.length; j++) {
        const first = selectedRules[i];
        const second = selectedRules[j];

        if (!this.dateRangesOverlap(first, second)) {
          continue;
        }

        if (
          first.type === DiscountRuleType.GOAL &&
          second.type === DiscountRuleType.GOAL
        ) {
          errors.push(
            `Las metas ${this.volumeRuleLabel(first)} y ${this.volumeRuleLabel(second)} tienen fechas superpuestas.`,
          );
          continue;
        }

        if (first.type !== second.type) {
          errors.push(
            `${this.volumeRuleLabel(first)} y ${this.volumeRuleLabel(second)} coinciden en fechas. Deja solo una.`,
          );
          continue;
        }

        if (this.orderRangesOverlap(first, second)) {
          errors.push(
            `Los rangos ${this.volumeRuleLabel(first)} y ${this.volumeRuleLabel(second)} se superponen en cantidad de pedidos.`,
          );
        }
      }
    }

    if (errors.length > 0) {
      throw new BadRequestException(errors.join(' '));
    }
  }

  private dateRangesOverlap(
    first: VolumeDiscountRule,
    second: VolumeDiscountRule,
  ): boolean {
    const firstStart = (first.startDate || '0000-01-01').slice(0, 10);
    const firstEnd = (first.endDate || '9999-12-31').slice(0, 10);
    const secondStart = (second.startDate || '0000-01-01').slice(0, 10);
    const secondEnd = (second.endDate || '9999-12-31').slice(0, 10);

    return firstStart <= secondEnd && secondStart <= firstEnd;
  }

  private orderRangesOverlap(
    first: VolumeDiscountRule,
    second: VolumeDiscountRule,
  ): boolean {
    const firstMax = first.maxOrders ?? Number.MAX_SAFE_INTEGER;
    const secondMax = second.maxOrders ?? Number.MAX_SAFE_INTEGER;

    return first.minOrders <= secondMax && second.minOrders <= firstMax;
  }

  private volumeRuleLabel(rule: VolumeDiscountRule): string {
    const base =
      rule.type === DiscountRuleType.GOAL
        ? `meta ${rule.minOrders}`
        : `rango ${rule.minOrders}-${rule.maxOrders ?? '∞'}`;
    const start = (rule.startDate || 'sin inicio').slice(0, 10);
    const end = (rule.endDate || 'sin fin').slice(0, 10);

    return `${base} (${rule.discountPercentage}%) [${start} a ${end}]`;
  }
}
