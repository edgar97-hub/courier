import { Column, Entity, Generated, OneToMany, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../config/base.entity';
import { UsersEntity } from '../../users/entities/users.entity';
import { STATES } from '../../constants/roles';

@Entity({ name: 'orders' })
export class OrdersEntity extends BaseEntity {
  @Column({ unique: true })
  @Generated('increment')
  code?: number;

  @Column()
  shipment_type?: string;

  @Column()
  recipient_name?: string;

  @Column()
  recipient_phone?: string;

  @Column()
  delivery_district_name?: string;

  @Column()
  delivery_address?: string;

  @Column({ nullable: true })
  delivery_coordinates?: string;

  @Column()
  delivery_date?: string;

  @Column({ nullable: true })
  package_size_type?: string;

  @Column({ nullable: false, type: 'float', default: 0.0 })
  package_width_cm?: number;

  @Column({ nullable: false, type: 'float', default: 0.0 })
  package_length_cm?: number;

  @Column({ nullable: false, type: 'float', default: 0.0 })
  package_height_cm?: number;

  @Column({ nullable: false, type: 'float', default: 0.0 })
  package_weight_kg?: number;

  @Column({ nullable: false, type: 'float', default: 0.0 })
  shipping_cost?: number;

  @Column()
  item_description?: string;

  @Column({ nullable: true, type: 'float', default: 0.0 })
  amount_to_collect_at_delivery?: number;

  @Column({ nullable: true, default: '' })
  payment_method_for_collection?: string;

  @Column({ nullable: true, default: '' })
  observations?: string;

  @Column({ nullable: true, default: '' })
  type_order_transfer_to_warehouse?: string;

  @Column({
    type: 'enum',
    enum: STATES,
    unique: false,
    default: STATES.REGISTERED,
  })
  status: STATES;

  @ManyToOne(() => UsersEntity, (user) => user.ordersIncludes)
  user: UsersEntity;
}
