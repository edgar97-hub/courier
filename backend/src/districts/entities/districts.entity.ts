import { Column, Entity, Generated, OneToMany } from 'typeorm';
import { BaseEntity } from '../../config/base.entity';

@Entity({ name: 'districts' })
export class DistrictsEntity extends BaseEntity {
  @Column({ unique: true })
  @Generated('increment')
  code: number;

  @Column()
  name: string;

  @Column({ nullable: false, type: 'float', default: 0.0 })
  weight_from!: number;

  @Column({ nullable: false, type: 'float', default: 0.0 })
  weight_to!: number;

  @Column({ nullable: false, type: 'float', default: 0.0 })
  price!: number;

  @Column({ type: 'bool', default: false })
  isStandard: boolean;
}
