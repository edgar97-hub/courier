import { MigrationInterface, QueryRunner } from "typeorm";
export declare class Init1748021349797 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
