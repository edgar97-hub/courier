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
const users_entity_1 = require("../../users/entities/users.entity");
const orderLog_entity_1 = require("../entities/orderLog.entity");
const date_fns_tz_1 = require("date-fns-tz");
const date_fns_1 = require("date-fns");
const cashManagement_service_1 = require("../../cashManagement/services/cashManagement.service");
const settings_entity_1 = require("../../settings/entities/settings.entity");
const order_item_entity_1 = require("../entities/order-item.entity");
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
    constructor(orderRepository, orderLogRepository, settingsRepository, districtsRepository, userRepository, cashManagementService) {
        this.orderRepository = orderRepository;
        this.orderLogRepository = orderLogRepository;
        this.settingsRepository = settingsRepository;
        this.districtsRepository = districtsRepository;
        this.userRepository = userRepository;
        this.cashManagementService = cashManagementService;
    }
    async updateOrderStatus(body, idUser) {
        let log;
        try {
            const currentOrder = await this.orderRepository.findOne({
                where: { id: body.payload.orderId },
            });
            if (!currentOrder)
                throw new Error('Orden no encontrada');
            if (body.payload.updatedAt &&
                body.payload.updatedAt !== currentOrder?.updatedAt.toISOString()) {
                throw new Error('ERROR DE CONCURRENCIA: Este registro ya fue modificado por otro usuario. ' +
                    'Por favor, actualice la tabla y obtenga el registro actualizado antes de realizar cambios.');
            }
            if (body.payload.newStatus === roles_1.STATES.ANNULLED) {
                console.log('dejar pasar');
            }
            else {
                if (body.payload.action === 'CAMBIO DE ESTADO' &&
                    (currentOrder.status === roles_1.STATES.DELIVERED ||
                        currentOrder.status === roles_1.STATES.REJECTED))
                    throw new Error('El estado del pedido ya aparece como entregado.');
            }
            if (body.payload.action === 'CAMBIO DE ESTADO') {
                await this.orderRepository.update(body.payload.orderId, {
                    status: body.payload.newStatus,
                    evidence_photos: body.payload.product_delivery_photo_urls,
                    payment_method_for_collection: body.payload.payment_method_for_collection,
                    payment_method_for_shipping_cost: body.payload.payment_method_for_shipping_cost,
                });
                log = await this.orderLogRepository.create({
                    order: { id: body.payload.orderId },
                    performedBy: { id: idUser },
                    action: body.payload.action,
                    previousValue: currentOrder.status,
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
                    previousValue: currentOrder.shipping_cost?.toString(),
                    newValue: body.payload.newValue,
                    notes: body.payload.notes,
                });
                await this.orderLogRepository.save(log);
                const updatedOrder = await this.orderRepository.findOne({
                    where: { id: body.payload.orderId },
                    relations: ['assigned_driver', 'user'],
                });
                if (updatedOrder) {
                    const amount = updatedOrder.shipping_cost || 0;
                    let pagoDirectoCourier = 'Pago directo (Pago a COURIER)';
                    let pagoEfectivoCourier = 'Efectivo (Pago a COURIER)';
                    let pagoDirectoEmpresa = 'Pago directo (Pago a EMPRESA)';
                    let paymentMethod = 'Efectivo';
                    if (updatedOrder.payment_method_for_collection?.toLowerCase() ===
                        'efectivo') {
                        updatedOrder.payment_method_for_shipping_cost = pagoEfectivoCourier;
                    }
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
                    await this.cashManagementService.updateDueToOrderModification(updatedOrder.id, amount, paymentMethod);
                }
            }
            if (body.payload.action === 'MODIFICACIÓN DEL MONTO A COBRAR') {
                await this.orderRepository.update(body.payload.orderId, {
                    amount_to_collect_at_delivery: body.payload.newValue,
                });
                log = await this.orderLogRepository.create({
                    order: { id: body.payload.orderId },
                    performedBy: { id: idUser },
                    action: body.payload.action,
                    previousValue: currentOrder.amount_to_collect_at_delivery?.toString(),
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
                const updatedOrder = await this.orderRepository.findOne({
                    where: { id: body.payload.orderId },
                    relations: ['assigned_driver', 'user'],
                });
                if (updatedOrder) {
                    const amount = updatedOrder.shipping_cost || 0;
                    let pagoDirectoCourier = 'Pago directo (Pago a COURIER)';
                    let pagoEfectivoCourier = 'Efectivo (Pago a COURIER)';
                    let pagoDirectoEmpresa = 'Pago directo (Pago a EMPRESA)';
                    let paymentMethod = 'Efectivo';
                    if (updatedOrder.payment_method_for_collection?.toLowerCase() ===
                        'efectivo') {
                        updatedOrder.payment_method_for_shipping_cost = pagoEfectivoCourier;
                    }
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
                    await this.cashManagementService.updateDueToOrderModification(updatedOrder.id, amount, paymentMethod);
                }
            }
            const updatedOrder = await this.orderRepository.findOne({
                where: { id: body.payload.orderId },
                relations: ['assigned_driver', 'user', 'company'],
            });
            if (body.payload.newStatus === roles_1.STATES.DELIVERED ||
                body.payload.newStatus === roles_1.STATES.REJECTED) {
                if (updatedOrder) {
                    const amount = updatedOrder.shipping_cost || 0;
                    let pagoDirectoCourier = 'Pago directo (Pago a COURIER)';
                    let pagoEfectivoCourier = 'Efectivo (Pago a COURIER)';
                    let pagoDirectoEmpresa = 'Pago directo (Pago a EMPRESA)';
                    let paymentMethod = 'Efectivo';
                    if (updatedOrder.payment_method_for_collection?.toLowerCase() ===
                        'efectivo') {
                        updatedOrder.payment_method_for_shipping_cost = pagoEfectivoCourier;
                    }
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
                    if (!updatedOrder.code || !updatedOrder.delivery_date)
                        return;
                    await this.cashManagementService.createAutomaticIncome(amount, paymentMethod, updatedOrder.company.id, updatedOrder.id, updatedOrder.code, updatedOrder.delivery_date);
                }
            }
            else if (body.payload.newStatus === roles_1.STATES.ANNULLED) {
                await this.cashManagementService.reverseAutomaticIncome(body.payload.orderId);
            }
            return updatedOrder;
        }
        catch (error) {
            throw new common_1.HttpException(error.message, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async batchCreateOrders(payload, idUser) {
        const { orders: orderDTOs } = payload;
        if (!orderDTOs || orderDTOs.length === 0) {
            throw error_manager_1.ErrorManager.createSignatureError('No orders provided in the batch.');
        }
        const settings = await this.settingsRepository.findOne({ where: {} });
        if (!settings) {
            throw new error_manager_1.ErrorManager.createSignatureError('La configuración del sistema no fue encontrada.');
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
                    if (!orderDto.items || orderDto.items.length === 0) {
                        throw new Error('El pedido no contiene paquetes (items).');
                    }
                    const now = new Date();
                    let isDiscountActive = false;
                    if (settings.multiPackageDiscountStartDate &&
                        settings.multiPackageDiscountEndDate) {
                        isDiscountActive =
                            now >= new Date(settings.multiPackageDiscountStartDate) &&
                                now <= new Date(settings.multiPackageDiscountEndDate);
                    }
                    else {
                        isDiscountActive = settings.multiPackageDiscountPercentage > 0;
                    }
                    const principalItem = orderDto.items.reduce((max, item) => (item.basePrice > max.basePrice ? item : max), orderDto.items[0]);
                    let totalShippingCost = 0;
                    const orderItems = [];
                    for (const itemDto of orderDto.items) {
                        const newItem = new order_item_entity_1.OrderItemEntity();
                        newItem.package_type = itemDto.package_type;
                        newItem.description = itemDto.description;
                        newItem.width_cm = itemDto.width_cm;
                        newItem.length_cm = itemDto.length_cm;
                        newItem.height_cm = itemDto.height_cm;
                        newItem.weight_kg = itemDto.weight_kg;
                        newItem.basePrice = itemDto.basePrice;
                        newItem.isPrincipal = itemDto === principalItem;
                        if (isDiscountActive &&
                            !newItem.isPrincipal &&
                            settings.multiPackageDiscountPercentage > 0) {
                            newItem.finalPrice =
                                newItem.basePrice *
                                    (1 - settings.multiPackageDiscountPercentage / 100);
                        }
                        else {
                            newItem.finalPrice = newItem.basePrice;
                        }
                        totalShippingCost += newItem.finalPrice;
                        orderItems.push(newItem);
                    }
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
                    orderToCreate.shipping_cost = totalShippingCost;
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
                    orderToCreate.isExpress = orderDto.isExpress || false;
                    orderToCreate.items = orderItems;
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
                throw new Error('Todos los pedidos en el lote fallaron al guardarse.');
            }
            if (createdOrders.length > 0) {
                await this.applyDiscountsToBatch(queryRunner, createdOrders);
            }
            await queryRunner.commitTransaction();
            console.log('Batch orders created successfully (or partially, if errors occurred and were handled).');
            return {
                success: true,
                message: operationErrors.length > 0
                    ? `Lote procesado con ${operationErrors.length} errores.`
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
                message: `La creación en lote falló: ${error.message}`,
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
            console.log('VALIDAR DISTRITO CONTRA BASE DE DATOS');
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
            const standardItem = new order_item_entity_1.OrderItemEntity();
            standardItem.package_type = order_item_entity_1.PackageType.STANDARD;
            standardItem.description =
                orderEntity.item_description || 'Paquete Importado';
            standardItem.width_cm = 0;
            standardItem.length_cm = 0;
            standardItem.height_cm = 0;
            standardItem.weight_kg = 0;
            standardItem.basePrice = orderEntity.shipping_cost || 0;
            standardItem.finalPrice = orderEntity.shipping_cost || 0;
            standardItem.isPrincipal = true;
            orderEntity.items = [standardItem];
            console.log('rowHasErrors');
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
                orderEntity.isExpress = false;
                ordersToSave.push(orderEntity);
            }
        }
        if (ordersToSave.length > 0 && errors.length === 0) {
            const queryRunner = this.orderRepository.manager.connection.createQueryRunner();
            await queryRunner.connect();
            await queryRunner.startTransaction();
            try {
                console.log(`Iniciando transacción para guardar ${ordersToSave.length} pedidos.`);
                const entitiesToSave = ordersToSave.map((orderData) => queryRunner.manager.create(orders_entity_1.OrdersEntity, orderData));
                const createdOrders = await queryRunner.manager.save(orders_entity_1.OrdersEntity, entitiesToSave, {
                    chunk: 100,
                });
                if (createdOrders.length > 0) {
                    await this.applyDiscountsToBatch(queryRunner, createdOrders);
                }
                await queryRunner.commitTransaction();
                importedCount = ordersToSave.length;
                console.log(`${importedCount} pedidos guardados exitosamente dentro de la transacción.`);
                return {
                    success: true,
                    message: `¡Importación exitosa! ${importedCount} pedidos fueron importados correctamente.`,
                    importedCount: importedCount,
                    errors: [],
                };
            }
            catch (dbError) {
                console.error('Error en transacción, haciendo Rollback:', dbError);
                await queryRunner.rollbackTransaction();
                importedCount = 0;
                errors.push({
                    rowExcel: 0,
                    message: `Error crítico al guardar los pedidos en la base de datos. Ningún pedido fue importado. Detalles: ${dbError?.message || 'Error desconocido de base de datos.'}`,
                });
            }
            finally {
                if (!queryRunner.isReleased) {
                    await queryRunner.release();
                }
            }
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
    async applyDiscountsToBatch(queryRunner, newOrders) {
        const settings = await queryRunner.manager.findOne(settings_entity_1.SettingsEntity, {
            where: {},
        });
        if (!settings?.volumeDiscountRules)
            return;
        const companyDatePairs = [
            ...new Set(newOrders.map((o) => `${o.company.id}|${o.delivery_date}`)),
        ];
        const userStatusCache = new Map();
        for (const pair of companyDatePairs) {
            const [companyId, dateStr] = pair.split('|');
            if (!dateStr || dateStr === 'null')
                continue;
            if (!userStatusCache.has(companyId)) {
                const user = await queryRunner.manager.findOne(users_entity_1.UsersEntity, {
                    where: { id: companyId },
                    select: ['isVolumeDiscountEnabled'],
                });
                userStatusCache.set(companyId, user?.isVolumeDiscountEnabled ?? false);
            }
            if (!userStatusCache.get(companyId))
                continue;
            const dailyOrders = await queryRunner.manager.find(orders_entity_1.OrdersEntity, {
                where: {
                    company: { id: companyId },
                    delivery_date: dateStr,
                    status: (0, typeorm_2.Not)(roles_1.STATES.CANCELED),
                },
                order: { code: 'ASC' },
            });
            const ordersToUpdate = [];
            for (let i = 0; i < dailyOrders.length; i++) {
                const order = dailyOrders[i];
                const sequenceNumber = i + 1;
                const isPartOfCurrentBatch = newOrders.some((no) => no.id === order.id);
                if (!isPartOfCurrentBatch)
                    continue;
                const activeRule = settings.volumeDiscountRules.find((rule) => {
                    const isInRange = sequenceNumber >= rule.minOrders &&
                        sequenceNumber <= rule.maxOrders;
                    let isDateValid = true;
                    if (rule.startDate && (0, date_fns_1.isBefore)(order.delivery_date, rule.startDate))
                        isDateValid = false;
                    if (rule.endDate && (0, date_fns_1.isAfter)(order.delivery_date, rule.endDate))
                        isDateValid = false;
                    return rule.isActive && isInRange && isDateValid;
                });
                if (activeRule) {
                    const currentPrice = order.shipping_cost;
                    const discountVal = (currentPrice * activeRule.discountPercentage) / 100;
                    order.volumeDiscountAmount = parseFloat(discountVal.toFixed(2));
                    order.shipping_cost = parseFloat((currentPrice - discountVal).toFixed(2));
                    order.appliedVolumeDiscountRule = {
                        ruleId: activeRule.id,
                        percentage: activeRule.discountPercentage,
                        sequenceNumber: sequenceNumber,
                        range: `${activeRule.minOrders} - ${activeRule.maxOrders}`,
                        appliedAtDate: new Date().toISOString(),
                    };
                    ordersToUpdate.push(order);
                }
            }
            if (ordersToUpdate.length > 0) {
                await queryRunner.manager.save(orders_entity_1.OrdersEntity, ordersToUpdate);
            }
        }
    }
    async previewVolumeDiscount(userId, deliveryDate) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user?.isVolumeDiscountEnabled) {
            return {
                applies: false,
                message: 'Cliente no habilitado para descuentos por volumen.',
            };
        }
        const settings = await this.settingsRepository.findOne({ where: {} });
        if (!settings?.volumeDiscountRules)
            return { applies: false };
        const currentCount = await this.orderRepository.count({
            where: {
                user: { id: userId },
                delivery_date: deliveryDate,
                status: (0, typeorm_2.Not)(roles_1.STATES.CANCELED),
            },
        });
        const nextSequenceNumber = currentCount + 1;
        const activeRule = settings.volumeDiscountRules.find((rule) => {
            const isInRange = nextSequenceNumber >= rule.minOrders &&
                nextSequenceNumber <= rule.maxOrders;
            let isDateValid = true;
            if (rule.startDate && (0, date_fns_1.isBefore)(deliveryDate, rule.startDate))
                isDateValid = false;
            if (rule.endDate && (0, date_fns_1.isAfter)(deliveryDate, rule.endDate))
                isDateValid = false;
            return rule.isActive && isInRange && isDateValid;
        });
        if (activeRule) {
            return {
                applies: true,
                currentDailyCount: currentCount,
                nextSequenceNumber: nextSequenceNumber,
                discountPercentage: activeRule.discountPercentage,
                message: `¡Genial! Este será tu pedido #${nextSequenceNumber} del día. Aplica ${activeRule.discountPercentage}% de descuento.`,
            };
        }
        else {
            const nextRule = settings.volumeDiscountRules
                .filter((r) => r.minOrders > nextSequenceNumber)
                .sort((a, b) => a.minOrders - b.minOrders)[0];
            const missing = nextRule ? nextRule.minOrders - nextSequenceNumber : 0;
            return {
                applies: false,
                currentDailyCount: currentCount,
                nextSequenceNumber: nextSequenceNumber,
                message: nextRule
                    ? `Pedido #${nextSequenceNumber}. Te faltan ${missing} pedidos para obtener ${nextRule.discountPercentage}% de descuento.`
                    : `Pedido #${nextSequenceNumber}. Tarifa estándar.`,
            };
        }
    }
    async simulateBatchVolumeDiscount(tempOrders) {
        const groups = new Map();
        for (const order of tempOrders) {
            const key = `${order.company_id}_${order.delivery_date}`;
            if (!groups.has(key)) {
                groups.set(key, 0);
            }
        }
        const settings = await this.settingsRepository.findOne({ where: {} });
        const dbCounts = new Map();
        for (const key of groups.keys()) {
            const [userId, date] = key.split('_');
            const user = await this.userRepository.findOne({ where: { id: userId } });
            if (!user?.isVolumeDiscountEnabled) {
                dbCounts.set(key, -1);
                continue;
            }
            const count = await this.orderRepository.count({
                where: {
                    user: { id: userId },
                    delivery_date: date,
                    status: (0, typeorm_2.Not)(roles_1.STATES.CANCELED),
                },
            });
            dbCounts.set(key, count);
        }
        const results = tempOrders.map((order) => {
            const key = `${order.company_id}_${order.delivery_date}`;
            const currentDbCount = dbCounts.get(key);
            if (currentDbCount === -1 || !settings?.volumeDiscountRules) {
                return { temp_id: order.temp_id, appliedDiscount: 0 };
            }
            const sequenceNumber = (currentDbCount || 0) + 1;
            dbCounts.set(key, sequenceNumber);
            const activeRule = settings.volumeDiscountRules.find((rule) => {
                const isInRange = sequenceNumber >= rule.minOrders && sequenceNumber <= rule.maxOrders;
                let isDateValid = true;
                if (rule.startDate && (0, date_fns_1.isBefore)(order.delivery_date, rule.startDate))
                    isDateValid = false;
                if (rule.endDate && (0, date_fns_1.isAfter)(order.delivery_date, rule.endDate))
                    isDateValid = false;
                return rule.isActive && isInRange && isDateValid;
            });
            return {
                temp_id: order.temp_id,
                appliedDiscount: activeRule ? activeRule.discountPercentage : 0,
            };
        });
        return results;
    }
    async getActiveDistrictsByDateRange(req, startDate, endDate, status) {
        const idUser = req.idUser;
        const role = req.roleUser;
        try {
            const query = this.orderRepository
                .createQueryBuilder('order')
                .select('DISTINCT(order.delivery_district_name)', 'name')
                .leftJoin('order.company', 'company');
            if (startDate && endDate) {
                query.andWhere('order.delivery_date BETWEEN :startDate AND :endDate', {
                    startDate,
                    endDate,
                });
            }
            if (role === roles_1.ROLES.EMPRESA || role === roles_1.ROLES.EMPRESA_DISTRIBUIDOR) {
                query.andWhere('company.id = :idUser', { idUser });
            }
            else if (role === roles_1.ROLES.MOTORIZADO && req.query.my_orders) {
                query.andWhere('assigned_driver.id = :idUser', { idUser });
            }
            if (req.query.isExpress) {
                query.andWhere('order.isExpress = :isExpress', { isExpress: true });
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
            query.andWhere('order.delivery_district_name IS NOT NULL');
            query.andWhere("order.delivery_district_name != ''");
            query.orderBy('order.delivery_district_name', 'ASC');
            const result = await query.getRawMany();
            return result.map((r) => r.name);
        }
        catch (error) {
            throw error_manager_1.ErrorManager.createSignatureError(error.message);
        }
    }
    async findOrders({ pageNumber = 0, pageSize = 0, sortField = '', sortDirection = '', startDate, endDate, status = '', search_term = '', delivery_date = '', districts = '', }, req) {
        let idUser = req.idUser;
        let role = req.roleUser;
        try {
            const skip = (pageNumber - 1) * pageSize;
            const query = this.orderRepository
                .createQueryBuilder('order')
                .leftJoinAndSelect('order.user', 'user')
                .leftJoinAndSelect('order.assigned_driver', 'assigned_driver')
                .leftJoinAndSelect('order.company', 'company');
            if (districts && districts.length > 0) {
                query.andWhere('order.delivery_district_name IN (:...districts)', {
                    districts: districts.split('|'),
                });
            }
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
            if (role === roles_1.ROLES.EMPRESA || role === roles_1.ROLES.EMPRESA_DISTRIBUIDOR) {
                query.andWhere('company.id = :idUser', { idUser });
            }
            else if (role === roles_1.ROLES.MOTORIZADO && req.query.my_orders) {
                query.andWhere('assigned_driver.id = :idUser', { idUser });
            }
            if (req.query.isExpress) {
                query.andWhere('order.isExpress = :isExpress', { isExpress: true });
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
    async getFilteredOrders({ sortField = '', sortDirection = '', startDate, endDate, status = '', search_term = '', delivery_date = '', districts = '', }, req) {
        let idUser = req.idUser;
        let role = req.roleUser;
        try {
            const query = this.orderRepository
                .createQueryBuilder('order')
                .leftJoinAndSelect('order.user', 'user')
                .leftJoinAndSelect('order.assigned_driver', 'assigned_driver')
                .leftJoinAndSelect('order.company', 'company');
            if (districts && districts.length > 0) {
                query.andWhere('order.delivery_district_name IN (:...districts)', {
                    districts: districts.split('|'),
                });
            }
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
            if (role === roles_1.ROLES.EMPRESA || role === roles_1.ROLES.EMPRESA_DISTRIBUIDOR) {
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
                relations: ['logs', 'stops'],
            });
            return order;
        }
        catch (error) {
            throw error_manager_1.ErrorManager.createSignatureError(error.message);
        }
    }
    async findOrderById(id) {
        try {
            const order = await this.orderRepository.findOne({
                where: { id: id },
                relations: ['company'],
            });
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
            return updatedOrder;
        }
        catch (error) {
            throw error_manager_1.ErrorManager.createSignatureError(error.message);
        }
    }
    async updateOrder(id, updateData, idUser) {
        try {
            const orderToUpdate = await this.orderRepository.findOne({
                where: { id },
            });
            if (!orderToUpdate) {
                throw new error_manager_1.ErrorManager({
                    type: 'BAD_REQUEST',
                    message: 'Order not found',
                });
            }
            if (updateData.company_id) {
                orderToUpdate.company = { id: updateData.company_id };
            }
            let updatedOrder;
            if (orderToUpdate &&
                (orderToUpdate.shipping_cost !== updateData.shipping_cost ||
                    orderToUpdate.delivery_district_name !==
                        updateData.delivery_district_name)) {
                Object.assign(orderToUpdate, updateData);
                updatedOrder = await this.orderRepository.save(orderToUpdate);
                let log = await this.orderLogRepository.create({
                    order: { id: updatedOrder.id },
                    performedBy: { id: idUser },
                    action: 'MODIFICACIÓN DEL COSTO DE ENVÍO',
                    previousValue: orderToUpdate.shipping_cost?.toString(),
                    newValue: updatedOrder.shipping_cost?.toString(),
                    notes: updatedOrder.observation_shipping_cost_modification,
                });
                await this.orderLogRepository.save(log);
                if (updatedOrder) {
                    const amount = updatedOrder.shipping_cost || 0;
                    let pagoDirectoCourier = 'Pago directo (Pago a COURIER)';
                    let pagoEfectivoCourier = 'Efectivo (Pago a COURIER)';
                    let pagoDirectoEmpresa = 'Pago directo (Pago a EMPRESA)';
                    let paymentMethod = 'Efectivo';
                    if (updatedOrder.payment_method_for_collection?.toLowerCase() ===
                        'efectivo') {
                        updatedOrder.payment_method_for_shipping_cost = pagoEfectivoCourier;
                    }
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
                    await this.cashManagementService.updateDueToOrderModification(updatedOrder.id, amount, paymentMethod);
                }
            }
            else {
                Object.assign(orderToUpdate, updateData);
                delete orderToUpdate.observation_shipping_cost_modification;
                updatedOrder = await this.orderRepository.save(orderToUpdate);
            }
            return updatedOrder;
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
            if (req.roleUser === roles_1.ROLES.EMPRESA ||
                req.roleUser === roles_1.ROLES.EMPRESA_DISTRIBUIDOR) {
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
    async findOrdersByRegistrationDate({ pageNumber = 0, pageSize = 0, sortField = '', sortDirection = '', startDate, endDate, status = '', search_term = '', }, req) {
        let idUser = req.idUser;
        let role = req.roleUser;
        try {
            const skip = (pageNumber - 1) * pageSize;
            const query = this.orderRepository
                .createQueryBuilder('order')
                .leftJoinAndSelect('order.user', 'user')
                .leftJoinAndSelect('order.assigned_driver', 'assigned_driver')
                .leftJoinAndSelect('order.company', 'company');
            if (startDate && endDate) {
                const todayStart = new Date();
                const timeZone = 'America/Lima';
                let _startDate = (0, date_fns_tz_1.formatInTimeZone)(startDate, timeZone, 'yyyy-MM-dd');
                let _endDate = (0, date_fns_tz_1.formatInTimeZone)(endDate, timeZone, 'yyyy-MM-dd');
                const startLocalString = `${_startDate} 00:00:00.000`;
                const endLocalString = `${_endDate} 23:59:59.999`;
                const refDate = new Date();
                const startOfPeriodInLima = (0, date_fns_1.parse)(startLocalString, 'yyyy-MM-dd HH:mm:ss.SSS', refDate);
                const endOfPeriodInLima = (0, date_fns_1.parse)(endLocalString, 'yyyy-MM-dd HH:mm:ss.SSS', refDate);
                const startUTC = (0, date_fns_tz_1.fromZonedTime)(startOfPeriodInLima, timeZone);
                const endUTC = (0, date_fns_tz_1.fromZonedTime)(endOfPeriodInLima, timeZone);
                console.log(startUTC);
                console.log(endUTC);
                query.andWhere({
                    createdAt: (0, typeorm_2.Between)(startUTC, endUTC),
                });
            }
            if (role === roles_1.ROLES.EMPRESA ||
                req.roleUser === roles_1.ROLES.EMPRESA_DISTRIBUIDOR) {
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
    async getVolumeDiscountReport(startDate, endDate, companyId, statusMeta) {
        const query = this.orderRepository
            .createQueryBuilder('order')
            .leftJoin('order.company', 'company')
            .select([
            'order.delivery_date AS date',
            'company.username AS client_name',
            'company.id AS client_id',
            'COUNT(order.id) AS total_orders',
            'SUM(order.shipping_cost) AS total_invoiced',
            `MAX( ("order".applied_volume_discount_rule->>'percentage')::float ) AS max_discount`,
            `MAX( "order".applied_volume_discount_rule->>'range' ) AS range_reached`,
        ])
            .where('order.status != :status', { status: roles_1.STATES.CANCELED })
            .andWhere('order.delivery_date BETWEEN :startDate AND :endDate', {
            startDate,
            endDate,
        });
        if (companyId) {
            query.andWhere('company.id = :companyId', { companyId });
        }
        query
            .groupBy('order.delivery_date')
            .addGroupBy('company.id')
            .addGroupBy('company.username')
            .orderBy('order.delivery_date', 'DESC');
        const rawResults = await query.getRawMany();
        let report = rawResults.map((res) => ({
            date: res.date,
            clientName: res.client_name,
            totalOrders: parseInt(res.total_orders),
            rangeReached: res.range_reached || 'No alcanzó',
            discount: res.max_discount ? `${res.max_discount}%` : '0%',
            totalInvoiced: parseFloat(res.total_invoiced).toFixed(2),
            hasReachedMeta: !!res.range_reached,
        }));
        if (statusMeta === 'ALCANZADA') {
            report = report.filter((r) => r.hasReachedMeta);
        }
        else if (statusMeta === 'NO_ALCANZADA') {
            report = report.filter((r) => !r.hasReachedMeta);
        }
        return report;
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(orders_entity_1.OrdersEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(orderLog_entity_1.OrderLogEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(settings_entity_1.SettingsEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(districts_entity_1.DistrictsEntity)),
    __param(4, (0, typeorm_1.InjectRepository)(users_entity_1.UsersEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        cashManagement_service_1.CashManagementService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map