import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorManager } from 'src/utils/error.manager';
import {
  Between,
  DeleteResult,
  FindOptionsWhere,
  Repository,
  UpdateResult,
} from 'typeorm';
import { OrderDTO, OrderUpdateDTO } from '../dto/order.dto';
import { OrdersEntity } from '../entities/orders.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrdersEntity)
    private readonly userRepository: Repository<OrdersEntity>,
  ) {}

  public async createUser(body: OrderDTO): Promise<OrdersEntity> {
    try {
      return await this.userRepository.save(body);
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async batchCreateOrders(payload: any): Promise<{
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
      this.userRepository.manager.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    const createdOrders: OrdersEntity[] = [];
    const operationErrors: any[] = [];

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
            : 'All orders created successfully.',
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

  public async findUsers({
    pageNumber = 1,
    pageSize = 1,
    sortField = '',
    sortDirection = '',
    startDate,
    endDate,
  }: {
    pageNumber?: number;
    pageSize?: number;
    sortField?: string;
    sortDirection?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    items: any;
    total_count: number;
    page_number: number;
    page_size: number;
  }> {
    try {
      const skip = (pageNumber - 1) * pageSize;
      const where: FindOptionsWhere<OrdersEntity> = {};

      if (startDate && endDate) {
        const [startY, startM, startD] = startDate.split('-').map(Number);
        const [endY, endM, endD] = endDate.split('-').map(Number);

        const start = new Date(startY, startM - 1, startD, 0, 0, 0);
        const end = new Date(endY, endM - 1, endD, 23, 59, 59);
        where.createdAt = Between(start, end);
      }

      const sortFieldMap = {
        registration_date: 'createdAt',
      };
      const sortBy = sortFieldMap[sortField] || sortField;

      return this.userRepository
        .findAndCount({
          where,
          order: {
            [sortBy]: sortDirection.toUpperCase() as 'ASC' | 'DESC',
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
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findUserById(id: string): Promise<OrdersEntity> {
    try {
      const user: OrdersEntity = (await this.userRepository
        .createQueryBuilder('user')
        .where({ id })
        // .leftJoinAndSelect('user.projectsIncludes', 'projectsIncludes')
        // .leftJoinAndSelect('projectsIncludes.project', 'project')
        .getOne()) as any;
      if (!user) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se encontro resultado',
        });
      }
      return user;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findBy({ key, value }: { key: keyof OrderDTO; value: any }) {
    try {
      const user: OrdersEntity = (await this.userRepository
        .createQueryBuilder('user')
        .addSelect('user.password')
        .where({ [key]: value })
        .getOne()) as any;

      return user;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updateUser(
    body: OrderUpdateDTO,
    id: string,
  ): Promise<UpdateResult | undefined> {
    try {
      const user: UpdateResult = await this.userRepository.update(id, body);
      if (user.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo actualizar',
        });
      }
      return user;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async deleteUser(id: string): Promise<DeleteResult | undefined> {
    try {
      const user: DeleteResult = await this.userRepository.delete(id);
      if (user.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo borrar',
        });
      }
      return user;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }
}
