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
exports.UsersProjectsEntity = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../config/base.entity");
const roles_1 = require("../../constants/roles");
const users_entity_1 = require("./users.entity");
const projects_entity_1 = require("../../projects/entities/projects.entity");
let UsersProjectsEntity = class UsersProjectsEntity extends base_entity_1.BaseEntity {
};
exports.UsersProjectsEntity = UsersProjectsEntity;
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: roles_1.ACCESS_LEVEL }),
    __metadata("design:type", Number)
], UsersProjectsEntity.prototype, "accessLevel", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => users_entity_1.UsersEntity, (user) => user.projectsIncludes),
    __metadata("design:type", users_entity_1.UsersEntity)
], UsersProjectsEntity.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => projects_entity_1.ProjectsEntity, (project) => project.usersIncludes),
    __metadata("design:type", projects_entity_1.ProjectsEntity)
], UsersProjectsEntity.prototype, "project", void 0);
exports.UsersProjectsEntity = UsersProjectsEntity = __decorate([
    (0, typeorm_1.Entity)({ name: 'users_projects' })
], UsersProjectsEntity);
//# sourceMappingURL=usersProjects.entity.js.map