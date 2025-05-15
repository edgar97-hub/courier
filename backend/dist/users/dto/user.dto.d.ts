import { ACCESS_LEVEL, ROLES } from 'src/constants/roles';
import { ProjectsEntity } from 'src/projects/entities/projects.entity';
import { UsersEntity } from '../entities/users.entity';
export declare class UserDTO {
    email: string;
    username: string;
    password: string;
    role: ROLES;
}
export declare class UserUpdateDTO {
    email: string;
    username: string;
    password: string;
    role: ROLES;
}
export declare class UserToProjectDTO {
    user: UsersEntity;
    project: ProjectsEntity;
    accessLevel: ACCESS_LEVEL;
}
