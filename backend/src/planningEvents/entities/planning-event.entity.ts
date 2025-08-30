import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Route } from '../../routes/entities/route.entity';

export enum PlanningEventStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity('planning_events')
export class PlanningEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  planningEventIdExternal: string;

  @Column({ type: 'date' })
  planningDate: Date;

  @Column({
    type: 'enum',
    enum: PlanningEventStatus,
    default: PlanningEventStatus.PENDING,
  })
  status: PlanningEventStatus;

  @OneToMany(() => Route, (route) => route.planningEvent)
  routes: Route[];
}