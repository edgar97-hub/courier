import { FulfillmentService } from '../services/products.service';
import { CreateFulfillmentProductDto } from '../dto/create-fulfillment-product.dto';
export declare class ProductsController {
    private readonly fulfillmentService;
    constructor(fulfillmentService: FulfillmentService);
    create(dto: CreateFulfillmentProductDto): Promise<import("../entities/fulfillment-product.entity").FulfillmentProductEntity>;
    findProductNames(): Promise<string[]>;
    findVariationValues(): Promise<{
        colors: string[];
        sizes: string[];
        models: string[];
    }>;
    findAll(): Promise<import("../entities/fulfillment-product.entity").FulfillmentProductEntity[]>;
    findProductsPaginated(page_number?: number, page_size?: number, sort_field?: string, sort_direction?: 'ASC' | 'DESC', search_term?: string): Promise<import("../services/products.service").PaginatedProducts>;
    findOne(id: string): Promise<import("../entities/fulfillment-product.entity").FulfillmentProductEntity>;
    update(id: string, dto: Partial<CreateFulfillmentProductDto>): Promise<import("../entities/fulfillment-product.entity").FulfillmentProductEntity>;
    remove(id: string): Promise<void>;
}
