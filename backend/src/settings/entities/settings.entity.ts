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

  @Column()
  logo_url: string;
}
