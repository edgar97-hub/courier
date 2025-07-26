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
const orderLog_entity_1 = require("../entities/orderLog.entity");
const date_fns_tz_1 = require("date-fns-tz");
const date_fns_1 = require("date-fns");
const cashManagement_service_1 = require("../../cashManagement/services/cashManagement.service");
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
    constructor(orderRepository, orderLogRepository, districtsRepository, cashManagementService, entityManager) {
        this.orderRepository = orderRepository;
        this.orderLogRepository = orderLogRepository;
        this.districtsRepository = districtsRepository;
        this.cashManagementService = cashManagementService;
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
    async updateOrderStatus(body, idUser) {
        let log;
        try {
            const oldOrder = await this.orderRepository.findOne({
                where: { id: body.payload.orderId },
            });
            if (!oldOrder)
                throw new Error('Orden no encontrada');
            if (body.payload.action === 'CAMBIO DE ESTADO') {
                await this.orderRepository.update(body.payload.orderId, {
                    status: body.payload.newStatus,
                    product_delivery_photo_url: body.payload.product_delivery_photo_url,
                    payment_method_for_collection: body.payload.payment_method_for_collection,
                    payment_method_for_shipping_cost: body.payload.payment_method_for_shipping_cost,
                });
                log = await this.orderLogRepository.create({
                    order: { id: body.payload.orderId },
                    performedBy: { id: idUser },
                    action: body.payload.action,
                    previousValue: oldOrder.status,
                    newValue: body.payload.newStatus,
                    notes: body.payload.reason,
                });
                await this.orderLogRepository.save(log);
            }
            if (body.payload.action === 'MODIFICACIÓN DEL COSTO DE ENVÍO') {
                await this.orderRepository.update(body.payload.orderId, {
                    shipping_cost: body.payload.newValue,
                    observation_shipping_cost_modification: body.payload.notes,
                });
                log = await this.orderLogRepository.create({
                    order: { id: body.payload.orderId },
                    performedBy: { id: idUser },
                    action: body.payload.action,
                    previousValue: oldOrder.shipping_cost?.toString(),
                    newValue: body.payload.newValue,
                    notes: body.payload.notes,
                });
                await this.orderLogRepository.save(log);
            }
            if (body.payload.action === 'MODIFICACIÓN DEL MONTO A COBRAR') {
                await this.orderRepository.update(body.payload.orderId, {
                    amount_to_collect_at_delivery: body.payload.newValue,
                });
                log = await this.orderLogRepository.create({
                    order: { id: body.payload.orderId },
                    performedBy: { id: idUser },
                    action: body.payload.action,
                    previousValue: oldOrder.amount_to_collect_at_delivery?.toString(),
                    newValue: body.payload.newValue,
                    notes: body.payload.notes,
                });
                await this.orderLogRepository.save(log);
            }
            if (body.payload.action === 'MODIFICACION DE TIPOS DE PAGO') {
                await this.orderRepository.update(body.payload.orderId, {
                    payment_method_for_collection: body.payload.payment_method_for_collection,
                    payment_method_for_shipping_cost: body.payload.payment_method_for_shipping_cost,
                });
            }
            const updatedOrder = await this.orderRepository.findOne({
                where: { id: body.payload.orderId },
                relations: ['assigned_driver', 'user'],
            });
            if (body.payload.newStatus === roles_1.STATES.DELIVERED) {
                if (updatedOrder) {
                    const amount = updatedOrder.shipping_cost || 0;
                    let pagoDirectoCourier = 'Pago directo (Pago a COURIER)';
                    let pagoEfectivoCourier = 'Efectivo (Pago a COURIER)';
                    let pagoDirectoEmpresa = 'Pago directo (Pago a EMPRESA)';
                    let paymentMethod = '';
                    if (updatedOrder.payment_method_for_shipping_cost ===
                        pagoEfectivoCourier) {
                        paymentMethod = 'Efectivo';
                    }
                    if (updatedOrder.payment_method_for_shipping_cost === pagoDirectoCourier) {
                        paymentMethod = 'Yape/Transferencia BCP';
                    }
                    if (updatedOrder.payment_method_for_shipping_cost === pagoDirectoEmpresa) {
                        paymentMethod = 'Yape/Transferencia BCP';
                    }
                    await this.cashManagementService.createAutomaticIncome(amount, paymentMethod, updatedOrder.user.id, updatedOrder.id, updatedOrder.code);
                }
            }
            else if (body.payload.newStatus === roles_1.STATES.ANNULLED) {
                await this.cashManagementService.reverseAutomaticIncome(body.payload.orderId);
            }
            return updatedOrder;
        }
        catch (error) {
            throw error_manager_1.ErrorManager.createSignatureError(error.message);
        }
    }
    async batchCreateOrders(payload, idUser) {
        const { orders: orderDTOs } = payload;
        if (!orderDTOs || orderDTOs.length === 0) {
            throw error_manager_1.ErrorManager.createSignatureError('No orders provided in the batch.');
        }
        const queryRunner = this.orderRepository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        const createdOrders = [];
        const operationErrors = [];
        async function generateTrackingCode() {
            const { customAlphabet } = await Promise.resolve().then(() => require('nanoid'));
            const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 10);
            return nanoid();
        }
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
                    if (orderDto.delivery_date) {
                        const inputDateUTC = orderDto.delivery_date;
                        const timeZone = 'America/Lima';
                        orderToCreate.delivery_date = (0, date_fns_tz_1.formatInTimeZone)(inputDateUTC, timeZone, 'yyyy-MM-dd');
                    }
                    orderToCreate.package_size_type = orderDto.package_size_type;
                    orderToCreate.package_width_cm = orderDto.package_width_cm || 0;
                    orderToCreate.package_length_cm = orderDto.package_length_cm || 0;
                    orderToCreate.package_height_cm = orderDto.package_height_cm || 0;
                    orderToCreate.package_weight_kg = orderDto.package_weight_kg || 0;
                    orderToCreate.shipping_cost = orderDto.shipping_cost;
                    orderToCreate.item_description = orderDto.item_description;
                    orderToCreate.amount_to_collect_at_delivery =
                        orderDto.amount_to_collect_at_delivery;
                    orderToCreate.payment_method_for_collection =
                        orderDto.payment_method_for_collection;
                    orderToCreate.observations = orderDto.observations;
                    orderToCreate.type_order_transfer_to_warehouse =
                        orderDto.type_order_transfer_to_warehouse;
                    orderToCreate.user = { id: idUser };
                    orderToCreate.company = { id: orderDto.company_id };
                    orderToCreate.tracking_code = await generateTrackingCode();
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
                    : 'Todos los pedidos creados con éxito.',
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
    async importOrdersFromExcelData(excelRows, idUser) {
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
                        const inputFormat = 'dd/MM/yyyy';
                        const parsedDate = (0, date_fns_1.parse)(orderEntity.delivery_date, inputFormat, new Date());
                        orderEntity.delivery_date = (0, date_fns_1.format)(parsedDate, 'yyyy-MM-dd');
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
                    .andWhere('d.isStandard = :standard', {
                    standard: true,
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
                orderEntity.shipping_cost = district?.price;
            }
            else {
                errors.push({
                    rowExcel: excelRowNumber,
                    message: 'Distrito es requerido.',
                    rowData: excelRowData,
                });
                rowHasErrors = true;
            }
            if (!rowHasErrors) {
                orderEntity.status = roles_1.STATES.REGISTERED;
                orderEntity.user = { id: idUser };
                orderEntity.company = { id: idUser };
                async function generateTrackingCode() {
                    const { customAlphabet } = await Promise.resolve().then(() => require('nanoid'));
                    const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 10);
                    return nanoid();
                }
                orderEntity.tracking_code = await generateTrackingCode();
                ordersToSave.push(orderEntity);
            }
        }
        if (ordersToSave.length > 0 && errors.length === 0) {
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
    async findOrders({ pageNumber = 0, pageSize = 0, sortField = '', sortDirection = '', startDate, endDate, status = '', search_term = '', delivery_date = '', }, req) {
        let idUser = req.idUser;
        let role = req.roleUser;
        try {
            const skip = (pageNumber - 1) * pageSize;
            const query = this.orderRepository
                .createQueryBuilder('order')
                .leftJoinAndSelect('order.user', 'user')
                .leftJoinAndSelect('order.assigned_driver', 'assigned_driver')
                .leftJoinAndSelect('order.company', 'company');
            if (delivery_date) {
                query.andWhere({
                    delivery_date: delivery_date,
                });
            }
            else {
                if (startDate && endDate) {
                    query.andWhere({
                        delivery_date: (0, typeorm_2.Between)(startDate, endDate),
                    });
                }
            }
            if (role === roles_1.ROLES.COMPANY) {
                query.andWhere('company.id = :idUser', { idUser });
            }
            if (status) {
                let states = [status];
                if (status === roles_1.STATES.DELIVERED) {
                    states.push(roles_1.STATES.REJECTED);
                }
                query.andWhere('order.status IN (:...states)', {
                    states: states,
                });
            }
            if (search_term) {
                const term = `%${search_term}%`;
                query.andWhere(`(CAST(order.code AS TEXT) ILIKE :term OR 
        user.username ILIKE :term OR 
        assigned_driver.username ILIKE :term OR 
        company.username ILIKE :term OR 
        order.shipment_type ILIKE :term OR 
        order.recipient_name ILIKE :term OR 
        order.delivery_district_name ILIKE :term OR 
        CAST(order.amount_to_collect_at_delivery AS TEXT) ILIKE :term OR
        order.tracking_code ILIKE :term
        )`, { term });
            }
            const sortFieldMap = {
                registration_date: 'order.createdAt',
                motorizado: 'assigned_driver.username',
                usuario_creacion: 'user.username',
            };
            const sortBy = sortFieldMap[sortField] || `order.${sortField}`;
            const direction = sortDirection?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
            query
                .orderBy(sortBy, direction)
                .skip(skip)
                .take(pageSize);
            const [items, total] = await query.getManyAndCount();
            return {
                items,
                total_count: total,
                page_number: pageNumber,
                page_size: pageSize,
            };
        }
        catch (error) {
            throw error_manager_1.ErrorManager.createSignatureError(error.message);
        }
    }
    async getFilteredOrders({ pageNumber = 0, pageSize = 0, sortField = '', sortDirection = '', startDate, endDate, status = '', search_term = '', delivery_date = '', }, req) {
        let idUser = req.idUser;
        let role = req.roleUser;
        try {
            const query = this.orderRepository
                .createQueryBuilder('order')
                .leftJoinAndSelect('order.user', 'user')
                .leftJoinAndSelect('order.assigned_driver', 'assigned_driver')
                .leftJoinAndSelect('order.company', 'company');
            if (delivery_date) {
                query.andWhere({
                    delivery_date: delivery_date,
                });
            }
            else {
                if (startDate && endDate) {
                    query.andWhere({
                        delivery_date: (0, typeorm_2.Between)(startDate, endDate),
                    });
                }
            }
            if (role === roles_1.ROLES.COMPANY) {
                query.andWhere('company.id = :idUser', { idUser });
            }
            if (status) {
                let states = [status];
                if (status === roles_1.STATES.DELIVERED) {
                    states.push(roles_1.STATES.REJECTED);
                }
                query.andWhere('order.status IN (:...states)', {
                    states: states,
                });
            }
            if (search_term) {
                const term = `%${search_term}%`;
                query.andWhere(`(CAST(order.code AS TEXT) ILIKE :term OR 
        user.username ILIKE :term OR 
        assigned_driver.username ILIKE :term OR 
        company.username ILIKE :term OR 
        order.shipment_type ILIKE :term OR 
        order.recipient_name ILIKE :term OR 
        order.delivery_district_name ILIKE :term OR 
        CAST(order.amount_to_collect_at_delivery AS TEXT) ILIKE :term OR
        order.tracking_code ILIKE :term
        )`, { term });
            }
            const sortFieldMap = {
                registration_date: 'order.createdAt',
                motorizado: 'assigned_driver.username',
                usuario_creacion: 'user.username',
            };
            const sortBy = sortFieldMap[sortField] || `order.${sortField}`;
            const direction = sortDirection?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
            query.orderBy(sortBy, direction);
            const [items, total] = await query.getManyAndCount();
            return {
                items,
                total_count: total,
            };
        }
        catch (error) {
            throw error_manager_1.ErrorManager.createSignatureError(error.message);
        }
    }
    async getOrderByTrackingCode({ tracking_code = '', }) {
        try {
            const order = await this.orderRepository.findOne({
                where: { tracking_code },
                relations: ['logs'],
            });
            return order;
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
    async assignDriverToOrder(body, id, idUser) {
        try {
            const oldOrder = await this.orderRepository.findOne({
                where: { id },
                relations: ['assigned_driver'],
            });
            if (!oldOrder)
                throw new Error('Orden no encontrada');
            await this.orderRepository.update(id, {
                assigned_driver: { id: body.motorizedId },
            });
            const updatedOrder = await this.orderRepository.findOne({
                where: { id },
                relations: ['assigned_driver'],
            });
            let action = 'MOTORIZADO ASIGNADO';
            let previousValue = oldOrder.assigned_driver?.username;
            let newValue = updatedOrder?.assigned_driver?.username;
            if (oldOrder.assigned_driver) {
                action = 'MOTORIZADO CAMBIADO';
            }
            const log = await this.orderLogRepository.create({
                order: { id },
                performedBy: { id: idUser },
                action: action,
                previousValue: previousValue,
                newValue: newValue,
                notes: body.notes,
            });
            await this.orderLogRepository.save(log);
            return updatedOrder;
        }
        catch (error) {
            throw error_manager_1.ErrorManager.createSignatureError(error.message);
        }
    }
    async rescheduleOrder(body, id, idUser) {
        try {
            const oldOrder = await this.orderRepository.findOne({
                where: { id },
                relations: ['assigned_driver'],
            });
            if (!oldOrder)
                throw new Error('Orden no encontrada');
            await this.orderRepository.update(id, {
                delivery_date: body.newDate,
                status: 'REPROGRAMADO',
            });
            const updatedOrder = await this.orderRepository.findOne({
                where: { id },
            });
            let action = 'REPROGRAMADO';
            let previousValue = oldOrder.delivery_date;
            let newValue = updatedOrder?.delivery_date;
            let notes = body.reason;
            return updatedOrder;
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
    async dashboardOrders(req) {
        try {
            const todayStart = new Date();
            const timeZone = 'America/Lima';
            let _todayStart = (0, date_fns_tz_1.formatInTimeZone)(todayStart, timeZone, 'yyyy-MM-dd');
            const startLocalString = `${_todayStart} 00:00:00.000`;
            const endLocalString = `${_todayStart} 23:59:59.999`;
            const refDate = new Date();
            const startOfPeriodInLima = (0, date_fns_1.parse)(startLocalString, 'yyyy-MM-dd HH:mm:ss.SSS', refDate);
            const endOfPeriodInLima = (0, date_fns_1.parse)(endLocalString, 'yyyy-MM-dd HH:mm:ss.SSS', refDate);
            const startUTC = (0, date_fns_tz_1.fromZonedTime)(startOfPeriodInLima, timeZone);
            const endUTC = (0, date_fns_tz_1.fromZonedTime)(endOfPeriodInLima, timeZone);
            let delivery_date = (0, date_fns_tz_1.formatInTimeZone)(new Date().toISOString(), timeZone, 'yyyy-MM-dd');
            let user = {};
            if (req.roleUser === roles_1.ROLES.COMPANY) {
                user = { company: { id: req.idUser } };
            }
            const totalOrdersToday = await this.orderRepository.count({
                where: { createdAt: (0, typeorm_2.Between)(startUTC, endUTC), ...user },
            });
            const ordersInTransit = await this.orderRepository.count({
                where: { status: roles_1.STATES.IN_TRANSIT, ...user },
            });
            const ordersDeliveredToday = await this.orderRepository.count({
                where: {
                    status: roles_1.STATES.DELIVERED,
                    updatedAt: (0, typeorm_2.Between)(startUTC, endUTC),
                    ...user,
                },
            });
            const rejectedToday = await this.orderRepository.count({
                where: {
                    status: roles_1.STATES.REJECTED,
                    updatedAt: (0, typeorm_2.Between)(startUTC, endUTC),
                    ...user,
                },
            });
            return {
                kpis: {
                    totalOrdersToday,
                    ordersInTransit,
                    ordersDeliveredToday,
                    rejectedToday,
                },
                statusDistribution: [],
            };
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
    __param(1, (0, typeorm_1.InjectRepository)(orderLog_entity_1.OrderLogEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(districts_entity_1.DistrictsEntity)),
    __param(4, (0, typeorm_1.InjectEntityManager)()),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        cashManagement_service_1.CashManagementService,
        typeorm_3.EntityManager])
], OrdersService);
//# sourceMappingURL=orders.service.js.map