import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../config/base.entity';
import { UsersEntity } from '../../users/entities/users.entity';
import { FulfillmentProductEntity } from './fulfillment-product.entity';
import { ProductVariationEntity } from './product-variation.entity';
import { WarehouseEntity } from './warehouse.entity';

export enum KARDEX_MOVEMENT_TYPE {
  INBOUND = 'INBOUND',
  ORDER_OUT = 'ORDER_OUT',
  MANUAL_ADD = 'MANUAL_ADD',
  MANUAL_SUBTRACT = 'MANUAL_SUBTRACT',
  ANNUL_REVERSAL = 'ANNUL_REVERSAL',
}

@Entity({ name: 'kardex' })
export class KardexEntity extends BaseEntity {
  @Column({
    type: 'enum',
    enum: KARDEX_MOVEMENT_TYPE,
  })
  movement_type: KARDEX_MOVEMENT_TYPE;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'int' })
  stock_before: number;

  @Column({ type: 'int' })
  stock_after: number;

  @Column({ type: 'text', nullable: true })
  observation: string;

  @ManyToOne(() => UsersEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'responsible_user_id' })
  responsibleUser: UsersEntity;

  @Column({ nullable: true })
  responsible_user_id: string;

  @Column({ type: 'varchar', nullable: true })
  reference_id: string;

  @Column({ type: 'varchar', nullable: true })
  reference_type: string;

  @ManyToOne(() => UsersEntity, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'company_id' })
  company: UsersEntity;

  @Column({ nullable: true })
  company_id: string;

  @ManyToOne(() => FulfillmentProductEntity, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'product_id' })
  product: FulfillmentProductEntity;

  @Column({ nullable: true })
  product_id: string;

  @ManyToOne(() => ProductVariationEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'variation_id' })
  variation: ProductVariationEntity;

  @Column()
  variation_id: string;

  @ManyToOne(() => WarehouseEntity, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: WarehouseEntity;

  @Column({ nullable: true })
  warehouse_id: string;
}
