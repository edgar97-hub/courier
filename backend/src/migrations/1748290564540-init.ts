import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1748290564540 implements MigrationInterface {
    name = 'Init1748290564540'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ADD "tracking_code" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "UQ_2db49e09e0f0475e2171a502e0f" UNIQUE ("tracking_code")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "UQ_2db49e09e0f0475e2171a502e0f"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "tracking_code"`);
    }

}
