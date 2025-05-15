import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../config/base.entity';

@Entity({ name: 'districts' })
export class DistrictsEntity extends BaseEntity {
  @Column()
  name: string;

  @Column()
  price: string;
}
