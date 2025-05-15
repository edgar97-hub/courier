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
exports.AccessLevelGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const key_decorators_1 = require("../../constants/key-decorators");
const roles_1 = require("../../constants/roles");
const users_service_1 = require("../../users/services/users.service");
let AccessLevelGuard = class AccessLevelGuard {
    constructor(reflector, userService) {
        this.reflector = reflector;
        this.userService = userService;
    }
    async canActivate(context) {
        const isPublic = this.reflector.get(key_decorators_1.PUBLIC_KEY, context.getHandler());
        if (isPublic) {
            return true;
        }
        const roles = this.reflector.get(key_decorators_1.ROLES_KEY, context.getHandler());
        const accessLevel = this.reflector.get(key_decorators_1.ACCESS_LEVEL_KEY, context.getHandler());
        const admin = this.reflector.get(key_decorators_1.ADMIN_KEY, context.getHandler());
        const req = context.switchToHttp().getRequest();
        const { roleUser, idUser } = req;
        if (accessLevel === undefined) {
            if (roles === undefined) {
                if (!admin) {
                    return true;
                }
                else if (admin && roleUser === admin) {
                    return true;
                }
                else {
                    throw new common_1.UnauthorizedException('No tienes permisos para esta operacion');
                }
            }
        }
        if (roleUser === roles_1.ROLES.ADMIN) {
            return true;
        }
        const user = await this.userService.findUserById(idUser);
        const userExistInProject = user.projectsIncludes.find((project) => project.project.id === req.params.projectId);
        if (userExistInProject === undefined) {
            throw new common_1.UnauthorizedException('No formas parte del proyecto');
        }
        if (roles_1.ACCESS_LEVEL[accessLevel] > userExistInProject.accessLevel) {
            throw new common_1.UnauthorizedException('No tienes el nivel de acceso necesario');
        }
        return true;
    }
};
exports.AccessLevelGuard = AccessLevelGuard;
exports.AccessLevelGuard = AccessLevelGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        users_service_1.UsersService])
], AccessLevelGuard);
//# sourceMappingURL=access-level.guard.js.map