import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../config/base.entity';
import { OrdersEntity } from './orders.entity';

export enum PackageType {
  STANDARD = 'STANDARD',
  CUSTOM = 'CUSTOM',
}

@Entity({ name: 'order_items' })
export class OrderItemEntity extends BaseEntity {
  @Column({
    type: 'enum',
    enum: PackageType,
    default: PackageType.CUSTOM,
    comment: 'Identifica si el paquete es de tamaño estándar o personalizado',
  })
  package_type: PackageType;

  @Column({
    nullable: true,
    comment: 'Descripción específica del paquete (ej. "Caja de Zapatos")',
  })
  description: string;

  @Column({ type: 'float' })
  width_cm: number;

  @Column({ type: 'float' })
  length_cm: number;

  @Column({ type: 'float' })
  height_cm: number;

  @Column({ type: 'float' })
  weight_kg: number;

  @Column({
    name: 'base_price',
    type: 'float',
    comment: 'Costo del paquete sin descuentos, calculado por tarifa',
  })
  basePrice: number;

  @Column({
    name: 'final_price',
    type: 'float',
    comment: 'Costo final del paquete tras aplicar descuentos',
  })
  finalPrice: number;

  @Column({
    name: 'is_principal',
    type: 'boolean',
    default: false,
    comment: 'Indica si este es el paquete principal (el más caro)',
  })
  isPrincipal: boolean;

  @ManyToOne(() => OrdersEntity, (order) => order.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  order: OrdersEntity;
}
