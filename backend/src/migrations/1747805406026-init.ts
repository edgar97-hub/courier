import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1747805406026 implements MigrationInterface {
    name = 'Init1747805406026'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "payment_method_for_collection"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "payment_method_for_collection" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "payment_method_for_collection"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "payment_method_for_collection" double precision NOT NULL DEFAULT '0'`);
    }

}
