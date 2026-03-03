import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { ErrorManager } from 'src/utils/error.manager';
import {
  Between,
  DeepPartial,
  DeleteResult,
  FindOptionsWhere,
  In,
  Not,
  QueryRunner,
  Repository,
  UpdateResult,
} from 'typeorm';
import { OrderDTO, UpdateOrderRequestDto } from '../dto/order.dto';
import { OrdersEntity } from '../entities/orders.entity';
import { DistrictsService } from 'src/districts/services/districts.service';
import { DistrictsEntity } from 'src/districts/entities/districts.entity';
import { ImportResult } from '../dto/import-result.dto';
import { ROLES, STATES } from 'src/constants/roles';
import { EntityManager, Connection, DataSource } from 'typeorm';
import { UsersEntity } from 'src/users/entities/users.entity';
import { OrderLogEntity } from '../entities/orderLog.entity';
import { startOfDay, endOfDay, parseISO } from 'date-fns';
import { fromZonedTime, formatInTimeZone } from 'date-fns-tz';
import { parse, format, isBefore, isAfter, isEqual } from 'date-fns';
import { CashManagementService } from 'src/cashManagement/services/cashManagement.service';
import {
  DiscountRuleType,
  SettingsEntity,
  VolumeDiscountRule,
} from 'src/settings/entities/settings.entity';
import { OrderItemEntity, PackageType } from '../entities/order-item.entity';

const EXCEL_HEADER_TO_ENTITY_KEY_MAP: {
  [key: string]: keyof OrderDTO | string;
} = {
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
  // Columnas adicionales que no están en el mapeo se ignorarán o manejarán
};

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrdersEntity)
    private readonly orderRepository: Repository<OrdersEntity>,
    @InjectRepository(OrderLogEntity)
    private readonly orderLogRepository: Repository<OrderLogEntity>,
    @InjectRepository(SettingsEntity)
    private readonly settingsRepository: Repository<SettingsEntity>,
    @InjectRepository(DistrictsEntity)
    private districtsRepository: Repository<DistrictsEntity>,
    @InjectRepository(UsersEntity)
    private readonly userRepository: Repository<UsersEntity>,
    private readonly cashManagementService: CashManagementService,
  ) {}

  public async updateOrderStatus(body: any, idUser: string): Promise<any> {
    let log: OrderLogEntity;
    try {
      const currentOrder = await this.orderRepository.findOne({
        where: { id: body.payload.orderId },
      });
      if (!currentOrder) throw new Error('Orden no encontrada');

      if (
        body.payload.updatedAt &&
        body.payload.updatedAt !== currentOrder?.updatedAt.toISOString()
      ) {
        throw new Error(
          'ERROR DE CONCURRENCIA: Este registro ya fue modificado por otro usuario. ' +
            'Por favor, actualice la tabla y obtenga el registro actualizado antes de realizar cambios.',
        );
      }

      if (body.payload.newStatus === STATES.ANNULLED) {
        console.log('dejar pasar');
      } else {
        if (
          body.payload.action === 'CAMBIO DE ESTADO' &&
          (currentOrder.status === STATES.DELIVERED ||
            currentOrder.status === STATES.REJECTED)
        )
          throw new Error('El estado del pedido ya aparece como entregado.');
      }

      if (body.payload.action === 'CAMBIO DE ESTADO') {
        await this.orderRepository.update(body.payload.orderId, {
          status: body.payload.newStatus,
          evidence_photos: body.payload.product_delivery_photo_urls,
          payment_method_for_collection:
            body.payload.payment_method_for_collection,
          payment_method_for_shipping_cost:
            body.payload.payment_method_for_shipping_cost,
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

          /**
           * Cuando el monto a cobrar sea en efectivo,
           * el registro del coste del servicio en la caja debe ser efectivo.
           */
          if (
            updatedOrder.payment_method_for_collection?.toLowerCase() ===
            'efectivo'
          ) {
            updatedOrder.payment_method_for_shipping_cost = pagoEfectivoCourier;
          }

          if (
            updatedOrder.payment_method_for_shipping_cost ===
            pagoEfectivoCourier
          ) {
            paymentMethod = 'Efectivo';
          }
          if (
            updatedOrder.payment_method_for_shipping_cost === pagoDirectoCourier
          ) {
            paymentMethod = 'Yape/Transferencia BCP';
          }

          if (
            updatedOrder.payment_method_for_shipping_cost === pagoDirectoEmpresa
          ) {
            paymentMethod = 'Yape/Transferencia BCP';
          }
          await this.cashManagementService.updateDueToOrderModification(
            updatedOrder.id,
            amount,
            paymentMethod,
          );
        }
      }

      if (body.payload.action === 'MODIFICACIÓN DEL MONTO A COBRAR') {
        await this.orderRepository.update(body.payload.orderId, {
          amount_to_collect_at_delivery: body.payload.newValue,
          // observation_shipping_cost_modification: body.payload.notes,
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
          payment_method_for_collection:
            body.payload.payment_method_for_collection,
          payment_method_for_shipping_cost:
            body.payload.payment_method_for_shipping_cost,
        });
        // log = await this.orderLogRepository.create({
        //   order: { id: body.payload.orderId },
        //   performedBy: { id: idUser },
        //   action: body.payload.action,
        //   previousValue: oldOrder.amount_to_collect_at_delivery?.toString(),
        //   newValue: body.payload.newValue,
        //   notes: body.payload.notes,
        // });
        // await this.orderLogRepository.save(log);

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

          /**
           * Cuando el monto a cobrar sea en efectivo,
           * el registro del coste del servicio en la caja debe ser efectivo.
           */
          if (
            updatedOrder.payment_method_for_collection?.toLowerCase() ===
            'efectivo'
          ) {
            updatedOrder.payment_method_for_shipping_cost = pagoEfectivoCourier;
          }

          if (
            updatedOrder.payment_method_for_shipping_cost ===
            pagoEfectivoCourier
          ) {
            paymentMethod = 'Efectivo';
          }
          if (
            updatedOrder.payment_method_for_shipping_cost === pagoDirectoCourier
          ) {
            paymentMethod = 'Yape/Transferencia BCP';
          }

          if (
            updatedOrder.payment_method_for_shipping_cost === pagoDirectoEmpresa
          ) {
            paymentMethod = 'Yape/Transferencia BCP';
          }
          await this.cashManagementService.updateDueToOrderModification(
            updatedOrder.id,
            amount,
            paymentMethod,
          );
        }
      }

      const updatedOrder = await this.orderRepository.findOne({
        where: { id: body.payload.orderId },
        relations: ['assigned_driver', 'user', 'company'],
      });

      if (
        body.payload.newStatus === STATES.DELIVERED ||
        body.payload.newStatus === STATES.REJECTED
      ) {
        if (updatedOrder) {
          const amount = updatedOrder.shipping_cost || 0;

          let pagoDirectoCourier = 'Pago directo (Pago a COURIER)';
          let pagoEfectivoCourier = 'Efectivo (Pago a COURIER)';
          let pagoDirectoEmpresa = 'Pago directo (Pago a EMPRESA)';
          let paymentMethod = 'Efectivo';
          /**
           * Cuando el monto a cobrar sea en efectivo,
           * el registro del coste del servicio en la caja debe ser efectivo.
           */
          if (
            updatedOrder.payment_method_for_collection?.toLowerCase() ===
            'efectivo'
          ) {
            updatedOrder.payment_method_for_shipping_cost = pagoEfectivoCourier;
          }

          if (
            updatedOrder.payment_method_for_shipping_cost ===
            pagoEfectivoCourier
          ) {
            paymentMethod = 'Efectivo';
          }
          if (
            updatedOrder.payment_method_for_shipping_cost === pagoDirectoCourier
          ) {
            paymentMethod = 'Yape/Transferencia BCP';
          }

          if (
            updatedOrder.payment_method_for_shipping_cost === pagoDirectoEmpresa
          ) {
            paymentMethod = 'Yape/Transferencia BCP';
          }

          if (!updatedOrder.code || !updatedOrder.delivery_date) return;

          await this.cashManagementService.createAutomaticIncome(
            amount,
            paymentMethod,
            updatedOrder.company.id,
            updatedOrder.id,
            updatedOrder.code,
            updatedOrder.delivery_date,
          );
        }
      } else if (body.payload.newStatus === STATES.ANNULLED) {
        await this.cashManagementService.reverseAutomaticIncome(
          body.payload.orderId,
        );
      }
      return updatedOrder;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  public async batchCreateOrders(
    payload: any,
    idUser,
  ): Promise<{
    success: boolean;
    message: string;
    createdOrders?: OrdersEntity[];
    errors?: any[];
  }> {
    const { orders: orderDTOs } = payload;

    if (!orderDTOs || orderDTOs.length === 0) {
      throw ErrorManager.createSignatureError(
        'No orders provided in the batch.',
      );
    }

    const settings = await this.settingsRepository.findOne({ where: {} });
    if (!settings) {
      throw new ErrorManager.createSignatureError(
        'La configuración del sistema no fue encontrada.',
      );
    }

    const queryRunner =
      this.orderRepository.manager.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    const createdOrders: OrdersEntity[] = [];
    const operationErrors: any[] = [];
    async function generateTrackingCode() {
      const { customAlphabet } = await import('nanoid');
      const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 10);
      return nanoid();
    }
    try {
      for (const orderDto of orderDTOs) {
        try {
          if (!orderDto.items || orderDto.items.length === 0) {
            throw new Error('El pedido no contiene paquetes (items).');
          }

          // Validar si la promoción está activa
          const now = new Date();
          let isDiscountActive = false;
          if (
            settings.multiPackageDiscountStartDate &&
            settings.multiPackageDiscountEndDate
          ) {
            isDiscountActive =
              now >= new Date(settings.multiPackageDiscountStartDate) &&
              now <= new Date(settings.multiPackageDiscountEndDate);
          } else {
            // Si las fechas son nulas, se asume que está siempre activo (si hay un porcentaje)
            isDiscountActive = settings.multiPackageDiscountPercentage > 0;
          }

          // Encontrar el paquete principal (el de mayor precio base)
          const principalItem = orderDto.items.reduce(
            (max, item) => (item.basePrice > max.basePrice ? item : max),
            orderDto.items[0],
          );

          let totalShippingCost = 0;
          const orderItems: OrderItemEntity[] = [];

          for (const itemDto of orderDto.items) {
            const newItem = new OrderItemEntity();

            newItem.package_type = itemDto.package_type;
            newItem.description = itemDto.description;
            newItem.width_cm = itemDto.width_cm;
            newItem.length_cm = itemDto.length_cm;
            newItem.height_cm = itemDto.height_cm;
            newItem.weight_kg = itemDto.weight_kg;
            newItem.basePrice = itemDto.basePrice;

            // Determinar si es el principal
            newItem.isPrincipal = itemDto === principalItem;

            // Aplicar descuento si corresponde
            if (
              isDiscountActive &&
              !newItem.isPrincipal &&
              settings.multiPackageDiscountPercentage > 0
            ) {
              newItem.finalPrice =
                newItem.basePrice *
                (1 - settings.multiPackageDiscountPercentage / 100);
            } else {
              newItem.finalPrice = newItem.basePrice;
            }

            totalShippingCost += newItem.finalPrice;
            orderItems.push(newItem);
          }

          const orderToCreate = new OrdersEntity();
          orderToCreate.shipment_type = orderDto.shipment_type;
          orderToCreate.recipient_name = orderDto.recipient_name;
          orderToCreate.recipient_phone = orderDto.recipient_phone;
          orderToCreate.delivery_district_name =
            orderDto.delivery_district_name;
          orderToCreate.delivery_address = orderDto.delivery_address;
          orderToCreate.delivery_coordinates = orderDto.delivery_coordinates;
          if (orderDto.delivery_date) {
            const inputDateUTC = orderDto.delivery_date; // El string ISO 8601
            const timeZone = 'America/Lima';

            // 1. Usa `formatInTimeZone` para hacer todo en un solo paso.
            // Esta función toma el timestamp UTC, lo convierte a la zona horaria de Perú,
            // y lo formatea al formato 'yyyy-MM-dd' en esa misma zona horaria.
            orderToCreate.delivery_date = formatInTimeZone(
              inputDateUTC,
              timeZone,
              'yyyy-MM-dd',
            );
          }
          // orderToCreate.package_size_type = orderDto.package_size_type;
          // orderToCreate.package_width_cm = orderDto.package_width_cm || 0;
          // orderToCreate.package_length_cm = orderDto.package_length_cm || 0;
          // orderToCreate.package_height_cm = orderDto.package_height_cm || 0;
          // orderToCreate.package_weight_kg = orderDto.package_weight_kg || 0;
          // orderToCreate.shipping_cost = orderDto.shipping_cost;
          orderToCreate.shipping_cost = totalShippingCost;

          orderToCreate.item_description = orderDto.item_description;
          orderToCreate.amount_to_collect_at_delivery =
            orderDto.amount_to_collect_at_delivery;
          orderToCreate.payment_method_for_collection =
            orderDto.payment_method_for_collection;
          orderToCreate.observations = orderDto.observations;
          orderToCreate.type_order_transfer_to_warehouse =
            orderDto.type_order_transfer_to_warehouse;
          orderToCreate.user = { id: idUser } as UsersEntity;
          orderToCreate.company = { id: orderDto.company_id } as UsersEntity;
          orderToCreate.tracking_code = await generateTrackingCode();
          orderToCreate.isExpress = orderDto.isExpress || false;
          orderToCreate.items = orderItems;

          const savedOrder = await queryRunner.manager.save(
            OrdersEntity,
            orderToCreate,
          );
          createdOrders.push(savedOrder);
        } catch (individualError) {
          console.error(
            'Error saving individual order in batch:',
            individualError,
            'Order DTO:',
            orderDto,
          );
          operationErrors.push({
            orderData: orderDto,
            error: individualError.message,
          });
        }
      }

      if (
        operationErrors.length > 0 &&
        operationErrors.length === orderDTOs.length
      ) {
        throw new Error('Todos los pedidos en el lote fallaron al guardarse.');
      }
      if (createdOrders.length > 0) {
        await this.applyDiscountsToBatch(queryRunner, createdOrders);
      }
      await queryRunner.commitTransaction();
      console.log(
        'Batch orders created successfully (or partially, if errors occurred and were handled).',
      );

      return {
        success: true,
        message:
          operationErrors.length > 0
            ? `Lote procesado con ${operationErrors.length} errores.`
            : 'Todos los pedidos creados con éxito.',
        createdOrders: createdOrders,
        errors: operationErrors.length > 0 ? operationErrors : undefined,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error(
        'Error during batch order creation, transaction rolled back:',
        error,
      );

      return {
        success: false,
        message: `La creación en lote falló: ${error.message}`,
        errors: [
          { generalError: error.message, individualErrors: operationErrors },
        ],
      };
    } finally {
      await queryRunner.release();
    }
  }

  async importOrdersFromExcelData(
    excelRows: any[],
    idUser: string,
  ): Promise<ImportResult | undefined> {
    if (!excelRows || excelRows.length === 0) {
      return { success: false, message: 'No data provided in the Excel file.' };
    }

    let importedCount = 0;
    const errors: { rowExcel: number; message: string; rowData?: any }[] = [];
    const ordersToSave: Partial<OrdersEntity>[] = []; // Usamos Partial para construir

    // 1. Validar Cabeceras (opcional pero recomendado aquí)
    const firstRow = excelRows[0];
    if (typeof firstRow !== 'object' || firstRow === null) {
      return {
        success: false,
        message:
          'Formato de datos de Excel inválido. Se esperaba una fila de cabecera.',
      };
    }

    for (let i = 0; i < excelRows.length; i++) {
      const excelRowData = excelRows[i];
      const excelRowNumber = i + 2; // +1 porque es 0-indexed, +1 porque la fila 1 es cabecera en Excel
      const orderEntity: Partial<OrdersEntity> = {};
      let rowHasErrors = false;

      // Mapear y validar datos básicos
      for (const excelHeader in excelRowData) {
        if (excelRowData.hasOwnProperty(excelHeader)) {
          const entityKey =
            EXCEL_HEADER_TO_ENTITY_KEY_MAP[excelHeader.trim().toUpperCase()];
          if (entityKey) {
            (orderEntity as any)[entityKey] = String(
              excelRowData[excelHeader],
            ).trim();
          }
        }
      }

      // --- VALIDACIONES ESPECÍFICAS DEL BACKEND ---
      if (
        !orderEntity.recipient_phone ||
        !/^[0-9]{9}$/.test(orderEntity.recipient_phone)
      ) {
        errors.push({
          rowExcel: excelRowNumber,
          message: `Teléfono del destinatario inválido: '${orderEntity.recipient_phone || ''}'.`,
          rowData: excelRowData,
        });
        rowHasErrors = true;
      }

      if (
        !orderEntity.delivery_address ||
        orderEntity.delivery_address.length < 5
      ) {
        errors.push({
          rowExcel: excelRowNumber,
          message:
            'Dirección de entrega es requerida y debe tener al menos 5 caracteres.',
          rowData: excelRowData,
        });
        rowHasErrors = true;
      }
      orderEntity.amount_to_collect_at_delivery =
        orderEntity.amount_to_collect_at_delivery || 0;

      // Validar y parsear MONTO A COBRAR
      if (orderEntity.amount_to_collect_at_delivery >= 0) {
        const amount = parseFloat(
          orderEntity.amount_to_collect_at_delivery.toString(),
        );
        if (isNaN(amount)) {
          errors.push({
            rowExcel: excelRowNumber,
            message: `Monto a cobrar inválido: '${orderEntity.amount_to_collect_at_delivery}'. Debe ser un número`,
            rowData: excelRowData,
          });
          rowHasErrors = true;
        } else {
          orderEntity.amount_to_collect_at_delivery = amount;
        }
      } else if (
        orderEntity.type_order_transfer_to_warehouse?.toUpperCase() ===
        'CONTRAENTREGA'
      ) {
        errors.push({
          rowExcel: excelRowNumber,
          message:
            'Monto a cobrar es requerido para tipo de envío CONTRAENTREGA.',
          rowData: excelRowData,
        });
        rowHasErrors = true;
      } else {
        orderEntity.amount_to_collect_at_delivery = 0; // Default para no contraentrega si está vacío
      }

      // Validar FECHA DE ENTREGA
      if (orderEntity.delivery_date) {
        // formato DD/MM/YYYY del Excel
        const dateParts = String(orderEntity.delivery_date).split('/');
        if (dateParts.length === 3) {
          console.log('dateParts', dateParts);

          const day = parseInt(dateParts[0], 10);
          const month = parseInt(dateParts[1], 10) - 1; // Meses en JS Date son 0-indexed
          const year = parseInt(dateParts[2], 10);
          const parsedDate = new Date(year, month, day);
          if (
            isNaN(parsedDate.getTime()) ||
            parsedDate.getDate() !== day ||
            parsedDate.getMonth() !== month ||
            parsedDate.getFullYear() !== year
          ) {
            errors.push({
              rowExcel: excelRowNumber,
              message: `Fecha de entrega inválida: '${orderEntity.delivery_date}'. Usar DD/MM/AAAA.`,
              rowData: excelRowData,
            });
            rowHasErrors = true;
          } else {
            const inputFormat = 'dd/MM/yyyy';
            const parsedDate = parse(
              orderEntity.delivery_date,
              inputFormat,
              new Date(),
            );

            orderEntity.delivery_date = format(parsedDate, 'yyyy-MM-dd');
          }
        } else {
          errors.push({
            rowExcel: excelRowNumber,
            message: `Formato de fecha de entrega incorrecto: '${orderEntity.delivery_date}'. Usar DD/MM/AAAA.`,
            rowData: excelRowData,
          });
          rowHasErrors = true;
        }
      } else {
        errors.push({
          rowExcel: excelRowNumber,
          message: 'Fecha de entrega es requerida.',
          rowData: excelRowData,
        });
        rowHasErrors = true;
      }

      console.log('VALIDAR DISTRITO CONTRA BASE DE DATOS');
      // VALIDAR DISTRITO CONTRA BASE DE DATOS
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
      } else {
        errors.push({
          rowExcel: excelRowNumber,
          message: 'Distrito es requerido.',
          rowData: excelRowData,
        });
        rowHasErrors = true;
      }

      const standardItem = new OrderItemEntity();

      // 1. Configuración Estándar
      standardItem.package_type = PackageType.STANDARD;
      standardItem.description =
        orderEntity.item_description || 'Paquete Importado';

      // 2. Medidas en 0 (El sistema asumirá las medidas por defecto de la configuración)
      standardItem.width_cm = 0;
      standardItem.length_cm = 0;
      standardItem.height_cm = 0;
      standardItem.weight_kg = 0;

      // 3. Precios (Inicialmente igual al costo del distrito)
      standardItem.basePrice = orderEntity.shipping_cost || 0;
      standardItem.finalPrice = orderEntity.shipping_cost || 0;
      standardItem.isPrincipal = true;

      // 4. Asignación (TypeORM guardará esto automáticamente gracias a cascade: true)
      orderEntity.items = [standardItem];

      console.log('rowHasErrors');
      if (!rowHasErrors) {
        orderEntity.status = STATES.REGISTERED;
        orderEntity.user = { id: idUser } as UsersEntity;
        orderEntity.company = { id: idUser } as UsersEntity;
        async function generateTrackingCode() {
          const { customAlphabet } = await import('nanoid');
          const nanoid = customAlphabet(
            '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            10,
          );
          return nanoid();
        }

        orderEntity.tracking_code = await generateTrackingCode();
        orderEntity.isExpress = false;
        ordersToSave.push(orderEntity);
      }
    }
    if (ordersToSave.length > 0 && errors.length === 0) {
      const queryRunner =
        this.orderRepository.manager.connection.createQueryRunner();

      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        console.log(
          `Iniciando transacción para guardar ${ordersToSave.length} pedidos.`,
        );

        const entitiesToSave = ordersToSave.map((orderData) =>
          queryRunner.manager.create(
            OrdersEntity,
            orderData as DeepPartial<OrdersEntity>,
          ),
        );
        const createdOrders = await queryRunner.manager.save(
          OrdersEntity,
          entitiesToSave,
          {
            chunk: 100,
          },
        );
        if (createdOrders.length > 0) {
          await this.applyDiscountsToBatch(queryRunner, createdOrders);
        }
        await queryRunner.commitTransaction();

        importedCount = ordersToSave.length;
        console.log(
          `${importedCount} pedidos guardados exitosamente dentro de la transacción.`,
        );
        return {
          success: true,
          message: `¡Importación exitosa! ${importedCount} pedidos fueron importados correctamente.`,
          importedCount: importedCount,
          errors: [],
        };
      } catch (dbError) {
        console.error('Error en transacción, haciendo Rollback:', dbError);
        await queryRunner.rollbackTransaction();
        importedCount = 0;
        errors.push({
          rowExcel: 0,
          message: `Error crítico al guardar los pedidos en la base de datos. Ningún pedido fue importado. Detalles: ${dbError?.message || 'Error desconocido de base de datos.'}`,
        });
      } finally {
        if (!queryRunner.isReleased) {
          await queryRunner.release();
        }
      }
    } else if (
      ordersToSave.length === 0 &&
      errors.length === 0 &&
      excelRows.length > 0
    ) {
      if (excelRows.length <= 1 && Object.keys(excelRows[0] || {}).length > 0) {
        errors.push({
          rowExcel: 0,
          message:
            'El archivo solo contiene cabeceras o ninguna fila de datos válida.',
        });
      } else if (excelRows.length > 0) {
        errors.push({
          rowExcel: 0,
          message:
            'Ningún pedido cumplió los criterios para ser procesado después de la validación inicial.',
        });
      }
    }
    const totalProcessed = excelRows.length;
    const finalSuccess = errors.length === 0 && importedCount > 0;
    let finalMessage = '';

    if (finalSuccess) {
      finalMessage = `¡Importación exitosa! ${importedCount} pedidos fueron importados correctamente.`;
    } else if (importedCount > 0 && errors.length > 0) {
      finalMessage = `Error en la importación. ${importedCount} pedidos podrían haberse procesado parcialmente antes de un error crítico. Se encontraron ${errors.length} problemas.`;
    } else if (errors.length > 0) {
      finalMessage = `La importación falló. Se encontraron ${errors.length} errores. Ningún pedido fue guardado.`;
      if (importedCount > 0) {
        finalMessage += ` (Nota: se detectó un conteo de importados de ${importedCount}, pero debido a errores críticos, la operación debería haberse revertido).`;
        importedCount = 0;
      }
    } else if (totalProcessed > 0 && importedCount === 0) {
      finalMessage =
        'No se importaron pedidos. El archivo podría estar vacío o los datos no fueron válidos.';
    } else {
      finalMessage = 'No se encontraron datos para importar en el archivo.';
    }

    return {
      success: finalSuccess,
      message: finalMessage,
      importedCount: importedCount,
      errors: errors,
    };
  }

  // private async applyDiscountsToBatch(
  //   queryRunner: QueryRunner,
  //   newOrders: OrdersEntity[],
  // ): Promise<void> {
  //   // 1. Obtener configuración global de reglas una sola vez
  //   const settings = await queryRunner.manager.findOne(SettingsEntity, {
  //     where: {},
  //   });
  //   if (!settings?.volumeDiscountRules) return;

  //   // 2. Identificar combinaciones únicas de Empresa + Fecha en este lote
  //   // Formato de la llave: "companyId|deliveryDate"
  //   const companyDatePairs = [
  //     ...new Set(newOrders.map((o) => `${o.company.id}|${o.delivery_date}`)),
  //   ];

  //   // Cache para no consultar el estado del usuario repetidamente
  //   const userStatusCache = new Map<string, boolean>();

  //   // 3. Procesar cada grupo (Empresa + Fecha) de forma independiente
  //   for (const pair of companyDatePairs) {
  //     const [companyId, dateStr] = pair.split('|');
  //     if (!dateStr || dateStr === 'null') continue;

  //     // A. Verificar si esta empresa tiene el beneficio (usando cache)
  //     if (!userStatusCache.has(companyId)) {
  //       const user = await queryRunner.manager.findOne(UsersEntity, {
  //         where: { id: companyId },
  //         select: ['isVolumeDiscountEnabled'],
  //       });
  //       userStatusCache.set(companyId, user?.isVolumeDiscountEnabled ?? false);
  //     }

  //     if (!userStatusCache.get(companyId)) continue;

  //     // B. Traer TODOS los pedidos de ese día para esa empresa específica
  //     // Ordenamos por 'code' o 'createdAt' para determinar la secuencia real
  //     const dailyOrders = await queryRunner.manager.find(OrdersEntity, {
  //       where: {
  //         company: { id: companyId },
  //         delivery_date: dateStr,
  //         status: Not(STATES.CANCELED),
  //       },
  //       order: { code: 'ASC' }, // Mantener el orden de llegada
  //     });

  //     const ordersToUpdate: OrdersEntity[] = [];

  //     // C. Calcular secuencia y aplicar reglas
  //     for (let i = 0; i < dailyOrders.length; i++) {
  //       const order = dailyOrders[i];
  //       const sequenceNumber = i + 1; // Posición del pedido en el día

  //       // ¿Es este pedido uno de los que acabamos de insertar en este lote?
  //       // (Solo aplicamos descuento a los nuevos para no recalcular pedidos viejos ya cerrados)
  //       const isPartOfCurrentBatch = newOrders.some((no) => no.id === order.id);
  //       if (!isPartOfCurrentBatch) continue;

  //       // Buscar regla aplicable para este número de secuencia y fecha
  //       const activeRule = settings.volumeDiscountRules.find((rule) => {
  //         const isInRange =
  //           sequenceNumber >= rule.minOrders &&
  //           sequenceNumber <= rule.maxOrders;
  //         // Validar fechas...
  //         let isDateValid = true;
  //         if (rule.startDate && isBefore(order.delivery_date, rule.startDate))
  //           isDateValid = false;
  //         if (rule.endDate && isAfter(order.delivery_date, rule.endDate))
  //           isDateValid = false;
  //         return rule.isActive && isInRange && isDateValid;
  //       });

  //       if (activeRule) {
  //         const currentPrice = order.shipping_cost;
  //         const discountVal =
  //           (currentPrice * activeRule.discountPercentage) / 100;

  //         order.volumeDiscountAmount = parseFloat(discountVal.toFixed(2));
  //         order.shipping_cost = parseFloat(
  //           (currentPrice - discountVal).toFixed(2),
  //         );

  //         // Snapshot de la regla para auditoría física
  //         order.appliedVolumeDiscountRule = {
  //           ruleId: activeRule.id,
  //           percentage: activeRule.discountPercentage,
  //           sequenceNumber: sequenceNumber,
  //           range: `${activeRule.minOrders} - ${activeRule.maxOrders}`,
  //           appliedAtDate: new Date().toISOString(),
  //         };

  //         ordersToUpdate.push(order);
  //       }
  //     }

  //     // 4. Guardar cambios del grupo en la base de datos
  //     if (ordersToUpdate.length > 0) {
  //       await queryRunner.manager.save(OrdersEntity, ordersToUpdate);
  //     }
  //   }
  // }

  private async applyDiscountsToBatch(
    queryRunner: QueryRunner,
    newOrders: OrdersEntity[],
  ): Promise<void> {
    const settings = await queryRunner.manager.findOne(SettingsEntity, {
      where: {},
    });
    if (!settings?.volumeDiscountRules?.length) return;

    const affectedGroups = [
      ...new Set(newOrders.map((o) => `${o.company.id}|${o.delivery_date}`)),
    ];

    console.log('affectedGroups', affectedGroups);

    const userCache = new Map<string, UsersEntity | null>();

    for (const group of affectedGroups) {
      const [companyId, dateStr] = group.split('|');
      if (!dateStr || dateStr === 'null') continue;

      if (!userCache.has(companyId)) {
        const user = await queryRunner.manager.findOne(UsersEntity, {
          where: { id: companyId },
          select: [
            'id',
            'isVolumeDiscountEnabled',
            'assignedVolumeDiscountRuleIds',
          ],
        });
        userCache.set(companyId, user);
      }

      const currentUser = userCache.get(companyId);
      if (
        !currentUser?.isVolumeDiscountEnabled ||
        !currentUser.assignedVolumeDiscountRuleIds?.length
      )
        continue;
      console.log('currentUser', currentUser);
      // 1. Obtener todos los pedidos del día
      const dailyOrders = await queryRunner.manager.find(OrdersEntity, {
        where: {
          company: { id: companyId },
          delivery_date: dateStr,
          status: Not(In([STATES.CANCELED])),
        },
        order: { code: 'ASC' },
      });
      console.log('dailyOrders', dailyOrders.length);
      if (dailyOrders.length === 0) continue;

      // 2. Filtrar biblioteca de reglas del usuario vigentes para este día
      const userRules = settings.volumeDiscountRules.filter(
        (r) =>
          currentUser.assignedVolumeDiscountRuleIds.includes(r.id) &&
          (!r.startDate || dateStr >= r.startDate) &&
          (!r.endDate || dateStr <= r.endDate),
      );
      console.log('userRules', userRules);
      if (userRules.length === 0) continue;

      // 3. DETECTAR EL MODO DE HOY (Gracias a tu validación, todas las reglas de hoy son del mismo tipo)
      const currentMode = userRules[0].type;
      const totalCount = dailyOrders.length;
      const ordersToUpdate: OrdersEntity[] = [];

      // --- LOGICA PARA METAS (Retroactivo) ---
      if (currentMode === DiscountRuleType.GOAL) {
        // Buscamos la meta más alta alcanzada con el total de pedidos
        const bestGoal = userRules
          .filter((r) => totalCount >= r.minOrders)
          .sort((a, b) => b.minOrders - a.minOrders)[0];

        for (let i = 0; i < dailyOrders.length; i++) {
          const order = dailyOrders[i];
          const sequenceNumber = i + 1;

          let ruleToApply: VolumeDiscountRule | undefined = undefined;

          // 2. VALIDACIÓN CRÍTICA:
          // El descuento SOLO aplica si el pedido está dentro del grupo de la meta.
          // Si la meta es 5, solo los pedidos 1, 2, 3, 4 y 5 lo reciben.
          if (bestGoal && sequenceNumber <= bestGoal.minOrders) {
            ruleToApply = bestGoal;
          }

          // 3. El helper se encarga:
          // - Si está dentro de la meta (1-5): Aplica descuento.
          // - Si es el pedido sobrante (6): Lo resetea a precio normal.
          this.updateOrderDiscount(
            order,
            ruleToApply,
            sequenceNumber,
            ordersToUpdate,
          );
          // this.updateOrderDiscount(order, bestGoal, i + 1, ordersToUpdate);
        }
      }

      // --- LOGICA PARA RANGOS (Progresivo) ---
      else {
        for (let i = 0; i < dailyOrders.length; i++) {
          const order = dailyOrders[i];
          const sequenceNumber = i + 1;
          // Buscamos en qué rango cae este pedido específico
          const activeRange = userRules.find(
            (r) =>
              sequenceNumber >= r.minOrders &&
              sequenceNumber <= (r.maxOrders || 999999),
          );
          this.updateOrderDiscount(
            order,
            activeRange,
            sequenceNumber,
            ordersToUpdate,
          );
        }
      }

      // 4. Guardado masivo
      if (ordersToUpdate.length > 0) {
        await queryRunner.manager.save(OrdersEntity, ordersToUpdate);
      }
    }
  }

  // Helper para procesar el cálculo y verificar si realmente cambió el precio
  private updateOrderDiscount(
    order: OrdersEntity,
    rule: VolumeDiscountRule | undefined,
    seq: number,
    list: OrdersEntity[],
  ) {
    const basePrice = order.shipping_cost + (order.volumeDiscountAmount || 0);

    let newDiscountAmount = 0;
    let newShippingCost = basePrice;
    let ruleSnapshot;

    if (rule) {
      newDiscountAmount = (basePrice * rule.discountPercentage) / 100;
      newShippingCost = basePrice - newDiscountAmount;
      ruleSnapshot = {
        ruleId: rule.id,
        type: rule.type,
        percentage: rule.discountPercentage,
        range:
          rule.type === DiscountRuleType.GOAL
            ? `Meta ${rule.minOrders}`
            : `${rule.minOrders}-${rule.maxOrders}`,
        sequenceNumber: seq,
      };
    }

    // Solo actualizamos si hay una diferencia real (evita guardar mil veces lo mismo)
    if (
      order.shipping_cost !== newShippingCost ||
      order.volumeDiscountAmount !== newDiscountAmount
    ) {
      order.volumeDiscountAmount = newDiscountAmount;
      order.shipping_cost = newShippingCost;
      order.appliedVolumeDiscountRule = ruleSnapshot;
      list.push(order);
    }
  }

  async previewVolumeDiscount(userId: string, deliveryDate: string) {
    // 1. Validar si el usuario tiene el beneficio activo
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user?.isVolumeDiscountEnabled) {
      return {
        applies: false,
        message: 'Cliente no habilitado para descuentos por volumen.',
      };
    }

    // 2. Obtener reglas
    const settings = await this.settingsRepository.findOne({ where: {} });
    if (!settings?.volumeDiscountRules) return { applies: false };

    // 3. Contar pedidos existentes para esa fecha (Sin contar anulados)
    const currentCount = await this.orderRepository.count({
      where: {
        user: { id: userId },
        delivery_date: deliveryDate,
        status: Not(STATES.CANCELED),
      },
    });
    // 4. Simular que este es el siguiente pedido
    const nextSequenceNumber = currentCount + 1;

    // 5. Buscar si cae en alguna regla
    // const now = new Date(deliveryDate);
    const activeRule = settings.volumeDiscountRules.find((rule) => {
      const isInRange =
        nextSequenceNumber >= rule.minOrders &&
        nextSequenceNumber <= (rule.maxOrders || 0);

      // Validar fechas
      let isDateValid = true;
      if (rule.startDate && isBefore(deliveryDate, rule.startDate))
        isDateValid = false;
      if (rule.endDate && isAfter(deliveryDate, rule.endDate))
        isDateValid = false;

      return rule.isActive && isInRange && isDateValid;
    });
    // console.log(activeRule, settings.volumeDiscountRules);
    if (activeRule) {
      return {
        applies: true,
        currentDailyCount: currentCount,
        nextSequenceNumber: nextSequenceNumber,
        discountPercentage: activeRule.discountPercentage,
        message: `¡Genial! Este será tu pedido #${nextSequenceNumber} del día. Aplica ${activeRule.discountPercentage}% de descuento.`,
      };
    } else {
      // Opcional: Decirle cuánto le falta
      // Buscamos la siguiente regla más cercana
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

  async simulateBatchVolumeDiscount(tempOrders: any[]) {
    // 1. Agrupar pedidos por "Cliente + Fecha" para hacer consultas eficientes a la BD
    // Clave: "userId_YYYY-MM-DD"
    const groups = new Map<string, number>();

    // Identificar qué contadores necesitamos de la BD
    for (const order of tempOrders) {
      const key = `${order.company_id}_${order.delivery_date}`; // Asumiendo formato YYYY-MM-DD
      if (!groups.has(key)) {
        groups.set(key, 0); // Inicializamos en 0, luego llenaremos con la BD
      }
    }

    // 2. Obtener contadores reales de la Base de Datos (Snapshot inicial)
    const settings = await this.settingsRepository.findOne({ where: {} });
    const dbCounts = new Map<string, number>();

    for (const key of groups.keys()) {
      const [userId, date] = key.split('_');

      // Validar si el usuario tiene el beneficio activo
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user?.isVolumeDiscountEnabled) {
        dbCounts.set(key, -1); // Marca especial para "no aplica"
        continue;
      }

      const count = await this.orderRepository.count({
        where: {
          user: { id: userId },
          delivery_date: date,
          status: Not(STATES.CANCELED),
        },
      });
      dbCounts.set(key, count);
    }

    // 3. Simular la inserción progresiva (Recorrer la lista temporal)
    // Esto actualiza los descuentos basándose en el orden de la lista
    const results = tempOrders.map((order) => {
      const key = `${order.company_id}_${order.delivery_date}`;
      const currentDbCount = dbCounts.get(key);

      // Si el usuario no tiene activado el beneficio
      if (currentDbCount === -1 || !settings?.volumeDiscountRules) {
        return { temp_id: order.temp_id, appliedDiscount: 0 };
      }

      // Aumentamos el contador virtual (BD + lo que llevamos recorrido en el array)
      const sequenceNumber = (currentDbCount || 0) + 1;

      // Actualizamos el contador del grupo para el siguiente item del array
      dbCounts.set(key, sequenceNumber);

      // Buscar regla
      const activeRule = settings.volumeDiscountRules.find((rule) => {
        const isInRange =
          sequenceNumber >= rule.minOrders &&
          sequenceNumber <= (rule.maxOrders || 0);
        // Validar fechas...
        let isDateValid = true;
        if (rule.startDate && isBefore(order.delivery_date, rule.startDate))
          isDateValid = false;
        if (rule.endDate && isAfter(order.delivery_date, rule.endDate))
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

  public async getActiveDistrictsByDateRange(
    req: any,
    startDate: string,
    endDate: string,
    status?: string,
  ): Promise<string[]> {
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

      if (role === ROLES.EMPRESA || role === ROLES.EMPRESA_DISTRIBUIDOR) {
        query.andWhere('company.id = :idUser', { idUser });
      } else if (role === ROLES.MOTORIZADO && req.query.my_orders) {
        query.andWhere('assigned_driver.id = :idUser', { idUser });
      }

      if (req.query.isExpress) {
        query.andWhere('order.isExpress = :isExpress', { isExpress: true });
      }

      if (status) {
        let states = [status];
        if (status === STATES.DELIVERED) {
          states.push(STATES.REJECTED);
        }
        query.andWhere('order.status IN (:...states)', {
          states: states,
        });
      }

      // 4. Limpieza y Orden
      query.andWhere('order.delivery_district_name IS NOT NULL');
      query.andWhere("order.delivery_district_name != ''");
      query.orderBy('order.delivery_district_name', 'ASC');

      const result = await query.getRawMany();

      // Retornamos un array simple de strings: ['Comas', 'Los Olivos', ...]
      return result.map((r) => r.name);
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findOrders(
    {
      pageNumber = 0,
      pageSize = 0,
      sortField = '',
      sortDirection = '',
      startDate,
      endDate,
      status = '',
      search_term = '',
      delivery_date = '',
      districts = '',
    }: {
      pageNumber?: number;
      pageSize?: number;
      sortField?: string;
      sortDirection?: string;
      startDate?: string;
      endDate?: string;
      status?: string;
      search_term?: string;
      delivery_date?: string;
      districts?: string;
    },
    req,
  ): Promise<{
    items: any;
    total_count: number;
    page_number: number;
    page_size: number;
  }> {
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
      } else {
        if (startDate && endDate) {
          query.andWhere({
            delivery_date: Between(startDate, endDate),
          });
        }
      }

      if (role === ROLES.EMPRESA || role === ROLES.EMPRESA_DISTRIBUIDOR) {
        query.andWhere('company.id = :idUser', { idUser });
      } else if (role === ROLES.MOTORIZADO && req.query.my_orders) {
        query.andWhere('assigned_driver.id = :idUser', { idUser });
      }

      if (req.query.isExpress) {
        query.andWhere('order.isExpress = :isExpress', { isExpress: true });
      }

      if (status) {
        let states = [status];
        if (status === STATES.DELIVERED) {
          states.push(STATES.REJECTED);
        }
        query.andWhere('order.status IN (:...states)', {
          states: states,
        });
      }

      if (search_term) {
        const term = `%${search_term}%`;
        query.andWhere(
          `(CAST(order.code AS TEXT) ILIKE :term OR 
        user.username ILIKE :term OR 
        assigned_driver.username ILIKE :term OR 
        company.username ILIKE :term OR 
        order.shipment_type ILIKE :term OR 
        order.recipient_name ILIKE :term OR 
        order.delivery_district_name ILIKE :term OR 
        CAST(order.amount_to_collect_at_delivery AS TEXT) ILIKE :term OR
        order.tracking_code ILIKE :term
        )`,
          { term },
        );
      }

      const sortFieldMap = {
        registration_date: 'order.createdAt',
        motorizado: 'assigned_driver.username',
        usuario_creacion: 'user.username',
      };

      const sortBy = sortFieldMap[sortField] || `order.${sortField}`;
      const direction =
        sortDirection?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

      query
        .orderBy(sortBy, direction as 'ASC' | 'DESC')
        .skip(skip)
        .take(pageSize);

      const [items, total] = await query.getManyAndCount();
      return {
        items,
        total_count: total,
        page_number: pageNumber,
        page_size: pageSize,
      };
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async getFilteredOrders(
    {
      sortField = '',
      sortDirection = '',
      startDate,
      endDate,
      status = '',
      search_term = '',
      delivery_date = '',
      districts = '',
    }: {
      sortField?: string;
      sortDirection?: string;
      startDate?: string;
      endDate?: string;
      status?: string;
      search_term?: string;
      delivery_date?: string;
      districts?: string;
    },
    req,
  ): Promise<{
    items: any;
    total_count: number;
  }> {
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
      } else {
        if (startDate && endDate) {
          query.andWhere({
            delivery_date: Between(startDate, endDate),
          });
        }
      }

      if (role === ROLES.EMPRESA || role === ROLES.EMPRESA_DISTRIBUIDOR) {
        query.andWhere('company.id = :idUser', { idUser });
      }

      if (status) {
        let states = [status];
        if (status === STATES.DELIVERED) {
          states.push(STATES.REJECTED);
        }
        query.andWhere('order.status IN (:...states)', {
          states: states,
        });
      }

      if (search_term) {
        const term = `%${search_term}%`;
        query.andWhere(
          `(CAST(order.code AS TEXT) ILIKE :term OR 
        user.username ILIKE :term OR 
        assigned_driver.username ILIKE :term OR 
        company.username ILIKE :term OR 
        order.shipment_type ILIKE :term OR 
        order.recipient_name ILIKE :term OR 
        order.delivery_district_name ILIKE :term OR 
        CAST(order.amount_to_collect_at_delivery AS TEXT) ILIKE :term OR
        order.tracking_code ILIKE :term
        )`,
          { term },
        );
      }

      const sortFieldMap = {
        registration_date: 'order.createdAt',
        motorizado: 'assigned_driver.username',
        usuario_creacion: 'user.username',
      };

      const sortBy = sortFieldMap[sortField] || `order.${sortField}`;
      const direction =
        sortDirection?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

      query.orderBy(sortBy, direction as 'ASC' | 'DESC');

      const [items, total] = await query.getManyAndCount();
      return {
        items,
        total_count: total,
      };
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async getOrderByTrackingCode({
    tracking_code = '',
  }: {
    tracking_code?: string;
  }): Promise<OrdersEntity | null> {
    try {
      const order = await this.orderRepository.findOne({
        where: { tracking_code },
        relations: ['logs', 'stops'],
      });
      return order;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findOrderById(id: string): Promise<any> {
    try {
      const order = await this.orderRepository.findOne({
        where: { id: id },
        relations: ['company'],
      });
      return order;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async assignDriverToOrder(
    body: any,
    id: string,
    idUser: string,
  ): Promise<any> {
    try {
      const oldOrder = await this.orderRepository.findOne({
        where: { id },
        relations: ['assigned_driver'],
      });
      if (!oldOrder) throw new Error('Orden no encontrada');

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
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async rescheduleOrder(
    body: any,
    id: string,
    idUser: string,
  ): Promise<any> {
    try {
      const oldOrder = await this.orderRepository.findOne({
        where: { id },
        relations: ['assigned_driver'],
      });
      if (!oldOrder) throw new Error('Orden no encontrada');

      await this.orderRepository.update(id, {
        delivery_date: body.newDate,
        status: 'REPROGRAMADO' as STATES,
      });
      const updatedOrder = await this.orderRepository.findOne({
        where: { id },
      });

      // let action = 'REPROGRAMADO';
      // let previousValue = oldOrder.delivery_date;
      // let newValue = updatedOrder?.delivery_date;
      // let notes = body.reason;
      // const log = await this.orderLogRepository.create({
      //   // order: { id },
      //   performedBy: { id: idUser },
      //   action: action,
      //   previousValue: previousValue,
      //   newValue: newValue,
      //   notes: notes,
      // });
      // await this.orderLogRepository.save(log);
      return updatedOrder;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updateOrder(
    id: string,
    updateData: UpdateOrderRequestDto,
    idUser: string,
  ): Promise<OrdersEntity> {
    try {
      const orderToUpdate = await this.orderRepository.findOne({
        where: { id },
      });

      if (!orderToUpdate) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'Order not found',
        });
      }
      // Handle relations
      if (updateData.company_id) {
        orderToUpdate.company = { id: updateData.company_id } as UsersEntity;
      }

      let updatedOrder;
      if (
        orderToUpdate &&
        (orderToUpdate.shipping_cost !== updateData.shipping_cost ||
          orderToUpdate.delivery_district_name !==
            updateData.delivery_district_name)
      ) {
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

          /**
           * Cuando el monto a cobrar sea en efectivo,
           * el registro del coste de envio en la caja debe ser efectivo.
           */
          if (
            updatedOrder.payment_method_for_collection?.toLowerCase() ===
            'efectivo'
          ) {
            updatedOrder.payment_method_for_shipping_cost = pagoEfectivoCourier;
          }

          if (
            updatedOrder.payment_method_for_shipping_cost ===
            pagoEfectivoCourier
          ) {
            paymentMethod = 'Efectivo';
          }
          if (
            updatedOrder.payment_method_for_shipping_cost === pagoDirectoCourier
          ) {
            paymentMethod = 'Yape/Transferencia BCP';
          }

          if (
            updatedOrder.payment_method_for_shipping_cost === pagoDirectoEmpresa
          ) {
            paymentMethod = 'Yape/Transferencia BCP';
          }
          await this.cashManagementService.updateDueToOrderModification(
            updatedOrder.id,
            amount,
            paymentMethod,
          );
        }
      } else {
        Object.assign(orderToUpdate, updateData);
        delete orderToUpdate.observation_shipping_cost_modification;
        updatedOrder = await this.orderRepository.save(orderToUpdate);
      }
      return updatedOrder;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async dashboardOrders(req): Promise<any> {
    try {
      const todayStart = new Date();

      const timeZone = 'America/Lima';

      let _todayStart = formatInTimeZone(todayStart, timeZone, 'yyyy-MM-dd');
      const startLocalString = `${_todayStart} 00:00:00.000`;
      const endLocalString = `${_todayStart} 23:59:59.999`;
      const refDate = new Date();
      const startOfPeriodInLima = parse(
        startLocalString,
        'yyyy-MM-dd HH:mm:ss.SSS',
        refDate,
      );
      const endOfPeriodInLima = parse(
        endLocalString,
        'yyyy-MM-dd HH:mm:ss.SSS',
        refDate,
      );

      const startUTC = fromZonedTime(startOfPeriodInLima, timeZone);
      const endUTC = fromZonedTime(endOfPeriodInLima, timeZone);

      let delivery_date = formatInTimeZone(
        new Date().toISOString(),
        timeZone,
        'yyyy-MM-dd',
      );

      let user = {};
      if (
        req.roleUser === ROLES.EMPRESA ||
        req.roleUser === ROLES.EMPRESA_DISTRIBUIDOR
      ) {
        user = { company: { id: req.idUser } };
      }

      const totalOrdersToday = await this.orderRepository.count({
        where: { createdAt: Between(startUTC, endUTC), ...user },
      });

      const ordersInTransit = await this.orderRepository.count({
        where: { status: STATES.IN_TRANSIT, ...user },
      });

      const ordersDeliveredToday = await this.orderRepository.count({
        where: {
          status: STATES.DELIVERED,
          // delivery_date: delivery_date,
          updatedAt: Between(startUTC, endUTC),
          ...user,
        },
      });

      const rejectedToday = await this.orderRepository.count({
        where: {
          status: STATES.REJECTED,
          updatedAt: Between(startUTC, endUTC),
          ...user,
        },
      });

      // const relevantStatusesForDistribution: STATES[] = [
      //   STATES.REGISTERED,
      //   STATES.IN_WHAREHOUSE,
      //   STATES.IN_TRANSIT,
      //   STATES.DELIVERED,
      //   STATES.REJECTED,
      //   STATES.CANCELED,
      // ];

      // const statusCountsResult = await this.orderRepository
      //   .createQueryBuilder('order')
      //   .select('order.status', 'status_val')
      //   .addSelect('COUNT(order.id)', 'count')
      //   .where('order.status IN (:...statuses)', {
      //     statuses: relevantStatusesForDistribution,
      //   })
      //   .groupBy('order.status')
      //   .getRawMany<{ status_val: STATES; count: string }>();

      // const statusMap = new Map<STATES, number>();
      // statusCountsResult.forEach((item) => {
      //   statusMap.set(item.status_val, parseInt(item.count, 10));
      // });

      // const statusDistribution: Array<{
      //   name: STATES;
      //   label: string;
      //   value: number;
      // }> = [];
      // relevantStatusesForDistribution.forEach((status) => {
      //   let label = status.toString().replace(/_/g, ' ');
      //   label = label
      //     .toLowerCase()
      //     .split(' ')
      //     .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      //     .join(' ');
      //   statusDistribution.push({
      //     name: status,
      //     label: label,
      //     value: statusMap.get(status) || 0,
      //   });
      // });

      return {
        kpis: {
          totalOrdersToday,
          ordersInTransit,
          ordersDeliveredToday,
          rejectedToday,
        },
        statusDistribution: [],
      };
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }
  public async findOrdersByRegistrationDate(
    {
      pageNumber = 0,
      pageSize = 0,
      sortField = '',
      sortDirection = '',
      startDate,
      endDate,
      status = '',
      search_term = '',
    }: {
      pageNumber?: number;
      pageSize?: number;
      sortField?: string;
      sortDirection?: string;
      startDate?: string;
      endDate?: string;
      status?: string;
      search_term?: string;
    },
    req,
  ): Promise<{
    items: any;
    total_count: number;
    page_number: number;
    page_size: number;
  }> {
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

        let _startDate = formatInTimeZone(startDate, timeZone, 'yyyy-MM-dd');
        let _endDate = formatInTimeZone(endDate, timeZone, 'yyyy-MM-dd');
        const startLocalString = `${_startDate} 00:00:00.000`;
        const endLocalString = `${_endDate} 23:59:59.999`;
        const refDate = new Date();
        const startOfPeriodInLima = parse(
          startLocalString,
          'yyyy-MM-dd HH:mm:ss.SSS',
          refDate,
        );
        const endOfPeriodInLima = parse(
          endLocalString,
          'yyyy-MM-dd HH:mm:ss.SSS',
          refDate,
        );

        const startUTC = fromZonedTime(startOfPeriodInLima, timeZone);
        const endUTC = fromZonedTime(endOfPeriodInLima, timeZone);

        // console.log(startOfDay(parseISO(startDate)));
        // const start = startOfDay(parseISO(startDate));
        // const end = endOfDay(parseISO(endDate));
        console.log(startUTC);
        console.log(endUTC);
        query.andWhere({
          createdAt: Between(startUTC, endUTC),
        });
      }

      if (
        role === ROLES.EMPRESA ||
        req.roleUser === ROLES.EMPRESA_DISTRIBUIDOR
      ) {
        query.andWhere('company.id = :idUser', { idUser });
      }

      if (status) {
        let states = [status];
        if (status === STATES.DELIVERED) {
          states.push(STATES.REJECTED);
        }
        query.andWhere('order.status IN (:...states)', {
          states: states,
        });
      }

      if (search_term) {
        const term = `%${search_term}%`;
        query.andWhere(
          `(CAST(order.code AS TEXT) ILIKE :term OR
          user.username ILIKE :term OR
          assigned_driver.username ILIKE :term OR
          company.username ILIKE :term OR
          order.shipment_type ILIKE :term OR
          order.recipient_name ILIKE :term OR
          order.delivery_district_name ILIKE :term OR
          CAST(order.amount_to_collect_at_delivery AS TEXT) ILIKE :term OR
          order.tracking_code ILIKE :term
          )`,
          { term },
        );
      }

      const sortFieldMap = {
        registration_date: 'order.createdAt',
        motorizado: 'assigned_driver.username',
        usuario_creacion: 'user.username',
      };

      const sortBy = sortFieldMap[sortField] || `order.${sortField}`;
      const direction =
        sortDirection?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

      query
        .orderBy(sortBy, direction as 'ASC' | 'DESC')
        .skip(skip)
        .take(pageSize);

      const [items, total] = await query.getManyAndCount();
      return {
        items,
        total_count: total,
        page_number: pageNumber,
        page_size: pageSize,
      };
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async getVolumeDiscountReport(
    startDate: string,
    endDate: string,
    companyId?: string,
    statusMeta?: 'ALCANZADA' | 'NO_ALCANZADA',
  ) {
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
      .where('order.status != :status', { status: STATES.CANCELED })
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

    // Mapeo y filtrado por "Estado Meta"
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
    } else if (statusMeta === 'NO_ALCANZADA') {
      report = report.filter((r) => !r.hasReachedMeta);
    }

    return report;
  }
}
