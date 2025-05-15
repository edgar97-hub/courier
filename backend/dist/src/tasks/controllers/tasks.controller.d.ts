import { TasksDTO } from '../dto/tasks.dto';
import { TasksService } from '../services/tasks.service';
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
    createTask(body: TasksDTO, projectId: string): Promise<import("../entities/tasks.entity").TasksEntity>;
}
