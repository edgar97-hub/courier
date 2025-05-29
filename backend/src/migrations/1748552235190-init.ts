import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1748552235190 implements MigrationInterface {
    name = 'Init1748552235190'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "settings" ADD "ruc" character varying NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "settings" ALTER COLUMN "address" SET DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "settings" ALTER COLUMN "phone_number" SET DEFAULT ''`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "settings" ALTER COLUMN "phone_number" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "settings" ALTER COLUMN "address" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "settings" DROP COLUMN "ruc"`);
    }

}
