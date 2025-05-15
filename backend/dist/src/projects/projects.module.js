"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsModule = void 0;
const common_1 = require("@nestjs/common");
const projects_service_1 = require("./services/projects.service");
const projects_controller_1 = require("./controllers/projects.controller");
const typeorm_1 = require("@nestjs/typeorm");
const projects_entity_1 = require("./entities/projects.entity");
const usersProjects_entity_1 = require("../users/entities/usersProjects.entity");
const users_service_1 = require("../users/services/users.service");
const providers_module_1 = require("../providers/providers.module");
const http_service_1 = require("../providers/http/http.service");
let ProjectsModule = class ProjectsModule {
};
exports.ProjectsModule = ProjectsModule;
exports.ProjectsModule = ProjectsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([projects_entity_1.ProjectsEntity, usersProjects_entity_1.UsersProjectsEntity]),
            providers_module_1.ProvidersModule,
        ],
        providers: [projects_service_1.ProjectsService, users_service_1.UsersService, http_service_1.HttpCustomService],
        controllers: [projects_controller_1.ProjectsController],
    })
], ProjectsModule);
//# sourceMappingURL=projects.module.js.map