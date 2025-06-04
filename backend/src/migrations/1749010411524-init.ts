import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1749010411524 implements MigrationInterface {
    name = 'Init1749010411524'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ADD "observation_shipping_cost_modification" character varying`);
        await queryRunner.query(`ALTER TABLE "settings" ADD "global_notice_image_url" character varying NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "product_delivery_photo_url" DROP DEFAULT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "product_delivery_photo_url" SET DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "settings" DROP COLUMN "global_notice_image_url"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "observation_shipping_cost_modification"`);
    }

}
