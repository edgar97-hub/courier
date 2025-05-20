import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1747454915873 implements MigrationInterface {
    name = 'Init1747454915873'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "districts" ADD "weight_from" double precision NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "districts" ADD "weight_to" double precision NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "districts" DROP COLUMN "weight_to"`);
        await queryRunner.query(`ALTER TABLE "districts" DROP COLUMN "weight_from"`);
    }

}
