import {
  Column,
  Entity,
  Generated,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '../../config/base.entity';
import { UsersEntity } from '../../users/entities/users.entity';
import { ProductVariationEntity } from './product-variation.entity';

@Entity({ name: 'fulfillment_products' })
export class FulfillmentProductEntity extends BaseEntity {
  @Column({ unique: true })
  @Generated('increment')
  code: number;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => UsersEntity)
  @JoinColumn({ name: 'company_id' })
  company: UsersEntity;

  @Column()
  company_id: string;

  @OneToMany(() => ProductVariationEntity, (variation) => variation.product, {
    cascade: true,
  })
  variations: ProductVariationEntity[];
}
