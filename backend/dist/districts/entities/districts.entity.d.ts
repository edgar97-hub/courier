import { BaseEntity } from '../../config/base.entity';
export declare class DistrictsEntity extends BaseEntity {
    code: number;
    name: string;
    weight_from: number;
    weight_to: number;
    price: number;
    isStandard: boolean;
}
