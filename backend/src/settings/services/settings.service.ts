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

/**
 * Service for managing application settings.
 * Handles CRUD operations, file uploads, and retrieval of settings data.
 */
@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(SettingsEntity)
    private readonly settingsRepository: Repository<SettingsEntity>,
  ) {}

  /**
   * Create a new settings entry.
   * @param body - Settings data transfer object.
   * @returns The created settings entity.
   * @throws ErrorManager if creation fails.
   */
  public async createSettings(body: SettingDTO): Promise<SettingsEntity> {
    try {
      return await this.settingsRepository.save(body);
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  /**
   * Retrieve all settings entries.
   * @returns Array of settings entities.
   * @throws ErrorManager if retrieval fails.
   */
  public async findAllSettings(): Promise<SettingsEntity[]> {
    try {
      return await this.settingsRepository.find();
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  /**
   * Find settings by ID.
   * Note: Currently returns the first settings entry regardless of ID,
   * as there is typically only one settings record.
   * @param id - Settings UUID (unused in current implementation).
   * @returns The first settings entity or null if none exist.
   * @throws ErrorManager if retrieval fails.
   */
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

  /**
   * Find settings by a specific key-value pair.
   * @param key - Property name of SettingDTO.
   * @param value - Value to match.
   * @returns Matching settings entity.
   * @throws ErrorManager if query fails.
   */
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

  /**
   * Get active promotional sets sorted by order.
   * @returns Array of promotional set items, or empty array if none.
   */
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

  /**
   * Update settings by ID.
   * @param body - Updated settings data.
   * @param id - Settings UUID.
   * @returns The updated settings entity.
   * @throws ErrorManager if update fails or record not found.
   */
  public async updateSettings(
    body: SettingUpdateDTO,
    id: string,
  ): Promise<SettingsEntity> {
    try {
      if (body.promotional_sets !== undefined) {
        // Ensure each item has an ID if frontend doesn't generate it
        body.promotional_sets = body.promotional_sets.map((set) => ({
          ...set,
          id: set.id || Date.now().toString(),
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
        // This would be unusual if updateResult.affected > 0, but safeguard
        throw new ErrorManager({
          type: 'INTERNAL_SERVER_ERROR',
          message: 'Los ajustes fueron actualizados pero no se pudieron recuperar.',
        });
      }

      return updatedSettings;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  /**
   * Delete settings by ID.
   * @param id - Settings UUID.
   * @returns DeleteResult indicating affected rows.
   * @throws ErrorManager if deletion fails or record not found.
   */
  public async deleteSettings(id: string): Promise<DeleteResult> {
    try {
      const deleteResult: DeleteResult = await this.settingsRepository.delete(
        id,
      );
      if (deleteResult.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo borrar',
        });
      }
      return deleteResult;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  /**
   * Upload company logo.
   * @param logoFile - Uploaded logo file.
   * @param req - HTTP request object.
   * @returns Object containing the absolute URL of the uploaded logo.
   * @throws ErrorManager if file is missing or upload fails.
   */
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

  /**
   * Upload terms and conditions PDF.
   * @param termsPdfFile - Uploaded PDF file.
   * @param req - HTTP request object.
   * @returns Object containing the absolute URL of the uploaded PDF.
   * @throws ErrorManager if file is missing or upload fails.
   */
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

  /**
   * Upload a generic file.
   * @param file - Uploaded file.
   * @param req - HTTP request object.
   * @returns Object containing the absolute URL of the uploaded file.
   * @throws ErrorManager if file is missing or upload fails.
   */
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

  /**
   * Stream background image to response.
   * @param res - Express response object.
   * @throws ErrorManager if image not found or fetch fails.
   */
  public async getBackgroundImage(res: Response): Promise<void> {
    try {
      const setting = await this.settingsRepository.findOne({ where: {} });

      if (!setting?.background_image_url) {
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: 'Background image URL not found in settings',
        });
      }

      console.log(`Fetching background image from: ${setting.background_image_url}`);
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

  /**
   * Stream logo image to response.
   * @param res - Express response object.
   * @throws ErrorManager if image not found or fetch fails.
   */
  public async getLogoImage(res: Response): Promise<void> {
    try {
      const setting = await this.settingsRepository.findOne({ where: {} });

      if (!setting?.logo_url) {
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: 'Logo URL not found in settings',
        });
      }

      console.log(`Fetching logo from: ${setting.logo_url}`);
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

  /**
   * Stream global notice image to response.
   * @param res - Express response object.
   * @throws ErrorManager if image not found or fetch fails.
   */
  public async getGlobalNoticeImage(res: Response): Promise<void> {
    try {
      const setting = await this.settingsRepository.findOne({ where: {} });

      if (!setting?.global_notice_image_url) {
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: 'Global notice image URL not found in settings',
        });
      }

      console.log(`Fetching global notice image from: ${setting.global_notice_image_url}`);
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
