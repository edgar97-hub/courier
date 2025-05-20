import { ROLES } from '../../constants/roles';
import { IUser } from '../../interfaces/user.interface';
import { BaseEntity } from '../../config/base.entity';
import { UsersProjectsEntity } from './usersProjects.entity';
export declare class UsersEntity extends BaseEntity implements IUser {
    code: number;
    email: string;
    username: string;
    password: string;
    role: ROLES;
    projectsIncludes: UsersProjectsEntity[];
}
