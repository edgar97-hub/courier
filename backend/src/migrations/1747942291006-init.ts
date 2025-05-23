import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1747942291006 implements MigrationInterface {
    name = 'Init1747942291006'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "delivery_coordinates" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "delivery_coordinates" SET NOT NULL`);
    }

}
