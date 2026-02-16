import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';

import { ErrorManager } from 'src/utils/error.manager';
import { SettingDTO, SettingUpdateDTO } from '../dto/setting.dto';
import {
  PromotionalSetItem,
  SettingsEntity,
} from '../entities/settings.entity';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(SettingsEntity)
    private readonly settingsRepository: Repository<SettingsEntity>,
  ) {}

  public async createSettings(body: SettingDTO): Promise<SettingsEntity> {
    try {
      return await this.settingsRepository.save(body);
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findAllSettings(): Promise<SettingsEntity[]> {
    try {
      return await this.settingsRepository.find();
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findSettingsById(id: string): Promise<SettingsEntity | null> {
    try {
      const configurations = await this.settingsRepository.find({ take: 1 });
      if (!configurations || configurations.length === 0) {
        return null;
      }
      return configurations[0];
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findBy({
    key,
    value,
  }: {
    key: keyof SettingDTO;
    value: any;
  }): Promise<SettingsEntity> {
    try {
      const settings: SettingsEntity = (await this.settingsRepository
        .createQueryBuilder('settings')
        .addSelect('settings.password')
        .where({ [key]: value })
        .getOne()) as any;

      return settings;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async getPromotionalSets(): Promise<PromotionalSetItem[] | []> {
    const config = await this.settingsRepository.find({ take: 1 });
    if (!config || config.length === 0) {
      return [];
    }

    return (
      config[0]?.promotional_sets
        ?.filter((set) => set.isActive !== false)
        .sort((a, b) => (a.order || 0) - (b.order || 0)) || []
    );
  }

  public async updateSettings(
    body: SettingUpdateDTO,
    id: string,
  ): Promise<SettingsEntity> {
    try {
      if (body.promotional_sets !== undefined) {
        body.promotional_sets = body.promotional_sets.map((set) => ({
          ...set,
          id: set.id || `pro-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        }));
      }

      if (body.volumeDiscountRules !== undefined) {
        body.volumeDiscountRules = body.volumeDiscountRules.map((rule) => ({
          ...rule,
          id:
            rule.id || `vol-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        }));
      }
      const updateResult: UpdateResult = await this.settingsRepository.update(
        id,
        body,
      );
      if (updateResult.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo actualizar',
        });
      }

      const updatedSettings = await this.settingsRepository.findOneBy({
        id: id,
      });

      if (!updatedSettings) {
        throw new ErrorManager({
          type: 'INTERNAL_SERVER_ERROR',
          message:
            'Los ajustes fueron actualizados pero no se pudieron recuperar.',
        });
      }

      return updatedSettings;
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
          message: 'No file provided',
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
      const setting = await this.settingsRepository.findOne({ where: {} });

      if (!setting?.background_image_url) {
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: 'Background image URL not found in settings',
        });
      }

      const imageResponse = await fetch(setting.background_image_url);

      if (imageResponse.ok && imageResponse.body) {
        const contentType = imageResponse.headers.get('content-type');
        res.setHeader('Content-Type', contentType || 'image/png');
        const { pipeline } = await import('stream/promises');
        await pipeline(imageResponse.body, res);
      } else {
        throw new ErrorManager({
          type: 'BAD_GATEWAY',
          message: 'Failed to fetch background image',
        });
      }
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async getLogoImage(res: Response): Promise<void> {
    try {
      const setting = await this.settingsRepository.findOne({ where: {} });

      if (!setting?.logo_url) {
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: 'Logo URL not found in settings',
        });
      }

      const imageResponse = await fetch(setting.logo_url);

      if (imageResponse.ok && imageResponse.body) {
        const contentType = imageResponse.headers.get('content-type');
        res.setHeader('Content-Type', contentType || 'image/png');
        const { pipeline } = await import('stream/promises');
        await pipeline(imageResponse.body, res);
      } else {
        throw new ErrorManager({
          type: 'BAD_GATEWAY',
          message: 'Failed to fetch logo',
        });
      }
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async getGlobalNoticeImage(res: Response): Promise<void> {
    try {
      const setting = await this.settingsRepository.findOne({ where: {} });

      if (!setting?.global_notice_image_url) {
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: 'Global notice image URL not found in settings',
        });
      }

      const imageResponse = await fetch(setting.global_notice_image_url);

      if (imageResponse.ok && imageResponse.body) {
        const contentType = imageResponse.headers.get('content-type');
        res.setHeader('Content-Type', contentType || 'image/png');
        const { pipeline } = await import('stream/promises');
        await pipeline(imageResponse.body, res);
      } else {
        throw new ErrorManager({
          type: 'BAD_GATEWAY',
          message: 'Failed to fetch global notice image',
        });
      }
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }
}
