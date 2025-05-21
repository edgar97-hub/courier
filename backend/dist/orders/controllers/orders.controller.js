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
exports.OrdersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const admin_decorator_1 = require("../../auth/decorators/admin.decorator");
const access_level_guard_1 = require("../../auth/guards/access-level.guard");
const auth_guard_1 = require("../../auth/guards/auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const order_dto_1 = require("../dto/order.dto");
const orders_service_1 = require("../services/orders.service");
let OrdersController = class OrdersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    async register(body) {
        return await this.usersService.createUser(body);
    }
    async batchCreateOrders(body) {
        return await this.usersService.batchCreateOrders(body);
    }
    async findAllUsers(pageNumber = 1, pageSize = 10, sortField = 'created_at', sortDirection = 'desc', startDate, endDate) {
        const queryParams = {
            pageNumber,
            pageSize,
            sortField,
            sortDirection,
            startDate,
            endDate,
        };
        return await this.usersService.findUsers(queryParams);
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
exports.OrdersController = OrdersController;
__decorate([
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [order_dto_1.OrderDTO]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('batch-create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "batchCreateOrders", null);
__decorate([
    (0, common_1.Get)(''),
    __param(0, (0, common_1.Query)('page_number')),
    __param(1, (0, common_1.Query)('page_size')),
    __param(2, (0, common_1.Query)('sort_field')),
    __param(3, (0, common_1.Query)('sort_direction')),
    __param(4, (0, common_1.Query)('start_date')),
    __param(5, (0, common_1.Query)('end_date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, String, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "findAllUsers", null);
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
], OrdersController.prototype, "findUserById", null);
__decorate([
    (0, swagger_1.ApiParam)({
        name: 'id',
    }),
    (0, admin_decorator_1.AdminAccess)(),
    (0, common_1.Put)('edit/:id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, order_dto_1.OrderUpdateDTO]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "updateUser", null);
__decorate([
    (0, swagger_1.ApiParam)({
        name: 'id',
    }),
    (0, admin_decorator_1.AdminAccess)(),
    (0, common_1.Delete)('delete/:id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "deleteUser", null);
exports.OrdersController = OrdersController = __decorate([
    (0, swagger_1.ApiTags)('Orders'),
    (0, common_1.Controller)('orders'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard, access_level_guard_1.AccessLevelGuard),
    __metadata("design:paramtypes", [orders_service_1.OrdersService])
], OrdersController);
//# sourceMappingURL=orders.controller.js.map