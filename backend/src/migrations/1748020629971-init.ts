import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1748020629971 implements MigrationInterface {
    name = 'Init1748020629971'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "settings" ADD "excel_import_template_url" character varying NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "settings" ADD "coverage_map_url" character varying NOT NULL DEFAULT ''`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "settings" DROP COLUMN "coverage_map_url"`);
        await queryRunner.query(`ALTER TABLE "settings" DROP COLUMN "excel_import_template_url"`);
    }

}
