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
exports.ProjectsEntity = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../config/base.entity");
const usersProjects_entity_1 = require("../../users/entities/usersProjects.entity");
const tasks_entity_1 = require("../../tasks/entities/tasks.entity");
let ProjectsEntity = class ProjectsEntity extends base_entity_1.BaseEntity {
};
exports.ProjectsEntity = ProjectsEntity;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ProjectsEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ProjectsEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => usersProjects_entity_1.UsersProjectsEntity, (usersProjects) => usersProjects.project),
    __metadata("design:type", Array)
], ProjectsEntity.prototype, "usersIncludes", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => tasks_entity_1.TasksEntity, (tasks) => tasks.project),
    __metadata("design:type", Array)
], ProjectsEntity.prototype, "tasks", void 0);
exports.ProjectsEntity = ProjectsEntity = __decorate([
    (0, typeorm_1.Entity)({ name: 'projects' })
], ProjectsEntity);
//# sourceMappingURL=projects.entity.js.map