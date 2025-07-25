import {
  Column,
  Entity,
  Generated,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '../../config/base.entity';
import { UsersEntity } from 'src/users/entities/users.entity';
import { OrdersEntity } from 'src/orders/entities/orders.entity';

export enum TYPES_MOVEMENTS {
  INCOME = 'INGRESO',
  OUTCOME = 'EGRESO',
}

@Entity({ name: 'cash_management' })
export class CashManagementEntity extends BaseEntity {
  @Column({ unique: true })
  @Generated('increment')
  code: number;

  @Column({ nullable: true, type: 'date' })
  date?: string;

  @Column({ nullable: false, type: 'float', default: 0.0 })
  amount: number;

  @Column({
    type: 'enum',
    enum: TYPES_MOVEMENTS,
    unique: false,
    default: TYPES_MOVEMENTS.INCOME,
  })
  typeMovement: TYPES_MOVEMENTS;

  @Column({ nullable: true, default: '' })
  paymentsMethod?: string;

  @Column({ nullable: true, default: '' })
  description?: string;

  @ManyToOne(() => UsersEntity, (user) => user.cashManagementIncludes)
  @JoinColumn({ name: 'user_id' })
  user: UsersEntity;

  @ManyToOne(() => OrdersEntity, (order) => order.cashManagementIncludes)
  @JoinColumn({ name: 'order_id' })
  order: OrdersEntity;
}
