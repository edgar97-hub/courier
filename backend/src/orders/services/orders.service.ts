import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { ErrorManager } from 'src/utils/error.manager';
import {
  Between,
  DeepPartial,
  DeleteResult,
  FindOptionsWhere,
  Repository,
  UpdateResult,
} from 'typeorm';
import { OrderDTO, OrderUpdateDTO } from '../dto/order.dto';
import { OrdersEntity } from '../entities/orders.entity';
import { DistrictsService } from 'src/districts/services/districts.service';
import { DistrictsEntity } from 'src/districts/entities/districts.entity';
import { ImportResult } from '../dto/import-result.dto';
import { ROLES, STATES } from 'src/constants/roles';
import { EntityManager, Connection, DataSource } from 'typeorm'; // Importa Connection o DataSource
import { UsersEntity } from 'src/users/entities/users.entity';
import { OrderLogEntity } from '../entities/orderLog.entity';
import { startOfDay, endOfDay, parseISO } from 'date-fns';
import { fromZonedTime, formatInTimeZone } from 'date-fns-tz';
import { parse, format } from 'date-fns';

// import { customAlphabet } from 'nanoid';
// const _nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 10);

const EXCEL_HEADER_TO_ENTITY_KEY_MAP: {
  [key: string]: keyof OrderDTO | string;
} = {
  'TIPO DE ENVIO': 'shipment_type',
  'NOMBRE DEL DESTINATARIO': 'recipient_name',
  'TELEFONO DESTINATARIO 9 DIGITOS': 'recipient_phone',
  'DISTRITO (SELECCIONE SOLO DEL LISTADO)': 'delivery_district_name', // Usaremos este nombre para buscar en DB
  'DIRECCION DE ENTREGA': 'delivery_address',
  'FECHA DE ENTREGA (DIA/MES/AÑO)': 'delivery_date', // Necesitará parseo
  'DETALLE DEL PRODUCTO': 'item_description',
  'MONTO A COBRAR': 'amount_to_collect_at_delivery', // Necesitará parseo a número
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
    @InjectRepository(DistrictsEntity)
    private districtsRepository: Repository<DistrictsEntity>,
    @InjectEntityManager()
    private entityManager: EntityManager,
  ) {}
  public async createOrder(body: OrderDTO): Promise<OrdersEntity> {
    try {
      return await this.orderRepository.save(body);
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updateOrderStatus(body: any, idUser: string): Promise<any> {
    let log: OrderLogEntity;
    try {
      const oldOrder = await this.orderRepository.findOne({
        where: { id: body.payload.orderId },
      });
      if (!oldOrder) throw new Error('Orden no encontrada');

      if (body.payload.action === 'CAMBIO DE ESTADO') {
        await this.orderRepository.update(body.payload.orderId, {
          status: body.payload.newStatus,
          product_delivery_photo_url: body.payload.product_delivery_photo_url,
          payment_method_for_collection:
            body.payload.payment_method_for_collection,
          payment_method_for_shipping_cost:
            body.payload.payment_method_for_shipping_cost,
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

      const updatedOrder = await this.orderRepository.findOne({
        where: { id: body.payload.orderId },
        relations: ['assigned_driver'],
      });

      return updatedOrder;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
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

    const queryRunner =
      this.orderRepository.manager.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    const createdOrders: OrdersEntity[] = [];
    const operationErrors: any[] = [];
    async function generateTrackingCode() {
      const { customAlphabet } = await import('nanoid');
      const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 10);
      return nanoid(); //`PKG-${nanoid()}`;
    }
    try {
      for (const orderDto of orderDTOs) {
        try {
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
            // Es la función perfecta para este caso de uso.
            orderToCreate.delivery_date = formatInTimeZone(
              inputDateUTC,
              timeZone,
              'yyyy-MM-dd',
            );
          }
          // orderToCreate.delivery_date = orderDto.delivery_date;
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
          orderToCreate.user = { id: idUser } as UsersEntity;
          orderToCreate.company = { id: orderDto.company_id } as UsersEntity;
          orderToCreate.tracking_code = await generateTrackingCode();

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
        throw new Error('All orders in the batch failed to save.');
      }

      await queryRunner.commitTransaction();
      console.log(
        'Batch orders created successfully (or partially, if errors occurred and were handled).',
      );
      return {
        success: true,
        message:
          operationErrors.length > 0
            ? `Batch processed with ${operationErrors.length} errors.`
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
        message: `Batch creation failed: ${error.message}`,
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
            ).trim(); // Convertir todo a string y trim inicialmente
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

      // Validar FECHA DE ENTREGA (ejemplo básico, necesitarás una librería robusta o mejor validación)
      if (orderEntity.delivery_date) {
        // Suponiendo formato DD/MM/YYYY del Excel
        const dateParts = String(orderEntity.delivery_date).split('/');
        if (dateParts.length === 3) {
          console.log('dateParts', dateParts);

          const day = parseInt(dateParts[0], 10);
          const month = parseInt(dateParts[1], 10) - 1; // Meses en JS Date son 0-indexed
          const year = parseInt(dateParts[2], 10);
          const parsedDate = new Date(year, month, day);
          console.log(
            parsedDate.getTime(),
            parsedDate.getDate(),
            day,
            parsedDate.getMonth(),
            month,
            parsedDate.getFullYear(),
            year,
          );
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
            // orderEntity.delivery_date = parsedDate; // Guardar como objeto Date o string YYYY-MM-DD
            // orderEntity.delivery_date = new Date(
            //   day + '-' + month + '-' + year,
            // ); // Guardar como objeto Date o string YYYY-MM-DD
            // const dateObject = new Date(orderData.deliveryDate);
            // orderEntity.delivery_date = format(dateObject, 'yyyy-MM-dd');
            // orderEntity.delivery_date = year + '-' + month + '-' + day;

            const inputFormat = 'dd/MM/yyyy';

            // 1. Parsear el string de entrada con un formato explícito.
            // Esto crea un objeto Date correcto sin ambigüedades de zona horaria.
            const parsedDate = parse(
              orderEntity.delivery_date,
              inputFormat,
              new Date(),
            );

            // 2. Formatear el objeto Date al formato de salida deseado (YYYY-MM-DD).
            orderEntity.delivery_date = format(parsedDate, 'yyyy-MM-dd');
            // Guardar como objeto Date o string YYYY-MM-DD
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

      // VALIDAR DISTRITO CONTRA BASE DE DATOS
      if (orderEntity.delivery_district_name) {
        // const district = await this.districtsRepository.findOne({
        //   where: { name: orderEntity.delivery_district_name },
        // }); // Búsqueda case-sensitive
        // Para búsqueda case-insensitive, depende de tu DB y ORM: ILIKE en PostgreSQL, o transformar a minúsculas en ambos lados
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
      } else {
        errors.push({
          rowExcel: excelRowNumber,
          message: 'Distrito es requerido.',
          rowData: excelRowData,
        });
        rowHasErrors = true;
      }

      // orderEntity.delivery_coordinates = '...'; // Si lo puedes calcular o es opcional

      // let importedCount = 0; // Mantener esta variable para el conteo final
      console.log('test1');
      console.log(
        'ordersToSave.length > 0 && errors.length',
        ordersToSave,
        errors,
      );
      if (!rowHasErrors) {
        orderEntity.status = STATES.REGISTERED;
        orderEntity.user = { id: idUser } as UsersEntity;
        async function generateTrackingCode() {
          const { customAlphabet } = await import('nanoid');
          const nanoid = customAlphabet(
            '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            10,
          );
          return nanoid(); //`PKG-${nanoid()}`;
        }

        orderEntity.tracking_code = await generateTrackingCode();
        ordersToSave.push(orderEntity);
      }
    }
    if (ordersToSave.length > 0 && errors.length === 0) {
      const queryRunner =
        this.orderRepository.manager.connection.createQueryRunner();

      await queryRunner.connect();
      await queryRunner.startTransaction();

      await this.entityManager
        .transaction(async (transactionalEntityManager) => {
          try {
            console.log(
              `Iniciando transacción para guardar ${ordersToSave.length} pedidos.`,
            );

            // Opción 1: Guardar uno por uno (más control si necesitas IDs de retorno individuales para algo)
            // const savedOrders: OrderEntity[] = [];
            // for (const orderData of ordersToSave) {
            //   const newOrder = transactionalEntityManager.create(OrderEntity, orderData);
            //   const saved = await transactionalEntityManager.save(OrderEntity, newOrder);
            //   savedOrders.push(saved);
            // }
            // importedCount = savedOrders.length;

            // Opción 2: Guardar en batch (más eficiente para múltiples inserciones si tu ORM lo soporta bien)
            // TypeORM puede tomar un array de entidades o objetos parciales en save()
            // Asegúrate de que orderData en ordersToSave sea compatible con lo que espera OrderEntity
            const entitiesToSave = ordersToSave.map((orderData) =>
              transactionalEntityManager.create(
                OrdersEntity,
                orderData as DeepPartial<OrdersEntity>,
              ),
            );

            await transactionalEntityManager.save(OrdersEntity, entitiesToSave);

            importedCount = ordersToSave.length;
            console.log(
              `${importedCount} pedidos guardados exitosamente dentro de la transacción.`,
            );
          } catch (dbError) {
            console.error(
              'Error DENTRO de la transacción de base de datos, iniciando rollback:',
              dbError,
            );
            importedCount = 0; // Asegurar que el conteo sea 0 si la transacción falla
            throw dbError; // ESTO ES CRUCIAL para que la transacción haga rollback
          }
        })
        .catch((transactionError) => {
          console.error(
            'La transacción de guardado de pedidos falló y se revirtió (rollback):',
            transactionError,
          );
          errors.push({
            rowExcel: 0,
            message: `Error crítico al guardar los pedidos en la base de datos. Ningún pedido fue importado. Detalles: ${transactionError.message || 'Error desconocido de base de datos.'}`,
          });
          importedCount = 0;
        });
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
        importedCount = 0; // Forzar a 0
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

      if (delivery_date) {
        // const timeZone = 'America/Lima';

        // const startLocalString = `${delivery_date} 00:00:00.000`;
        // const endLocalString = `${delivery_date} 23:59:59.999`;

        // const refDate = new Date();
        // const startOfPeriodInLima = parse(
        //   startLocalString,
        //   'yyyy-MM-dd HH:mm:ss.SSS',
        //   refDate,
        // );
        // const endOfPeriodInLima = parse(
        //   endLocalString,
        //   'yyyy-MM-dd HH:mm:ss.SSS',
        //   refDate,
        // );

        // const startUTC = fromZonedTime(startOfPeriodInLima, timeZone);
        // const endUTC = fromZonedTime(endOfPeriodInLima, timeZone);

        // query.andWhere({
        //   delivery_date: Between(startUTC, endUTC),
        // });
        query.andWhere({
          delivery_date: delivery_date,
        });
      } else {
        if (startDate && endDate) {
          // const timeZone = 'America/Lima';

          // const startLocalString = `${startDate} 00:00:00.000`;
          // const endLocalString = `${endDate} 23:59:59.999`;

          // const refDate = new Date();
          // const startOfPeriodInLima = parse(
          //   startLocalString,
          //   'yyyy-MM-dd HH:mm:ss.SSS',
          //   refDate,
          // );
          // const endOfPeriodInLima = parse(
          //   endLocalString,
          //   'yyyy-MM-dd HH:mm:ss.SSS',
          //   refDate,
          // );

          // const startUTC = fromZonedTime(startOfPeriodInLima, timeZone);
          // const endUTC = fromZonedTime(endOfPeriodInLima, timeZone);

          query.andWhere({
            delivery_date: Between(startDate, endDate),
          });
        }
      }

      if (role === ROLES.COMPANY) {
        query.andWhere('company.id = :idUser', { idUser });
      }

      if (status) {
        query.andWhere('order.status = :status', { status });
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
      pageNumber = 0,
      pageSize = 0,
      sortField = '',
      sortDirection = '',
      startDate,
      endDate,
      status = '',
      search_term = '',
      delivery_date = '',
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

      if (delivery_date) {
        // const timeZone = 'America/Lima';

        // const startLocalString = `${delivery_date} 00:00:00.000`;
        // const endLocalString = `${delivery_date} 23:59:59.999`;

        // const refDate = new Date();
        // const startOfPeriodInLima = parse(
        //   startLocalString,
        //   'yyyy-MM-dd HH:mm:ss.SSS',
        //   refDate,
        // );
        // const endOfPeriodInLima = parse(
        //   endLocalString,
        //   'yyyy-MM-dd HH:mm:ss.SSS',
        //   refDate,
        // );

        // const startUTC = fromZonedTime(startOfPeriodInLima, timeZone);
        // const endUTC = fromZonedTime(endOfPeriodInLima, timeZone);

        // query.andWhere({
        //   delivery_date: Between(startUTC, endUTC),
        // });
        query.andWhere({
          delivery_date: delivery_date,
        });
      } else {
        if (startDate && endDate) {
          // const timeZone = 'America/Lima';

          // const startLocalString = `${startDate} 00:00:00.000`;
          // const endLocalString = `${endDate} 23:59:59.999`;

          // const refDate = new Date();
          // const startOfPeriodInLima = parse(
          //   startLocalString,
          //   'yyyy-MM-dd HH:mm:ss.SSS',
          //   refDate,
          // );
          // const endOfPeriodInLima = parse(
          //   endLocalString,
          //   'yyyy-MM-dd HH:mm:ss.SSS',
          //   refDate,
          // );

          // const startUTC = fromZonedTime(startOfPeriodInLima, timeZone);
          // const endUTC = fromZonedTime(endOfPeriodInLima, timeZone);

          query.andWhere({
            delivery_date: Between(startDate, endDate),
          });
        }
      }

      if (role === ROLES.COMPANY) {
        query.andWhere('company.id = :idUser', { idUser });
      }

      if (status) {
        query.andWhere('order.status = :status', { status });
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
        relations: ['logs'],
      });
      return order;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findOrderById(id: string): Promise<OrdersEntity> {
    try {
      const order: OrdersEntity = (await this.orderRepository
        .createQueryBuilder('user')
        .where({ id })
        // .leftJoinAndSelect('user.projectsIncludes', 'projectsIncludes')
        // .leftJoinAndSelect('projectsIncludes.project', 'project')
        .getOne()) as any;
      if (!order) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se encontro resultado',
        });
      }
      return order;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findBy({ key, value }: { key: keyof OrderDTO; value: any }) {
    try {
      const order: OrdersEntity = (await this.orderRepository
        .createQueryBuilder('user')
        .addSelect('user.password')
        .where({ [key]: value })
        .getOne()) as any;

      return order;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updateOrder(
    body: OrderUpdateDTO,
    id: string,
  ): Promise<UpdateResult | undefined> {
    try {
      const order: UpdateResult = await this.orderRepository.update(id, body);
      if (order.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo actualizar',
        });
      }
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

      let action = 'REPROGRAMADO';
      let previousValue = oldOrder.delivery_date;
      let newValue = updatedOrder?.delivery_date;
      let notes = body.reason;
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

  public async deleteOrder(id: string): Promise<DeleteResult | undefined> {
    try {
      const order: DeleteResult = await this.orderRepository.delete(id);
      if (order.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo borrar',
        });
      }
      return order;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async dashboardOrders(): Promise<any> {
    // interface DashboardOrderStatusSummary {
    //   status: STATES;
    //   count: number;
    //   label: string; // Un label legible para el frontend
    // }
    // interface DashboardData {
    //   statusSummary: DashboardOrderStatusSummary[];
    //   totalOrders: number;
    //   // Puedes añadir más agregaciones aquí, ej:
    //   // totalRevenue: number;
    //   // averageDeliveryTime: number;
    // }

    try {
      const todayStart = startOfDay(new Date());
      const todayEnd = endOfDay(new Date());

      // KPIs
      const totalOrdersToday = await this.orderRepository.count({
        where: { createdAt: Between(todayStart, todayEnd) },
      });

      const ordersInTransit = await this.orderRepository.count({
        where: { status: STATES.IN_TRANSIT },
      });

      const ordersDeliveredToday = await this.orderRepository.count({
        where: {
          status: STATES.DELIVERED,
          delivery_date: Between(todayStart.toString(), todayEnd.toString()),
          updatedAt: Between(todayStart, todayEnd),
        },
      });

      const rejectedToday = await this.orderRepository.count({
        where: {
          status: STATES.REJECTED,
          updatedAt: Between(todayStart, todayEnd),
        },
      });
      // const cancelledToday = await this.orderRepository.count({
      //   where: {
      //     status: STATES.CANCELED,
      //     updatedAt: Between(todayStart, todayEnd),
      //   },
      // });
      const ordersWithIssuesToday = rejectedToday;

      const relevantStatusesForDistribution: STATES[] = [
        STATES.REGISTERED,
        STATES.IN_WHAREHOUSE,
        STATES.IN_TRANSIT,
        STATES.DELIVERED,
        STATES.REJECTED,
        STATES.CANCELED,
      ];

      const statusCountsResult = await this.orderRepository
        .createQueryBuilder('order')
        .select('order.status', 'status_val')
        .addSelect('COUNT(order.id)', 'count')
        .where('order.status IN (:...statuses)', {
          statuses: relevantStatusesForDistribution,
        })
        .groupBy('order.status')
        .getRawMany<{ status_val: STATES; count: string }>();

      const statusMap = new Map<STATES, number>();
      statusCountsResult.forEach((item) => {
        statusMap.set(item.status_val, parseInt(item.count, 10));
      });

      const statusDistribution: Array<{
        name: STATES;
        label: string;
        value: number;
      }> = [];
      relevantStatusesForDistribution.forEach((status) => {
        let label = status.toString().replace(/_/g, ' ');
        label = label
          .toLowerCase()
          .split(' ')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        statusDistribution.push({
          name: status, // El valor del enum
          label: label, // El label legible
          value: statusMap.get(status) || 0,
        });
      });

      return {
        kpis: {
          totalOrdersToday,
          ordersInTransit,
          ordersDeliveredToday,
          ordersWithIssuesToday,
        },
        statusDistribution,
      };
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }
}
