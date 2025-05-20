import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1747715708911 implements MigrationInterface {
    name = 'Init1747715708911'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "settings" ADD "terms_conditions_url" character varying DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "settings" ALTER COLUMN "logo_url" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "settings" ALTER COLUMN "logo_url" SET DEFAULT ''`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "settings" ALTER COLUMN "logo_url" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "settings" ALTER COLUMN "logo_url" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "settings" DROP COLUMN "terms_conditions_url"`);
    }

}
