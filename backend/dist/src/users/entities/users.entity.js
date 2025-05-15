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
exports.UsersEntity = void 0;
const typeorm_1 = require("typeorm");
const class_transformer_1 = require("class-transformer");
const roles_1 = require("../../constants/roles");
const base_entity_1 = require("../../config/base.entity");
const usersProjects_entity_1 = require("./usersProjects.entity");
let UsersEntity = class UsersEntity extends base_entity_1.BaseEntity {
};
exports.UsersEntity = UsersEntity;
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], UsersEntity.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], UsersEntity.prototype, "username", void 0);
__decorate([
    (0, class_transformer_1.Exclude)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UsersEntity.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: roles_1.ROLES, unique: false }),
    __metadata("design:type", String)
], UsersEntity.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => usersProjects_entity_1.UsersProjectsEntity, (usersProjects) => usersProjects.user),
    __metadata("design:type", Array)
], UsersEntity.prototype, "projectsIncludes", void 0);
exports.UsersEntity = UsersEntity = __decorate([
    (0, typeorm_1.Entity)({ name: 'users' })
], UsersEntity);
//# sourceMappingURL=users.entity.js.map