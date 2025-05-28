import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1748405278099 implements MigrationInterface {
    name = 'Init1748405278099'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "photo_url" character varying NOT NULL DEFAULT ''`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "photo_url"`);
    }

}
