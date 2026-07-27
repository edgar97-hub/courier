import { Column, Entity, Generated, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../config/base.entity';
import { UsersEntity } from '../../users/entities/users.entity';
import { FulfillmentProductEntity } from './fulfillment-product.entity';
import { ProductVariationEntity } from './product-variation.entity';
import { WarehouseEntity } from './warehouse.entity';

export enum ADJUSTMENT_TYPE {
  INBOUND = 'INBOUND',
  MANUAL_ADD = 'MANUAL_ADD',
  MANUAL_SUBTRACT = 'MANUAL_SUBTRACT',
}

export enum ADJUSTMENT_STATUS {
  REGISTERED = 'REGISTERED',
  ANNULLED = 'ANNULLED',
}

@Entity({ name: 'stock_adjustments' })
export class StockAdjustmentEntity extends BaseEntity {
  @Column({ unique: true })
  @Generated('increment')
  code: number;

  @Column({
    type: 'enum',
    enum: ADJUSTMENT_TYPE,
    default: ADJUSTMENT_TYPE.INBOUND,
  })
  adjustment_type: ADJUSTMENT_TYPE;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'text' })
  observation: string;

  @Column({
    type: 'enum',
    enum: ADJUSTMENT_STATUS,
    default: ADJUSTMENT_STATUS.REGISTERED,
  })
  status: ADJUSTMENT_STATUS;

  @ManyToOne(() => UsersEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: UsersEntity;

  @Column()
  company_id: string;

  @ManyToOne(() => FulfillmentProductEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: FulfillmentProductEntity;

  @Column()
  product_id: string;

  @ManyToOne(() => ProductVariationEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'variation_id' })
  variation: ProductVariationEntity;

  @Column()
  variation_id: string;

  @ManyToOne(() => WarehouseEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: WarehouseEntity;

  @Column()
  warehouse_id: string;
}
