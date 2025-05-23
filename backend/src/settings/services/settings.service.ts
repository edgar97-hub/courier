import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorManager } from 'src/utils/error.manager';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { SettingDTO, SettingUpdateDTO } from '../dto/setting.dto';
import { SettingsEntity } from '../entities/settings.entity';
import { Express } from 'express';
import { Multer } from 'multer';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(SettingsEntity)
    private readonly userRepository: Repository<SettingsEntity>,
  ) {}

  public async createUser(body: SettingDTO): Promise<SettingsEntity> {
    try {
      return await this.userRepository.save(body);
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findUsers(): Promise<SettingsEntity[]> {
    try {
      const users: SettingsEntity[] = await this.userRepository.find();
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

  public async findUserById(id: string): Promise<SettingsEntity> {
    try {
      const user: SettingsEntity = (await this.userRepository
        .createQueryBuilder('user')
        .where({ id })
        .leftJoinAndSelect('user.projectsIncludes', 'projectsIncludes')
        .leftJoinAndSelect('projectsIncludes.project', 'project')
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

  public async findBy({ key, value }: { key: keyof SettingDTO; value: any }) {
    try {
      const user: SettingsEntity = (await this.userRepository
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
    body: SettingUpdateDTO,
    id: string,
  ): Promise<any | undefined> {
    try {
      const user = await this.userRepository.update(id, body);
      if (user.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo actualizar',
        });
      }

      const updatedUser = await this.userRepository.findOneBy({
        id: id,
      }); // O solo { id } si tu ID es string

      if (!updatedUser) {
        // Esto sería muy raro si updateResult.affected > 0, pero es una salvaguarda
        throw new ErrorManager({
          type: 'INTERNAL_SERVER_ERROR',
          message: 'El usuario fue actualizado pero no se pudo recuperar.',
        });
      }

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
  public async uploadLogo(
    logoFile: Express.Multer.File,
    req: Request,
  ): Promise<{ logo_url: string }> {
    try {
      if (!logoFile) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No logo file provided',
        });
      }
      const fileName = `logo-${Date.now()}-${logoFile.originalname}`;
      const filePath = path.join(
        __dirname,
        '..',
        '..',
        '..',
        'public',
        'uploads',
        fileName,
      );
      await fs.promises.writeFile(filePath, logoFile.buffer);
      const relativeUrl = `/uploads/${fileName}`;
      const protocol = (req as any).protocol;
      const host = (req as any).get('host');
      const absoluteUrl = `${protocol}://${host}${relativeUrl}`;
      return { logo_url: absoluteUrl };
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async uploadTermsPdf(
    termsPdfFile: Express.Multer.File,
    req: Request,
  ): Promise<{ terms_conditions_url: string }> {
    try {
      if (!termsPdfFile) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No terms PDF file provided',
        });
      }

      const fileName = `terms-${Date.now()}-${termsPdfFile.originalname}`;
      const filePath = path.join(
        __dirname,
        '..',
        '..',
        '..',
        'public',
        'uploads',
        fileName,
      );
      await fs.promises.writeFile(filePath, termsPdfFile.buffer);
      const relativeUrl = `/uploads/${fileName}`;
      const protocol = (req as any).protocol;
      const host = (req as any).get('host');
      const absoluteUrl = `${protocol}://${host}${relativeUrl}`;
      return { terms_conditions_url: absoluteUrl };
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async uploadFile(
    termsPdfFile: Express.Multer.File,
    req: Request,
  ): Promise<{ file_url: string }> {
    try {
      if (!termsPdfFile) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No terms PDF file provided',
        });
      }

      const fileName = `${Date.now()}-${termsPdfFile.originalname}`;
      const filePath = path.join(
        __dirname,
        '..',
        '..',
        '..',
        'public',
        'uploads',
        fileName,
      );
      await fs.promises.writeFile(filePath, termsPdfFile.buffer);
      const relativeUrl = `/uploads/${fileName}`;
      const protocol = (req as any).protocol;
      const host = (req as any).get('host');
      const absoluteUrl = `${protocol}://${host}${relativeUrl}`;
      return { file_url: absoluteUrl };
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }
}
