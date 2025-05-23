import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../config/base.entity';

@Entity({ name: 'settings' })
export class SettingsEntity extends BaseEntity {
  @Column()
  business_name: string;

  @Column()
  address: string;

  @Column()
  phone_number: string;

  @Column({ nullable: false, default: '' })
  logo_url: string;

  @Column({ nullable: false, default: '' })
  terms_conditions_url: string;

  @Column({ nullable: false, default: '' })
  background_image_url: string;

  @Column({ nullable: false, default: '' })
  rates_image_url: string;

  @Column({ default: '' })
  excel_import_template_url: string;

  @Column({ default: '' })
  coverage_map_url: string;

  //   @Column({
  //     type: 'jsonb',
  //     array: false,
  //     default: () => "'[]'",
  //     nullable: false,
  //   })
  //   public usstandard_measurementsers!: Array<{ id: string }>;
  // @Column('simple-json', { nullable: true })
  // usstandard_measurementsers: {
  //   width: string;
  //   height: string;
  //   length: string;
  //   weight: string;
  // };

  // @Column('simple-json', { nullable: true })
  // maximum_measurements: {
  //   width: string;
  //   height: string;
  //   length: string;
  //   weight: string;
  // };

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
}
