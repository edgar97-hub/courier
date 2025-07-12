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
exports.DistrictsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const admin_decorator_1 = require("../../auth/decorators/admin.decorator");
const auth_guard_1 = require("../../auth/guards/auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const district_dto_1 = require("../dto/district.dto");
const districts_service_1 = require("../services/districts.service");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
let DistrictsController = class DistrictsController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    async registerUser(body) {
        return await this.usersService.createUser(body);
    }
    async findAllUsers() {
        return await this.usersService.findUsers();
    }
    async findAllOrders(pageNumber = 0, pageSize = 0, sortField = 'updatedAt', sortDirection = 'desc', search = '') {
        const queryParams = {
            pageNumber,
            pageSize,
            sortField,
            sortDirection,
            search,
        };
        return await this.usersService.findDistricts(queryParams);
    }
    async findUsersByRol(search_term) {
        const queryParams = {
            search_term,
        };
        return await this.usersService.findDistricts2(queryParams);
    }
    async findUserById(id) {
        return await this.usersService.findUserById(id);
    }
    async updateUser(id, body) {
        return await this.usersService.updateUser(body, id);
    }
    async deleteUser(id) {
        return await this.usersService.deleteUser(id);
    }
};
exports.DistrictsController = DistrictsController;
__decorate([
    (0, admin_decorator_1.AdminAccess)(),
    (0, roles_decorator_1.Roles)('RECEPTIONIST'),
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [district_dto_1.DistrictDTO]),
    __metadata("design:returntype", Promise)
], DistrictsController.prototype, "registerUser", null);
__decorate([
    (0, common_1.Get)('all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DistrictsController.prototype, "findAllUsers", null);
__decorate([
    (0, common_1.Get)(''),
    __param(0, (0, common_1.Query)('page_number')),
    __param(1, (0, common_1.Query)('page_size')),
    __param(2, (0, common_1.Query)('sort_field')),
    __param(3, (0, common_1.Query)('sort_direction')),
    __param(4, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], DistrictsController.prototype, "findAllOrders", null);
__decorate([
    (0, common_1.Get)('filtered'),
    __param(0, (0, common_1.Query)('search_term')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DistrictsController.prototype, "findUsersByRol", null);
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
], DistrictsController.prototype, "findUserById", null);
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
    __metadata("design:paramtypes", [String, district_dto_1.DistrictUpdateDTO]),
    __metadata("design:returntype", Promise)
], DistrictsController.prototype, "updateUser", null);
__decorate([
    (0, swagger_1.ApiParam)({
        name: 'id',
    }),
    (0, admin_decorator_1.AdminAccess)(),
    (0, roles_decorator_1.Roles)('RECEPTIONIST'),
    (0, common_1.Delete)('delete/:id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DistrictsController.prototype, "deleteUser", null);
exports.DistrictsController = DistrictsController = __decorate([
    (0, swagger_1.ApiTags)('Districts'),
    (0, common_1.Controller)('districts'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [districts_service_1.DistrictsService])
], DistrictsController);
//# sourceMappingURL=districts.controller.js.map