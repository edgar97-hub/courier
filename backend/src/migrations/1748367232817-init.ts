import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1748367232817 implements MigrationInterface {
    name = 'Init1748367232817'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "payment_method_for_shipping_cost"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "payment_method_for_shipping_cost" character varying DEFAULT ''`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "payment_method_for_shipping_cost"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "payment_method_for_shipping_cost" double precision DEFAULT '0'`);
    }

}
