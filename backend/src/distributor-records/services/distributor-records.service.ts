import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, Brackets } from 'typeorm';
import { DistributorRecordEntity } from '../entities/distributor-record.entity';
import {
  DistributorRecordDTO,
  UpdateDistributorRecordDTO,
} from '../dto/distributor-record.dto';
import { UsersEntity } from 'src/users/entities/users.entity';
import { UsersService } from 'src/users/services/users.service';
import { ErrorManager } from 'src/utils/error.manager';
import { FindManyOptions, Like } from 'typeorm';
import { ROLES } from 'src/constants/roles';
import { CreateDistributorRegistrationDto } from '../dto/create-distributor-registration.dto';
import { ImportResult } from 'src/orders/dto/import-result.dto';

export interface PaginatedRegistrations {
  data: any[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class DistributorRecordsService {
  constructor(
    @InjectRepository(DistributorRecordEntity)
    private readonly distributorRecordRepository: Repository<DistributorRecordEntity>,
    @InjectRepository(UsersEntity)
    private readonly userRepository: Repository<UsersEntity>,
    private readonly usersService: UsersService,
    private dataSource: DataSource,
  ) {}

  public async findAllPaginated(
    req: any,
    options: {
      page: number;
      limit: number;
      sortField: string;
      sortOrder: 'ASC' | 'DESC';
      search: string;
    },
  ): Promise<PaginatedRegistrations> {
    const idUser = req.idUser;
    const role = req.roleUser;
    const { page, limit, sortField, sortOrder, search } = options;
    const skip = (page - 1) * limit;

    // 1. Iniciar el QueryBuilder
    // 'record' es el alias para nuestra entidad principal DistributorRecordEntity
    const queryBuilder =
      this.distributorRecordRepository.createQueryBuilder('record');

    // 2. Unir la relación con el usuario para poder seleccionarlo y filtrarlo
    // 'user' es el alias para la entidad UsersEntity
    queryBuilder.leftJoinAndSelect('record.user', 'user');

    // 3. Aplicar el filtro de seguridad por rol
    if (role === ROLES.EMPRESA_DISTRIBUIDOR) {
      // Añadimos una condición 'AND' para filtrar por el ID del usuario
      queryBuilder.andWhere('record.user_id = :idUser', { idUser });
    }
    // Si es Admin/Recepcionista, no se aplica este filtro y puede ver todo.

    // 4. Aplicar el filtro de búsqueda con lógica 'OR'
    if (search) {
      // Usamos 'ILIKE' para una búsqueda insensible a mayúsculas/minúsculas
      // Usamos 'Brackets' para agrupar las condiciones 'OR' correctamente:
      // ... AND (clientName ILIKE ... OR clientDni ILIKE ... OR ...)
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('record.clientName ILIKE :search', { search: `%${search}%` })
            .orWhere('record.clientDni ILIKE :search', {
              search: `%${search}%`,
            })
            .orWhere('record.destinationAddress ILIKE :search', {
              search: `%${search}%`,
            })
            .orWhere('user.username ILIKE :search', { search: `%${search}%` });
        }),
      );
    }

    // 5. Aplicar ordenamiento, paginación y ejecutar la consulta
    queryBuilder
      .orderBy(`record.${sortField}`, sortOrder)
      .skip(skip)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    // 6. Sanitizar los datos del usuario antes de devolverlos (buena práctica)
    const sanitizedData = data.map((record) => {
      if (record.user) {
        return {
          ...record,
          user: {
            id: record.user.id,
            username: record.user.username, // o 'name'
          },
        };
      }
      return record;
    });

    return { data: sanitizedData, total, page, limit };
  }

  public async createDistributorRecord(
    body: DistributorRecordDTO,
    userId: string,
  ): Promise<DistributorRecordEntity> {
    try {
      const user = await this.usersService.findUserById(userId);
      if (!user) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'User not found',
        });
      }
      const newRecord = this.distributorRecordRepository.create({
        ...body,
        user: user,
      });
      return await this.distributorRecordRepository.save(newRecord);
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findDistributorRecordById(
    id: string,
  ): Promise<DistributorRecordEntity> {
    try {
      const record = await this.distributorRecordRepository.findOne({
        where: { id },
      });
      if (!record) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'Record not found',
        });
      }
      return record;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updateDistributorRecord(
    id: string,
    body: UpdateDistributorRecordDTO,
    userId: string,
  ): Promise<DistributorRecordEntity> {
    try {
      const user = await this.usersService.findUserById(userId);
      if (!user) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'User not found',
        });
      }
      const record = await this.findDistributorRecordById(id);
      this.distributorRecordRepository.merge(record, {
        ...body,
        user: user,
      });
      return await this.distributorRecordRepository.save(record);
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async deleteDistributorRecord(id: string): Promise<void> {
    try {
      const record = await this.findDistributorRecordById(id);
      await this.distributorRecordRepository.delete(record.id);
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async importFromParsedJson(
    dtos: CreateDistributorRegistrationDto[],
    userId: string,
  ): Promise<ImportResult> {
    const user = await this.usersService.findUserById(userId);
    if (!user) {
      // Es mejor lanzar una excepción para que el framework la maneje
      throw new NotFoundException('Usuario no encontrado.');
    }

    if (!dtos || dtos.length === 0) {
      return {
        success: false,
        message: 'No se proporcionaron datos para importar.',
      };
    }

    // Iniciamos el QueryRunner para manejar la transacción
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Mapeamos los DTOs a entidades parciales
      const registrationsToSave = dtos.map((dto) =>
        this.distributorRecordRepository.create({
          ...dto,
          user: user,
        }),
      );

      // Guardamos todas las entidades usando el manager del queryRunner
      await queryRunner.manager.save(registrationsToSave);

      // Si todo fue exitoso, hacemos commit de la transacción
      await queryRunner.commitTransaction();

      return {
        success: true,
        message: `¡Importación exitosa! Se han creado ${registrationsToSave.length} nuevos registros.`,
        importedCount: registrationsToSave.length,
      };
    } catch (error) {
      // Si ocurre CUALQUIER error durante el .save(), hacemos rollback
      await queryRunner.rollbackTransaction();

      console.error(
        'Error durante la transacción de importación, se ha hecho rollback:',
        error,
      );

      return {
        success: false,
        message: `Error al guardar en la base de datos. Ningún registro fue importado.`,
        errors: [{ row: 0, message: `Detalle del error: ${error.message}` }],
      };
    } finally {
      // Es crucial liberar el queryRunner al final para devolverlo al pool de conexiones
      await queryRunner.release();
    }
  }
}
