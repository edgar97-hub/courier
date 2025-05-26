import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorManager } from 'src/utils/error.manager';
import {
  Between,
  DeleteResult,
  FindOptionsWhere,
  Like,
  Repository,
  UpdateResult,
} from 'typeorm';
import { DistrictDTO, DistrictUpdateDTO } from '../dto/district.dto';
import { DistrictsEntity } from '../entities/districts.entity';

@Injectable()
export class DistrictsService {
  constructor(
    @InjectRepository(DistrictsEntity)
    private readonly userRepository: Repository<DistrictsEntity>,
  ) {}

  public async findDistricts({
    pageNumber = 0,
    pageSize = 10,
    sortField = '',
    sortDirection = '',
    search = '',
  }: {
    pageNumber?: number;
    pageSize?: number;
    sortField?: string;
    sortDirection?: string;
    search?: String;
  }): Promise<{
    items: any;
    total_count: number;
    page_number: number;
    page_size: number;
  }> {
    try {
      const skip = (pageNumber - 1) * pageSize;
      const query = this.userRepository.createQueryBuilder('districts');

      if (search) {
        query.where('LOWER(districts.name) LIKE :search', {
          search: `%${search.toLowerCase()}%`,
        });
      }

      const sortBy = sortField || 'updatedAt';
      const sortDir = (sortDirection || 'DESC').toUpperCase() as 'ASC' | 'DESC';
      query.orderBy(`districts.${sortBy}`, sortDir).skip(skip).take(pageSize);
      const [items, total] = await query.getManyAndCount();

      return {
        items,
        total_count: total,
        page_number: pageNumber,
        page_size: pageSize,
      };
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async createUser(body: DistrictDTO): Promise<DistrictsEntity> {
    try {
      return await this.userRepository.save(body);
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findUsers(): Promise<DistrictsEntity[]> {
    try {
      const users: DistrictsEntity[] = await this.userRepository.find({
        order: {
          code: 'ASC',
        },
      });
      // if (users.length === 0) {
      //   throw new ErrorManager({
      //     type: 'BAD_REQUEST',
      //     message: 'No se encontro resultado',
      //   });
      // }
      return users;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findUserById(id: string): Promise<DistrictsEntity> {
    try {
      const user: DistrictsEntity = (await this.userRepository
        .createQueryBuilder('districts')
        .where({ id })
        // .leftJoinAndSelect('user.projectsIncludes', 'projectsIncludes')
        // .leftJoinAndSelect('projectsIncludes.project', 'project')
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

  public async findBy({ key, value }: { key: keyof DistrictDTO; value: any }) {
    try {
      const user: DistrictsEntity = (await this.userRepository
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
    body: DistrictUpdateDTO,
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

  public async deleteUser(id: string): Promise<DeleteResult | undefined> {
    try {
      const user: DeleteResult = await this.userRepository.delete(id);
      if (user.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo borrar',
        });
      }
      return user;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }
}
