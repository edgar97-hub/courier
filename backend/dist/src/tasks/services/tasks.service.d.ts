import { ProjectsService } from 'src/projects/services/projects.service';
import { Repository } from 'typeorm';
import { TasksDTO } from '../dto/tasks.dto';
import { TasksEntity } from '../entities/tasks.entity';
export declare class TasksService {
    private readonly taskRepository;
    private readonly projectService;
    constructor(taskRepository: Repository<TasksEntity>, projectService: ProjectsService);
    createTask(body: TasksDTO, projectId: string): Promise<TasksEntity>;
}
