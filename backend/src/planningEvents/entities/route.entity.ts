import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  UpdateDateColumn, // Importar UpdateDateColumn
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
  vehicleStartTime: string;

  @Column({ nullable: true })
  vehicleEndTime: string;

  @Column({ nullable: true })
  startingPoint: string;

  @Column({ nullable: true })
  completionPoint: string;

  @Column({ nullable: true })
  latitudeStartPoint: string;

  @Column({ nullable: true })
  longitudeStartPoint: string;

  @Column({ nullable: true })
  latitudeEndPoint: string;

  @Column({ nullable: true })
  longitudeEndPoint: string;

  @Column()
  planningEventId: number;

  @ManyToOne(() => PlanningEvent, (planningEvent) => planningEvent.routes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'planning_event_id' })
  planningEvent: PlanningEvent;

  @OneToMany(() => Stop, (stop) => stop.route)
  stops: Stop[];

  @Column({ nullable: true })
  breakStart: string;

  @Column({ nullable: true })
  breakDuration: string;

  // --- NUEVAS COLUMNAS PARA SEGUIMIENTO EN TIEMPO REAL ---

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  currentLatitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  currentLongitude: number;

  @Column({ type: 'timestamptz', nullable: true })
  lastLocationUpdate: Date;
}
