import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1747965469877 implements MigrationInterface {
    name = 'Init1747965469877'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "assumes_5_percent_pos"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "assumes_5_percent_pos" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "assumes_5_percent_pos"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "assumes_5_percent_pos" character varying NOT NULL DEFAULT ''`);
    }

}
