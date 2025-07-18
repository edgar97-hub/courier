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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const admin_decorator_1 = require("../../auth/decorators/admin.decorator");
const access_level_guard_1 = require("../../auth/guards/access-level.guard");
const auth_guard_1 = require("../../auth/guards/auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const user_dto_1 = require("../dto/user.dto");
const users_service_1 = require("../services/users.service");
const public_decorator_1 = require("../../auth/decorators/public.decorator");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
let UsersController = class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    async registerUser(body) {
        return await this.usersService.createUser(body);
    }
    async registerCompany(body) {
        return await this.usersService.registerCompany(body);
    }
    async findAllUsers() {
        return await this.usersService.findUsers();
    }
    async findUsersByRol(search_term, role) {
        const queryParams = {
            search_term,
            role,
        };
        return await this.usersService.findUsersByRol(queryParams);
    }
    async findUserById(id) {
        return await this.usersService.findUserById(id);
    }
    async findUserPerfil(req) {
        console.log('idUser', req.idUser);
        return await this.usersService.findUserPerfil(req.idUser);
    }
    async updateUser(id, body) {
        return await this.usersService.updateUser(body, id);
    }
    async updateUserCompany(id, body) {
        return await this.usersService.updateUserCompany(body, id);
    }
    async updateProfile(id, body) {
        return await this.usersService.updateProfile(body, id);
    }
    async deleteUser(id) {
        return await this.usersService.deleteUser(id);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, admin_decorator_1.AdminAccess)(),
    (0, roles_decorator_1.Roles)('RECEPTIONIST'),
    (0, admin_decorator_1.AdminAccess)(),
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_dto_1.UserDTO]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "registerUser", null);
__decorate([
    (0, public_decorator_1.PublicAccess)(),
    (0, common_1.Post)('register-company'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_dto_1.RegistrationUserCompanyDTO]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "registerCompany", null);
__decorate([
    (0, common_1.Get)('all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findAllUsers", null);
__decorate([
    (0, common_1.Get)('filtered'),
    __param(0, (0, common_1.Query)('search_term')),
    __param(1, (0, common_1.Query)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findUsersByRol", null);
__decorate([
    (0, swagger_1.ApiParam)({
        name: 'id',
    }),
    (0, swagger_1.ApiHeader)({
        name: 'codrr_token',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'No se encontro resultado',
    }),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findUserById", null);
__decorate([
    (0, common_1.Get)('/perfil/me'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findUserPerfil", null);
__decorate([
    (0, swagger_1.ApiParam)({
        name: 'id',
    }),
    (0, admin_decorator_1.AdminAccess)(),
    (0, roles_decorator_1.Roles)('RECEPTIONIST'),
    (0, common_1.Put)('edit/:id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_dto_1.UserUpdateDTO]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateUser", null);
__decorate([
    (0, swagger_1.ApiParam)({
        name: 'id',
    }),
    (0, common_1.Put)('edit-user-company/:id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_dto_1.UserCompanyUpdateDTO]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateUserCompany", null);
__decorate([
    (0, swagger_1.ApiParam)({
        name: 'id',
    }),
    (0, common_1.Put)('update-profile/:id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_dto_1.UserProfile]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateProfile", null);
__decorate([
    (0, swagger_1.ApiParam)({
        name: 'id',
    }),
    (0, common_1.Delete)('delete/:id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deleteUser", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('Users'),
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard, access_level_guard_1.AccessLevelGuard),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map