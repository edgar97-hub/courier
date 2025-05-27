import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1748356796130 implements MigrationInterface {
    name = 'Init1748356796130'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ADD "product_delivery_photo_url" character varying DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "payment_method_for_shipping_cost"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "payment_method_for_shipping_cost" double precision DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "payment_method_for_shipping_cost"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "payment_method_for_shipping_cost" character varying DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "product_delivery_photo_url"`);
    }

}
