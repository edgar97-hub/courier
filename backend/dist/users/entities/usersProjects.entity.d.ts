import { BaseEntity } from '../../config/base.entity';
import { ACCESS_LEVEL } from '../../constants/roles';
import { UsersEntity } from './users.entity';
import { ProjectsEntity } from '../../projects/entities/projects.entity';
export declare class UsersProjectsEntity extends BaseEntity {
    accessLevel: ACCESS_LEVEL;
    user: UsersEntity;
    project: ProjectsEntity;
}
