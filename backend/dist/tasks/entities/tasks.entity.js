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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksEntity = void 0;
const status_task_1 = require("../../constants/status-task");
const projects_entity_1 = require("../../projects/entities/projects.entity");
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../config/base.entity");
let TasksEntity = class TasksEntity extends base_entity_1.BaseEntity {
};
exports.TasksEntity = TasksEntity;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TasksEntity.prototype, "taskName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TasksEntity.prototype, "taskDescription", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: status_task_1.STATUS_TASK }),
    __metadata("design:type", String)
], TasksEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TasksEntity.prototype, "responsableName", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => projects_entity_1.ProjectsEntity, (project) => project.tasks),
    (0, typeorm_1.JoinColumn)({
        name: 'project_id',
    }),
    __metadata("design:type", projects_entity_1.ProjectsEntity)
], TasksEntity.prototype, "project", void 0);
exports.TasksEntity = TasksEntity = __decorate([
    (0, typeorm_1.Entity)({ name: 'task' })
], TasksEntity);
//# sourceMappingURL=tasks.entity.js.map