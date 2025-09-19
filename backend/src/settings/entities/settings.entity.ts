import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../config/base.entity';
export interface PromotionalSetItem {
  id: string; // Para identificar cada set, ej. un UUID generado en el frontend
  imageUrl: string | null;
  linkUrl: string | null;
  buttonText: string | null;
  isActive?: boolean; // Opcional: para activar/desactivar un set
  order?: number; // Opcional: para el orden de visualización
}

@Entity({ name: 'settings' })
export class SettingsEntity extends BaseEntity {
  @Column()
  business_name: string;

  @Column({ default: '' })
  ruc: string;

  @Column({ default: '' })
  address: string;

  @Column({ default: '' })
  phone_number: string;

  @Column({ default: '' })
  logo_url: string;

  @Column({ default: '' })
  terms_conditions_url: string;

  @Column({ default: '' })
  background_image_url: string;

  @Column({ default: '' })
  rates_image_url: string;

  @Column({ default: '' })
  excel_import_template_url: string;

  @Column({ default: '' })
  coverage_map_url: string;

  @Column({ default: '' })
  global_notice_image_url: string;

  @Column({
    type: 'jsonb',
    nullable: true,
    default: () => "'[]'",
  })
  promotional_sets: PromotionalSetItem[];

  @Column({ nullable: false, type: 'float', default: 0.0 })
  standard_measurements_width: number;

  @Column({ nullable: false, type: 'float', default: 0.0 })
  standard_measurements_height: number;

  @Column({ nullable: false, type: 'float', default: 0.0 })
  standard_measurements_length: number;

  @Column({ nullable: false, type: 'float', default: 0.0 })
  standard_measurements_weight: number;

  @Column({ nullable: false, type: 'float', default: 0.0 })
  maximum_measurements_width: number;

  @Column({ nullable: false, type: 'float', default: 0.0 })
  maximum_measurements_height: number;

  @Column({ nullable: false, type: 'float', default: 0.0 })
  maximum_measurements_length: number;

  @Column({ nullable: false, type: 'float', default: 0.0 })
  maximum_measurements_weight: number;

  @Column({ nullable: false, type: 'float', default: 0.0 })
  volumetric_factor: number;

  @Column({ nullable: true })
  googleMapsApiKey: string;
}
