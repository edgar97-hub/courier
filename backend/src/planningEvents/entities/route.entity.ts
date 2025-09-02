import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { PlanningEvent } from './planning-event.entity';
import { Stop } from './stop.entity';
import { UsersEntity } from 'src/users/entities/users.entity';

@Entity('routes')
export class Route {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  routeIdExternal: string;

  @Column({ nullable: true })
  driverCode: string;

  @Column({ nullable: true })
  vehicle: string;

  @Column({ nullable: true })
  startingPoint: string;

  @Column({ nullable: true })
  completionPoint: string;

  @Column()
  planningEventId: number;

  @ManyToOne(() => PlanningEvent, (planningEvent) => planningEvent.routes)
  @JoinColumn({ name: 'planning_event_id' })
  planningEvent: PlanningEvent;

  @OneToMany(() => Stop, (stop) => stop.route)
  stops: Stop[];
}
