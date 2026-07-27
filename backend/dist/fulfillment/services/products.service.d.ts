import { Repository } from 'typeorm';
import { FulfillmentProductEntity } from '../entities/fulfillment-product.entity';
import { ProductVariationEntity } from '../entities/product-variation.entity';
import { CreateFulfillmentProductDto } from '../dto/create-fulfillment-product.dto';
export interface PaginatedProducts {
    items: FulfillmentProductEntity[];
    total_count: number;
    page_number: number;
    page_size: number;
}
export declare class FulfillmentService {
    private readonly productRepository;
    private readonly variationRepository;
    constructor(productRepository: Repository<FulfillmentProductEntity>, variationRepository: Repository<ProductVariationEntity>);
    create(dto: CreateFulfillmentProductDto): Promise<FulfillmentProductEntity>;
    findAll(): Promise<FulfillmentProductEntity[]>;
    findProductsPaginated(options: {
        page_number: number;
        page_size: number;
        sort_field: string;
        sort_direction: 'ASC' | 'DESC';
        search_term: string;
    }): Promise<PaginatedProducts>;
    findDistinctProductNames(): Promise<string[]>;
    findDistinctVariationValues(): Promise<{
        colors: string[];
        sizes: string[];
        models: string[];
    }>;
    findOne(id: string): Promise<FulfillmentProductEntity>;
    update(id: string, dto: Partial<CreateFulfillmentProductDto>): Promise<FulfillmentProductEntity>;
    remove(id: string): Promise<void>;
}
