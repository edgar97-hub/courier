import { Column, Entity, Generated, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { ROLES } from '../../constants/roles';
import { IUser } from '../../interfaces/user.interface';
import { BaseEntity } from '../../config/base.entity';
import { OrdersEntity } from '../../orders/entities/orders.entity';

@Entity({ name: 'users' })
export class UsersEntity extends BaseEntity implements IUser {
  @Column({ unique: true })
  @Generated('increment')
  code: number;

  @Column({ unique: true })
  email: string;

  @Column()
  username: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ default: '' })
  photo_url: string;

  @Column({ default: '' })
  business_type: string;

  @Column({ default: '' })
  business_name: string;

  @Column({ default: '' })
  business_district: string;

  @Column({ default: '' })
  business_address: string;

  @Column({ default: '' })
  business_phone_number: string;

  @Column({ default: '' })
  business_sector: string;

  @Column({ default: '' })
  business_document_type: string;

  @Column({ default: '' })
  business_email: string;

  @Column({ type: 'bool', default: false })
  assumes_5_percent_pos: boolean;

  @Column({ default: '' })
  business_document_number: string;

  @Column({ default: '' })
  owner_name: string;

  @Column({ default: '' })
  owner_phone_number: string;

  @Column({ default: '' })
  owner_document_type: string;

  @Column({ default: '' })
  owner_document_number: string;

  @Column({ default: '' })
  owner_email_address: string;

  @Column({ default: '' })
  owner_bank_account: string;

  @Column({ default: '' })
  name_account_number_owner: string;

  @Column({ type: 'enum', enum: ROLES, unique: false })
  role: ROLES;

  @OneToMany(() => OrdersEntity, (order) => order.user)
  ordersIncludes: OrdersEntity[];

  @OneToMany(() => OrdersEntity, (order) => order.assigned_driver)
  assignedDriversIncludes: OrdersEntity[];

  @OneToMany(() => OrdersEntity, (order) => order.company)
  companyOrdersIncludes: OrdersEntity[];
}
