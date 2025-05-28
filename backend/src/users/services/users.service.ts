import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { ErrorManager } from 'src/utils/error.manager';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { UserDTO, UserProfile, UserUpdateDTO } from '../dto/user.dto';
import { UsersEntity } from '../entities/users.entity';
import { ROLES } from 'src/constants/roles';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersEntity)
    private readonly userRepository: Repository<UsersEntity>,
  ) {}

  public async createUser(body: UserDTO): Promise<UsersEntity> {
    try {
      body.password = await bcrypt.hash(
        body.password,
        Number(process.env.HASH_SALT),
      );
      return await this.userRepository.save(body);
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

  public async findUsersByRol({
    search_term = '',
    role = '',
  }: {
    search_term?: string;
    role?: string;
  }): Promise<UsersEntity[]> {
    try {
      const queryBuilder = this.userRepository.createQueryBuilder('user');

      if (search_term) {
        queryBuilder.andWhere('LOWER(user.username) LIKE LOWER(:search)', {
          search: `%${search_term}%`,
        });
      }

      if (role) {
        queryBuilder.andWhere('user.role = :role', { role });
      }

      const users: UsersEntity[] = await queryBuilder.getMany();

      return users;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  // public async findUserById(id: string): Promise<UsersEntity> {
  //   try {
  //     return (await this.userRepository
  //       .createQueryBuilder('user')
  //       .where({ id })
  //       .leftJoinAndSelect('user.projectsIncludes', 'projectsIncludes')
  //       .leftJoinAndSelect('projectsIncludes.project', 'project')
  //       .getOne()) as any;

  //     // const user: UsersEntity = await this.userRepository
  //     //   .createQueryBuilder('user')
  //     //   .where({ id })
  //     //   .leftJoinAndSelect('user.projectsIncludes', 'projectsIncludes')
  //     //   .leftJoinAndSelect('projectsIncludes.project', 'project')
  //     //   .getOne();
  //     // if (!user) {
  //     //   throw new ErrorManager({
  //     //     type: 'BAD_REQUEST',
  //     //     message: 'No se encontro resultado',
  //     //   });
  //     // }
  //     // return user;
  //   } catch (error) {
  //     throw ErrorManager.createSignatureError(error.message);
  //   }
  // }
  public async findUserById(id: string): Promise<UsersEntity> {
    try {
      const user: UsersEntity = (await this.userRepository
        .createQueryBuilder('user')
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

  public async findUserPerfil(idUser: string): Promise<UsersEntity> {
    console.log('idUser', idUser);
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
