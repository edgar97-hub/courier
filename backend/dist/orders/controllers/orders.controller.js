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
const public_decorator_1 = require("../../auth/decorators/public.decorator");
const access_level_guard_1 = require("../../auth/guards/access-level.guard");
const auth_guard_1 = require("../../auth/guards/auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const order_dto_1 = require("../dto/order.dto");
const orders_service_1 = require("../services/orders.service");
const order_pdf_generator_service_1 = require("../services/order-pdf-generator.service");
let OrdersController = class OrdersController {
    constructor(ordersService, orderPdfGeneratorService) {
        this.ordersService = ordersService;
        this.orderPdfGeneratorService = orderPdfGeneratorService;
    }
    async register(body) {
        return await this.ordersService.createOrder(body);
    }
    async batchCreateOrders(body, req) {
        return await this.ordersService.batchCreateOrders(body, req.idUser);
    }
    async importOrders(ordersData, req) {
        return await this.ordersService.importOrdersFromExcelData(ordersData, req.idUser);
    }
    async findAllOrders(req, pageNumber = 0, pageSize = 0, sortField = 'created_at', sortDirection = 'asc', startDate, endDate, status, search_term, delivery_date) {
        const queryParams = {
            pageNumber,
            pageSize,
            sortField,
            sortDirection,
            startDate,
            endDate,
            status,
            search_term,
            delivery_date,
        };
        return await this.ordersService.findOrders(queryParams, req);
    }
    async getFilteredOrders(req, pageNumber = 0, pageSize = 0, sortField = 'created_at', sortDirection = 'asc', startDate, endDate, status, search_term, delivery_date) {
        const queryParams = {
            pageNumber,
            pageSize,
            sortField,
            sortDirection,
            startDate,
            endDate,
            status,
            search_term,
            delivery_date,
        };
        return await this.ordersService.getFilteredOrders(queryParams, req);
    }
    async getOrderByTrackingCode(tracking_code = '') {
        const queryParams = {
            tracking_code,
        };
        return await this.ordersService.getOrderByTrackingCode(queryParams);
    }
    async findOrderById(id) {
        return await this.ordersService.findOrderById(id);
    }
    async updateOrder(id, body) {
        return await this.ordersService.updateOrder(body, id);
    }
    async updateOrderStatus(body, req) {
        return await this.ordersService.updateOrderStatus(body, req.idUser);
    }
    async assignDriverToOrder(id, body, req) {
        return await this.ordersService.assignDriverToOrder(body, id, req.idUser);
    }
    async rescheduleOrder(id, body, req) {
        return await this.ordersService.rescheduleOrder(body, id, req.idUser);
    }
    async deleteOrder(id) {
        return await this.ordersService.deleteOrder(id);
    }
    async getOrderPdfA4(orderId, req, res) {
        try {
            await this.orderPdfGeneratorService.streamOrderPdfToResponse(orderId, req, res);
        }
        catch (error) {
            console.error('Error in PDF streaming controller:', error);
            if (!res.headersSent) {
                if (error instanceof common_1.NotFoundException) {
                    res.status(404).send({ message: error.message });
                }
                else {
                    res.status(500).send({ message: 'Error generating PDF stream' });
                }
            }
        }
    }
    async getOrderPdfA4Landscape(orderId, req, res) {
        try {
            await this.orderPdfGeneratorService.streamOrderPdfLandscapeToResponse(orderId, req, res);
        }
        catch (error) {
            console.error('Error in PDF streaming controller:', error);
            if (!res.headersSent) {
                if (error instanceof common_1.NotFoundException) {
                    res.status(404).send({ message: error.message });
                }
                else {
                    res.status(500).send({ message: 'Error generating PDF stream' });
                }
            }
        }
    }
    async getOrderPdfTicket80mm(orderId, req, res) {
        try {
            await this.orderPdfGeneratorService.streamOrderPdf80mmToResponse(orderId, req, res);
        }
        catch (error) {
            console.error('Error in PDF streaming controller:', error);
            if (!res.headersSent) {
                if (error instanceof common_1.NotFoundException) {
                    res.status(404).send({ message: error.message });
                }
                else {
                    res.status(500).send({ message: 'Error generating PDF stream' });
                }
            }
        }
    }
    async getDashboardSummary(req) {
        return this.ordersService.dashboardOrders(req);
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
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "batchCreateOrders", null);
__decorate([
    (0, common_1.Post)('import-batch-json'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "importOrders", null);
__decorate([
    (0, common_1.Get)(''),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page_number')),
    __param(2, (0, common_1.Query)('page_size')),
    __param(3, (0, common_1.Query)('sort_field')),
    __param(4, (0, common_1.Query)('sort_direction')),
    __param(5, (0, common_1.Query)('start_date')),
    __param(6, (0, common_1.Query)('end_date')),
    __param(7, (0, common_1.Query)('status')),
    __param(8, (0, common_1.Query)('search_term')),
    __param(9, (0, common_1.Query)('delivery_date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "findAllOrders", null);
__decorate([
    (0, common_1.Get)('filtered-orders'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page_number')),
    __param(2, (0, common_1.Query)('page_size')),
    __param(3, (0, common_1.Query)('sort_field')),
    __param(4, (0, common_1.Query)('sort_direction')),
    __param(5, (0, common_1.Query)('start_date')),
    __param(6, (0, common_1.Query)('end_date')),
    __param(7, (0, common_1.Query)('status')),
    __param(8, (0, common_1.Query)('search_term')),
    __param(9, (0, common_1.Query)('delivery_date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getFilteredOrders", null);
__decorate([
    (0, public_decorator_1.PublicAccess)(),
    (0, common_1.Get)('tracking'),
    __param(0, (0, common_1.Query)('tracking_code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getOrderByTrackingCode", null);
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
], OrdersController.prototype, "findOrderById", null);
__decorate([
    (0, swagger_1.ApiParam)({
        name: 'id',
    }),
    (0, common_1.Put)('edit/:id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, order_dto_1.OrderUpdateDTO]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "updateOrder", null);
__decorate([
    (0, common_1.Post)('update-order-status'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "updateOrderStatus", null);
__decorate([
    (0, common_1.Put)('assign-driver-to-order/:id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "assignDriverToOrder", null);
__decorate([
    (0, common_1.Put)('reschedule-order/:id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "rescheduleOrder", null);
__decorate([
    (0, swagger_1.ApiParam)({
        name: 'id',
    }),
    (0, common_1.Delete)('delete/:id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "deleteOrder", null);
__decorate([
    (0, public_decorator_1.PublicAccess)(),
    (0, common_1.Get)(':id/pdf-a4'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getOrderPdfA4", null);
__decorate([
    (0, public_decorator_1.PublicAccess)(),
    (0, common_1.Get)(':id/pdf-a4-landscape'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getOrderPdfA4Landscape", null);
__decorate([
    (0, public_decorator_1.PublicAccess)(),
    (0, common_1.Get)(':id/pdf-ticket-80mm'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getOrderPdfTicket80mm", null);
__decorate([
    (0, common_1.Get)('dashboard/data'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getDashboardSummary", null);
exports.OrdersController = OrdersController = __decorate([
    (0, swagger_1.ApiTags)('Orders'),
    (0, common_1.Controller)('orders'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard, access_level_guard_1.AccessLevelGuard),
    __metadata("design:paramtypes", [orders_service_1.OrdersService,
        order_pdf_generator_service_1.OrderPdfGeneratorService])
], OrdersController);
//# sourceMappingURL=orders.controller.js.map