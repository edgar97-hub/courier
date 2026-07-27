import { Column, Entity, Generated, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../config/base.entity';
import { FulfillmentProductEntity } from './fulfillment-product.entity';
import { InventoryEntity } from './inventory.entity';

@Entity({ name: 'product_variations' })
export class ProductVariationEntity extends BaseEntity {
  @Column({ unique: true })
  @Generated('increment')
  code: number;

  @Column({ length: 100, unique: true })
  sku: string;

  @Column({ length: 100, nullable: true })
  color: string;

  @Column({ length: 100, nullable: true })
  size: string;

  @Column({ length: 255, nullable: true })
  model: string;

  @Column({ type: 'float', default: 0 })
  length_cm: number;

  @Column({ type: 'float', default: 0 })
  width_cm: number;

  @Column({ type: 'float', default: 0 })
  height_cm: number;

  @Column({ type: 'float', default: 0 })
  weight_kg: number;

  @Column({ type: 'int', default: 5 })
  min_stock: number;

  @OneToMany(() => InventoryEntity, (inventory) => inventory.variation)
  inventory: InventoryEntity[];

  @ManyToOne(
    () => FulfillmentProductEntity,
    (product) => product.variations,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'product_id' })
  product: FulfillmentProductEntity;

  @Column()
  product_id: string;
}
