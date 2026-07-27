import { Column, Entity, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../config/base.entity';
import { WarehouseEntity } from './warehouse.entity';
import { ProductVariationEntity } from './product-variation.entity';

@Entity({ name: 'inventory' })
@Unique(['warehouse_id', 'variation_id'])
export class InventoryEntity extends BaseEntity {
  @Column({ type: 'int', default: 0 })
  stock: number;

  @ManyToOne(() => WarehouseEntity, (warehouse) => warehouse.inventory, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: WarehouseEntity;

  @Column()
  warehouse_id: string;

  @ManyToOne(
    () => ProductVariationEntity,
    (variation) => variation.inventory,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'variation_id' })
  variation: ProductVariationEntity;

  @Column()
  variation_id: string;
}
