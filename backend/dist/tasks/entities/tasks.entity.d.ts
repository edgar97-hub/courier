import { STATUS_TASK } from '../../constants/status-task';
import { ProjectsEntity } from '../../projects/entities/projects.entity';
import { BaseEntity } from '../../config/base.entity';
export declare class TasksEntity extends BaseEntity {
    taskName: string;
    taskDescription: string;
    status: STATUS_TASK;
    responsableName: string;
    project: ProjectsEntity;
}
