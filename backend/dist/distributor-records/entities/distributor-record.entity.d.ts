import { BaseEntity } from '../../config/base.entity';
import { UsersEntity } from 'src/users/entities/users.entity';
export declare class DistributorRecordEntity extends BaseEntity {
    code: number;
    clientName: string;
    clientDni: string;
    clientPhone: string;
    destinationAddress: string;
    observation: string;
    user: UsersEntity;
}
