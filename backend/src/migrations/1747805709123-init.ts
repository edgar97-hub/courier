import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1747805709123 implements MigrationInterface {
    name = 'Init1747805709123'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "payment_method_for_collection" SET DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "observations" SET DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "type_order_transfer_to_warehouse" SET DEFAULT ''`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "type_order_transfer_to_warehouse" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "observations" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "payment_method_for_collection" DROP DEFAULT`);
    }

}
