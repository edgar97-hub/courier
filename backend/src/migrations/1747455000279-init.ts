import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1747455000279 implements MigrationInterface {
    name = 'Init1747455000279'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "districts" DROP COLUMN "price"`);
        await queryRunner.query(`ALTER TABLE "districts" ADD "price" double precision NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "districts" DROP COLUMN "price"`);
        await queryRunner.query(`ALTER TABLE "districts" ADD "price" character varying NOT NULL`);
    }

}
