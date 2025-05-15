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
exports.TasksController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const access_level_decorator_1 = require("../../auth/decorators/access-level.decorator");
const access_level_guard_1 = require("../../auth/guards/access-level.guard");
const auth_guard_1 = require("../../auth/guards/auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const tasks_dto_1 = require("../dto/tasks.dto");
const tasks_service_1 = require("../services/tasks.service");
let TasksController = class TasksController {
    constructor(tasksService) {
        this.tasksService = tasksService;
    }
    async createTask(body, projectId) {
        return this.tasksService.createTask(body, projectId);
    }
};
exports.TasksController = TasksController;
__decorate([
    (0, swagger_1.ApiParam)({
        name: 'projectId',
    }),
    (0, access_level_decorator_1.AccessLevel)('DEVELOPER'),
    (0, common_1.Post)('create/:projectId'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [tasks_dto_1.TasksDTO, String]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "createTask", null);
exports.TasksController = TasksController = __decorate([
    (0, swagger_1.ApiTags)('Tasks'),
    (0, common_1.Controller)('tasks'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard, access_level_guard_1.AccessLevelGuard),
    __metadata("design:paramtypes", [tasks_service_1.TasksService])
], TasksController);
//# sourceMappingURL=tasks.controller.js.map