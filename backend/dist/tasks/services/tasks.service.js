"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const projects_service_1 = require("../../projects/services/projects.service");
const error_manager_1 = require("../../utils/error.manager");
const typeorm_2 = require("typeorm");
const tasks_entity_1 = require("../entities/tasks.entity");
let TasksService = class TasksService {
    constructor(taskRepository, projectService) {
        this.taskRepository = taskRepository;
        this.projectService = projectService;
    }
    async createTask(body, projectId) {
        try {
            const project = await this.projectService.findProjectById(projectId);
            if (project === undefined) {
                throw new error_manager_1.ErrorManager({
                    type: 'NOT_FOUND',
                    message: 'No se ha encontrado el proyecto',
                });
            }
            return await this.taskRepository.save({
                ...body,
                project,
            });
        }
        catch (error) {
            throw error_manager_1.ErrorManager.createSignatureError(error.message);
        }
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tasks_entity_1.TasksEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        projects_service_1.ProjectsService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map