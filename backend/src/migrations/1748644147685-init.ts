import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1748644147685 implements MigrationInterface {
    name = 'Init1748644147685'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "name_account_number_owner" character varying NOT NULL DEFAULT ''`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "name_account_number_owner"`);
    }

}
