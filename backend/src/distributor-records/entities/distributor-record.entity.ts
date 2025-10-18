import { Column, Entity, Generated, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../config/base.entity';
import { UsersEntity } from 'src/users/entities/users.entity';

@Entity('distributor_records')
export class DistributorRecordEntity extends BaseEntity {
  @Column({ unique: true })
  @Generated('increment')
  code: number;

  @Column({ nullable: true })
  clientName: string;

  @Column({ nullable: true })
  clientDni: string;

  @Column({ nullable: true })
  clientPhone: string;

  @Column({ nullable: true })
  destinationAddress: string;

  @Column({ nullable: true, type: 'text' })
  observation: string;

  @ManyToOne(() => UsersEntity, (user) => user.distributorRecords)
  @JoinColumn({ name: 'user_id' })
  user: UsersEntity;
}
