import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Route } from './route.entity';
import { OrdersEntity } from '../../orders/entities/orders.entity';

export enum StopStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  SKIPPED = 'SKIPPED',
}

@Entity('stops')
export class Stop {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sequenceOrder: number;

  @Column()
  plannedStartTime: string;

  @Column()
  plannedEndTime: string;

  @Column()
  address: string;

  @Column({
    type: 'enum',
    enum: StopStatus,
    default: StopStatus.PENDING,
  })
  status: StopStatus;

  @Column()
  routeId: number;

  @ManyToOne(() => Route, (route) => route.stops)
  @JoinColumn({ name: 'route_id' })
  route: Route;

  @Column()
  orderCode: string;

  @ManyToOne(() => OrdersEntity)
  @JoinColumn({ name: 'order_code', referencedColumnName: 'code' })
  order: OrdersEntity;
}
