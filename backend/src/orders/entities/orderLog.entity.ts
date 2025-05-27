import {
  Column,
  Entity,
  Generated,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../config/base.entity';
import { UsersEntity } from '../../users/entities/users.entity';
import { OrdersEntity } from './orders.entity';
export enum ORDER_LOG_ACTIONS {
  STATUS_CHANGE = 'STATUS_CHANGE',
  REPROGRAMMED = 'REPROGRAMMED',
  DRIVER_ASSIGNED = 'DRIVER_ASSIGNED',
  ADDRESS_UPDATED = 'ADDRESS_UPDATED',
  ORDER_CREATED = 'ORDER_CREATED',
  ORDER_CANCELED = 'ORDER_CANCELED',
}

@Entity({ name: 'order_logs' })
export class OrderLogEntity extends BaseEntity {
  @ManyToOne(() => OrdersEntity, (order) => order.logs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: OrdersEntity;

  @ManyToOne(() => UsersEntity, { nullable: true })
  @JoinColumn({ name: 'performed_by' })
  performedBy?: UsersEntity;

  @Column()
  action: string;

  @Column({ type: 'text', nullable: true })
  previousValue?: string;

  @Column({ type: 'text', nullable: true })
  newValue?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;
}
