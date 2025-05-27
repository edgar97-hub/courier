import { MigrationInterface, QueryRunner } from "typeorm";
export declare class Init1748367232817 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
