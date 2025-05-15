import { STATUS_TASK } from 'src/constants/status-task';
import { ProjectDTO } from 'src/projects/dto/projects.dto';
export declare class TasksDTO {
    taskName: string;
    taskDescription: string;
    status: STATUS_TASK;
    responsableName: string;
    project?: ProjectDTO;
}
