import { ProjectDTO, ProjectUpdateDTO } from '../dto/projects.dto';
import { ProjectsService } from '../services/projects.service';
export declare class ProjectsController {
    private readonly projectService;
    constructor(projectService: ProjectsService);
    createProject(body: ProjectDTO, userId: string): Promise<any>;
    findAllProjects(): Promise<import("../entities/projects.entity").ProjectsEntity[]>;
    findProjectById(id: string): Promise<import("../entities/projects.entity").ProjectsEntity>;
    listApi(): Promise<any>;
    updateProject(id: string, body: ProjectUpdateDTO): Promise<import("typeorm").UpdateResult | undefined>;
    deleteProject(id: string): Promise<import("typeorm").DeleteResult | undefined>;
}
