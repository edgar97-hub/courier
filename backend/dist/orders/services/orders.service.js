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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const error_manager_1 = require("../../utils/error.manager");
const typeorm_2 = require("typeorm");
const orders_entity_1 = require("../entities/orders.entity");
const districts_entity_1 = require("../../districts/entities/districts.entity");
const roles_1 = require("../../constants/roles");
const typeorm_3 = require("typeorm");
const EXCEL_HEADER_TO_ENTITY_KEY_MAP = {
    'TIPO DE ENVIO': 'shipment_type',
    'NOMBRE DEL DESTINATARIO': 'recipient_name',
    'TELEFONO DESTINATARIO 9 DIGITOS': 'recipient_phone',
    'DISTRITO (SELECCIONE SOLO DEL LISTADO)': 'delivery_district_name',
    'DIRECCION DE ENTREGA': 'delivery_address',
    'FECHA DE ENTREGA (DIA/MES/AÑO)': 'delivery_date',
    'DETALLE DEL PRODUCTO': 'item_description',
    'MONTO A COBRAR': 'amount_to_collect_at_delivery',
    'FORMA DE PAGO': 'payment_method_for_collection',
    OBSERVACION: 'observations',
};
let OrdersService = class OrdersService {
    constructor(orderRepository, districtsRepository, entityManager) {
        this.orderRepository = orderRepository;
        this.districtsRepository = districtsRepository;
        this.entityManager = entityManager;
    }
    async createOrder(body) {
        try {
            return await this.orderRepository.save(body);
        }
        catch (error) {
            throw error_manager_1.ErrorManager.createSignatureError(error.message);
        }
    }
    async updateOrderStatus(body) {
        try {
            const order = await this.orderRepository.update(body.orderId, { status: body.newStatus });
            return order;
        }
        catch (error) {
            throw error_manager_1.ErrorManager.createSignatureError(error.message);
        }
    }
    async batchCreateOrders(payload) {
        const { orders: orderDTOs } = payload;
        if (!orderDTOs || orderDTOs.length === 0) {
            throw error_manager_1.ErrorManager.createSignatureError('No orders provided in the batch.');
        }
        const queryRunner = this.orderRepository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        const createdOrders = [];
        const operationErrors = [];
        try {
            for (const orderDto of orderDTOs) {
                try {
                    const orderToCreate = new orders_entity_1.OrdersEntity();
                    orderToCreate.shipment_type = orderDto.shipment_type;
                    orderToCreate.recipient_name = orderDto.recipient_name;
                    orderToCreate.recipient_phone = orderDto.recipient_phone;
                    orderToCreate.delivery_district_name =
                        orderDto.delivery_district_name;
                    orderToCreate.delivery_address = orderDto.delivery_address;
                    orderToCreate.delivery_coordinates = orderDto.delivery_coordinates;
                    orderToCreate.delivery_date = orderDto.delivery_date;
                    orderToCreate.package_size_type = orderDto.package_size_type;
                    orderToCreate.package_width_cm = orderDto.package_width_cm;
                    orderToCreate.package_length_cm = orderDto.package_length_cm;
                    orderToCreate.package_height_cm = orderDto.package_height_cm;
                    orderToCreate.package_weight_kg = orderDto.package_weight_kg;
                    orderToCreate.shipping_cost = orderDto.shipping_cost;
                    orderToCreate.item_description = orderDto.item_description;
                    orderToCreate.amount_to_collect_at_delivery =
                        orderDto.amount_to_collect_at_delivery;
                    orderToCreate.payment_method_for_collection =
                        orderDto.payment_method_for_collection;
                    orderToCreate.observations = orderDto.observations;
                    orderToCreate.type_order_transfer_to_warehouse =
                        orderDto.type_order_transfer_to_warehouse;
                    const savedOrder = await queryRunner.manager.save(orders_entity_1.OrdersEntity, orderToCreate);
                    createdOrders.push(savedOrder);
                }
                catch (individualError) {
                    console.error('Error saving individual order in batch:', individualError, 'Order DTO:', orderDto);
                    operationErrors.push({
                        orderData: orderDto,
                        error: individualError.message,
                    });
                }
            }
            if (operationErrors.length > 0 &&
                operationErrors.length === orderDTOs.length) {
                throw new Error('All orders in the batch failed to save.');
            }
            await queryRunner.commitTransaction();
            console.log('Batch orders created successfully (or partially, if errors occurred and were handled).');
            return {
                success: true,
                message: operationErrors.length > 0
                    ? `Batch processed with ${operationErrors.length} errors.`
                    : 'All orders created successfully.',
                createdOrders: createdOrders,
                errors: operationErrors.length > 0 ? operationErrors : undefined,
            };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            console.error('Error during batch order creation, transaction rolled back:', error);
            return {
                success: false,
                message: `Batch creation failed: ${error.message}`,
                errors: [
                    { generalError: error.message, individualErrors: operationErrors },
                ],
            };
        }
        finally {
            await queryRunner.release();
        }
    }
    async importOrdersFromExcelData(excelRows) {
        if (!excelRows || excelRows.length === 0) {
            return { success: false, message: 'No data provided in the Excel file.' };
        }
        let importedCount = 0;
        const errors = [];
        const ordersToSave = [];
        const firstRow = excelRows[0];
        if (typeof firstRow !== 'object' || firstRow === null) {
            return {
                success: false,
                message: 'Formato de datos de Excel inválido. Se esperaba una fila de cabecera.',
            };
        }
        for (let i = 0; i < excelRows.length; i++) {
            const excelRowData = excelRows[i];
            const excelRowNumber = i + 2;
            const orderEntity = {};
            let rowHasErrors = false;
            for (const excelHeader in excelRowData) {
                if (excelRowData.hasOwnProperty(excelHeader)) {
                    const entityKey = EXCEL_HEADER_TO_ENTITY_KEY_MAP[excelHeader.trim().toUpperCase()];
                    if (entityKey) {
                        orderEntity[entityKey] = String(excelRowData[excelHeader]).trim();
                    }
                }
            }
            if (!orderEntity.recipient_phone ||
                !/^[0-9]{9}$/.test(orderEntity.recipient_phone)) {
                errors.push({
                    rowExcel: excelRowNumber,
                    message: `Teléfono del destinatario inválido: '${orderEntity.recipient_phone || ''}'.`,
                    rowData: excelRowData,
                });
                rowHasErrors = true;
            }
            if (!orderEntity.delivery_address ||
                orderEntity.delivery_address.length < 5) {
                errors.push({
                    rowExcel: excelRowNumber,
                    message: 'Dirección de entrega es requerida y debe tener al menos 5 caracteres.',
                    rowData: excelRowData,
                });
                rowHasErrors = true;
            }
            orderEntity.amount_to_collect_at_delivery =
                orderEntity.amount_to_collect_at_delivery || 0;
            if (orderEntity.amount_to_collect_at_delivery >= 0) {
                const amount = parseFloat(orderEntity.amount_to_collect_at_delivery.toString());
                if (isNaN(amount)) {
                    errors.push({
                        rowExcel: excelRowNumber,
                        message: `Monto a cobrar inválido: '${orderEntity.amount_to_collect_at_delivery}'. Debe ser un número`,
                        rowData: excelRowData,
                    });
                    rowHasErrors = true;
                }
                else {
                    orderEntity.amount_to_collect_at_delivery = amount;
                }
            }
            else if (orderEntity.type_order_transfer_to_warehouse?.toUpperCase() ===
                'CONTRAENTREGA') {
                errors.push({
                    rowExcel: excelRowNumber,
                    message: 'Monto a cobrar es requerido para tipo de envío CONTRAENTREGA.',
                    rowData: excelRowData,
                });
                rowHasErrors = true;
            }
            else {
                orderEntity.amount_to_collect_at_delivery = 0;
            }
            if (orderEntity.delivery_date) {
                const dateParts = String(orderEntity.delivery_date).split('/');
                if (dateParts.length === 3) {
                    console.log('dateParts', dateParts);
                    const day = parseInt(dateParts[0], 10);
                    const month = parseInt(dateParts[1], 10) - 1;
                    const year = parseInt(dateParts[2], 10);
                    const parsedDate = new Date(year, month, day);
                    console.log(parsedDate.getTime(), parsedDate.getDate(), day, parsedDate.getMonth(), month, parsedDate.getFullYear(), year);
                    if (isNaN(parsedDate.getTime()) ||
                        parsedDate.getDate() !== day ||
                        parsedDate.getMonth() !== month ||
                        parsedDate.getFullYear() !== year) {
                        errors.push({
                            rowExcel: excelRowNumber,
                            message: `Fecha de entrega inválida: '${orderEntity.delivery_date}'. Usar DD/MM/AAAA.`,
                            rowData: excelRowData,
                        });
                        rowHasErrors = true;
                    }
                    else {
                        orderEntity.delivery_date = day + '-' + month + '-' + year;
                    }
                }
                else {
                    errors.push({
                        rowExcel: excelRowNumber,
                        message: `Formato de fecha de entrega incorrecto: '${orderEntity.delivery_date}'. Usar DD/MM/AAAA.`,
                        rowData: excelRowData,
                    });
                    rowHasErrors = true;
                }
            }
            else {
                errors.push({
                    rowExcel: excelRowNumber,
                    message: 'Fecha de entrega es requerida.',
                    rowData: excelRowData,
                });
                rowHasErrors = true;
            }
            if (orderEntity.delivery_district_name) {
                const district = await this.districtsRepository
                    .createQueryBuilder('d')
                    .where('LOWER(d.name) = LOWER(:name)', {
                    name: orderEntity.delivery_district_name,
                })
                    .getOne();
                if (!district) {
                    errors.push({
                        rowExcel: excelRowNumber,
                        message: `Distrito '${orderEntity.delivery_district_name}' no encontrado o no válido.`,
                        rowData: excelRowData,
                    });
                    rowHasErrors = true;
                }
            }
            else {
                errors.push({
                    rowExcel: excelRowNumber,
                    message: 'Distrito es requerido.',
                    rowData: excelRowData,
                });
                rowHasErrors = true;
            }
            console.log('test1');
            console.log('ordersToSave.length > 0 && errors.length', ordersToSave, errors);
            if (!rowHasErrors) {
                orderEntity.status = roles_1.STATES.REGISTERED;
                ordersToSave.push(orderEntity);
            }
        }
        if (ordersToSave.length > 0 && errors.length === 0) {
            console.log('test2');
            const queryRunner = this.orderRepository.manager.connection.createQueryRunner();
            await queryRunner.connect();
            await queryRunner.startTransaction();
            await this.entityManager
                .transaction(async (transactionalEntityManager) => {
                try {
                    console.log(`Iniciando transacción para guardar ${ordersToSave.length} pedidos.`);
                    const entitiesToSave = ordersToSave.map((orderData) => transactionalEntityManager.create(orders_entity_1.OrdersEntity, orderData));
                    await transactionalEntityManager.save(orders_entity_1.OrdersEntity, entitiesToSave);
                    importedCount = ordersToSave.length;
                    console.log(`${importedCount} pedidos guardados exitosamente dentro de la transacción.`);
                }
                catch (dbError) {
                    console.error('Error DENTRO de la transacción de base de datos, iniciando rollback:', dbError);
                    importedCount = 0;
                    throw dbError;
                }
            })
                .catch((transactionError) => {
                console.error('La transacción de guardado de pedidos falló y se revirtió (rollback):', transactionError);
                errors.push({
                    rowExcel: 0,
                    message: `Error crítico al guardar los pedidos en la base de datos. Ningún pedido fue importado. Detalles: ${transactionError.message || 'Error desconocido de base de datos.'}`,
                });
                importedCount = 0;
            });
        }
        else if (ordersToSave.length === 0 &&
            errors.length === 0 &&
            excelRows.length > 0) {
            if (excelRows.length <= 1 && Object.keys(excelRows[0] || {}).length > 0) {
                errors.push({
                    rowExcel: 0,
                    message: 'El archivo solo contiene cabeceras o ninguna fila de datos válida.',
                });
            }
            else if (excelRows.length > 0) {
                errors.push({
                    rowExcel: 0,
                    message: 'Ningún pedido cumplió los criterios para ser procesado después de la validación inicial.',
                });
            }
        }
        const totalProcessed = excelRows.length;
        const finalSuccess = errors.length === 0 && importedCount > 0;
        let finalMessage = '';
        if (finalSuccess) {
            finalMessage = `¡Importación exitosa! ${importedCount} pedidos fueron importados correctamente.`;
        }
        else if (importedCount > 0 && errors.length > 0) {
            finalMessage = `Error en la importación. ${importedCount} pedidos podrían haberse procesado parcialmente antes de un error crítico. Se encontraron ${errors.length} problemas.`;
        }
        else if (errors.length > 0) {
            finalMessage = `La importación falló. Se encontraron ${errors.length} errores. Ningún pedido fue guardado.`;
            if (importedCount > 0) {
                finalMessage += ` (Nota: se detectó un conteo de importados de ${importedCount}, pero debido a errores críticos, la operación debería haberse revertido).`;
                importedCount = 0;
            }
        }
        else if (totalProcessed > 0 && importedCount === 0) {
            finalMessage =
                'No se importaron pedidos. El archivo podría estar vacío o los datos no fueron válidos.';
        }
        else {
            finalMessage = 'No se encontraron datos para importar en el archivo.';
        }
        return {
            success: finalSuccess,
            message: finalMessage,
            importedCount: importedCount,
            errors: errors,
        };
    }
    async findOrders({ pageNumber = 0, pageSize = 0, sortField = '', sortDirection = '', startDate, endDate, status = '', }) {
        try {
            const skip = (pageNumber - 1) * pageSize;
            const where = {};
            if (startDate && endDate) {
                const [startY, startM, startD] = startDate.split('-').map(Number);
                const [endY, endM, endD] = endDate.split('-').map(Number);
                const start = new Date(startY, startM - 1, startD, 0, 0, 0);
                const end = new Date(endY, endM - 1, endD, 23, 59, 59);
                where.createdAt = (0, typeorm_2.Between)(start, end);
            }
            if (status) {
                where.status = status;
            }
            const sortFieldMap = {
                registration_date: 'createdAt',
            };
            const sortBy = sortFieldMap[sortField] || sortField;
            return this.orderRepository
                .findAndCount({
                where,
                order: {
                    [sortBy]: sortDirection.toUpperCase(),
                },
                skip,
                take: pageSize,
            })
                .then(([items, total]) => ({
                items,
                total_count: total,
                page_number: pageNumber,
                page_size: pageSize,
            }));
        }
        catch (error) {
            throw error_manager_1.ErrorManager.createSignatureError(error.message);
        }
    }
    async getFilteredOrders({ sortField = '', sortDirection = '', startDate, endDate, status = '', }) {
        try {
            const where = {};
            if (startDate && endDate) {
                const [startY, startM, startD] = startDate.split('-').map(Number);
                const [endY, endM, endD] = endDate.split('-').map(Number);
                const start = new Date(startY, startM - 1, startD, 0, 0, 0);
                const end = new Date(endY, endM - 1, endD, 23, 59, 59);
                where.createdAt = (0, typeorm_2.Between)(start, end);
            }
            if (status) {
                where.status = status;
            }
            const sortFieldMap = {
                registration_date: 'createdAt',
            };
            const sortBy = sortFieldMap[sortField] || sortField;
            return this.orderRepository
                .findAndCount({
                where,
                order: {
                    [sortBy]: sortDirection.toUpperCase(),
                },
            })
                .then(([items, total]) => ({
                items,
                total_count: total,
            }));
        }
        catch (error) {
            throw error_manager_1.ErrorManager.createSignatureError(error.message);
        }
    }
    async findOrderById(id) {
        try {
            const order = (await this.orderRepository
                .createQueryBuilder('user')
                .where({ id })
                .getOne());
            if (!order) {
                throw new error_manager_1.ErrorManager({
                    type: 'BAD_REQUEST',
                    message: 'No se encontro resultado',
                });
            }
            return order;
        }
        catch (error) {
            throw error_manager_1.ErrorManager.createSignatureError(error.message);
        }
    }
    async findBy({ key, value }) {
        try {
            const order = (await this.orderRepository
                .createQueryBuilder('user')
                .addSelect('user.password')
                .where({ [key]: value })
                .getOne());
            return order;
        }
        catch (error) {
            throw error_manager_1.ErrorManager.createSignatureError(error.message);
        }
    }
    async updateOrder(body, id) {
        try {
            const order = await this.orderRepository.update(id, body);
            if (order.affected === 0) {
                throw new error_manager_1.ErrorManager({
                    type: 'BAD_REQUEST',
                    message: 'No se pudo actualizar',
                });
            }
            return order;
        }
        catch (error) {
            throw error_manager_1.ErrorManager.createSignatureError(error.message);
        }
    }
    async deleteOrder(id) {
        try {
            const order = await this.orderRepository.delete(id);
            if (order.affected === 0) {
                throw new error_manager_1.ErrorManager({
                    type: 'BAD_REQUEST',
                    message: 'No se pudo borrar',
                });
            }
            return order;
        }
        catch (error) {
            throw error_manager_1.ErrorManager.createSignatureError(error.message);
        }
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(orders_entity_1.OrdersEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(districts_entity_1.DistrictsEntity)),
    __param(2, (0, typeorm_1.InjectEntityManager)()),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_3.EntityManager])
], OrdersService);
//# sourceMappingURL=orders.service.js.map