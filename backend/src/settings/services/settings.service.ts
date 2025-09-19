import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorManager } from 'src/utils/error.manager';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { SettingDTO, SettingUpdateDTO } from '../dto/setting.dto';
import {
  PromotionalSetItem,
  SettingsEntity,
} from '../entities/settings.entity';
// import { Express, Response } from 'express';
import { Response } from 'express';
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

  public async findUserById(id: string): Promise<SettingsEntity | null> {
    try {
      // const user: SettingsEntity = (await this.userRepository
      //   .createQueryBuilder('user')
      //   .where({ id })
      //   .leftJoinAndSelect('user.projectsIncludes', 'projectsIncludes')
      //   .leftJoinAndSelect('projectsIncludes.project', 'project')
      //   .getOne()) as any;
      // if (!user) {
      //   throw new ErrorManager({
      //     type: 'BAD_REQUEST',
      //     message: 'No se encontro resultado',
      //   });
      // }
      // return user;
      const configurations = await this.userRepository.find({ take: 1 });
      if (!configurations || configurations.length === 0) {
        return null;
      }
      return configurations[0];
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

  async getPromotionalSets(): Promise<PromotionalSetItem[] | []> {
    const config = await this.userRepository.find({ take: 1 });
    if (!config || config.length === 0) {
      return [];
    }

    return (
      config[0]?.promotional_sets
        ?.filter((set) => set.isActive !== false)
        .sort((a, b) => (a.order || 0) - (b.order || 0)) || []
    );
  }

  public async updateUser(
    body: SettingUpdateDTO,
    id: string,
  ): Promise<any | undefined> {
    try {
      if (body.promotional_sets !== undefined) {
        // Asegurar que cada item tenga un ID si el frontend no lo genera siempre
        body.promotional_sets = body.promotional_sets.map((set) => ({
          ...set,
          id: set.id || Date.now().toString(),
        }));
      }
      const user = await this.userRepository.update(id, body);
      if (user.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo actualizar',
        });
      }

      const updatedUser = await this.userRepository.findOneBy({
        id: id,
      });

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
    file: Express.Multer.File,
    req: Request,
  ): Promise<{ file_url: string }> {
    try {
      if (!file) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No terms PDF file provided',
        });
      }

      const fileName = `${Date.now()}-${file.originalname}`;
      const filePath = path.join(
        __dirname,
        '..',
        '..',
        '..',
        'public',
        'uploads',
        fileName,
      );
      await fs.promises.writeFile(filePath, file.buffer);
      const relativeUrl = `/uploads/${fileName}`;
      const protocol = (req as any).protocol;
      const host = (req as any).get('host');
      const absoluteUrl = `${protocol}://${host}${relativeUrl}`;
      return { file_url: absoluteUrl };
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async getBackgroundImage(res: Response): Promise<void> {
    try {
      const setting = await this.userRepository.findOne({ where: {} });

      let imageResponse;
      if (setting?.background_image_url) {
        imageResponse = await fetch(setting.background_image_url);
      }

      if (setting?.background_image_url) {
        console.log(`Fetching logo from: ${setting.background_image_url}`);
        const imageResponse = await fetch(setting.background_image_url);

        if (imageResponse.ok && imageResponse.body) {
          const contentType = imageResponse.headers.get('content-type');
          res.setHeader('Content-Type', contentType || 'image/png');
          const { pipeline } = await import('stream/promises');
          await pipeline(imageResponse.body, res);
        }
      }
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async getLogoImage(res: Response): Promise<void> {
    try {
      const setting = await this.userRepository.findOne({ where: {} });

      let imageResponse;
      if (setting?.logo_url) {
        imageResponse = await fetch(setting.logo_url);
      }

      if (setting?.logo_url) {
        console.log(`Fetching logo from: ${setting.logo_url}`);
        const imageResponse = await fetch(setting.logo_url);

        if (imageResponse.ok && imageResponse.body) {
          const contentType = imageResponse.headers.get('content-type');
          res.setHeader('Content-Type', contentType || 'image/png');
          const { pipeline } = await import('stream/promises');
          await pipeline(imageResponse.body, res);
        }
      }
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async getGlobalNoticeImage(res: Response): Promise<void> {
    try {
      const setting = await this.userRepository.findOne({ where: {} });

      if (setting?.global_notice_image_url) {
        console.log(`Fetching logo from: ${setting.global_notice_image_url}`);
        const imageResponse = await fetch(setting.global_notice_image_url);

        if (imageResponse.ok && imageResponse.body) {
          const contentType = imageResponse.headers.get('content-type');
          res.setHeader('Content-Type', contentType || 'image/png');
          const { pipeline } = await import('stream/promises');
          await pipeline(imageResponse.body, res);
        }
      } else {
        throw ErrorManager.createSignatureError('no existe imagen');
      }
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }
}
