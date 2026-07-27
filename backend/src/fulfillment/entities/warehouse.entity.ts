import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../config/base.entity';
import { InventoryEntity } from './inventory.entity';

@Entity({ name: 'warehouses' })
export class WarehouseEntity extends BaseEntity {
  @Column({ length: 100 })
  name: string;

  @Column({ length: 50, unique: true })
  code: string;

  @Column({ default: true })
  is_main: boolean;

  @OneToMany(() => InventoryEntity, (inventory) => inventory.warehouse)
  inventory: InventoryEntity[];
}
