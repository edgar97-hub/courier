import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1748663815859 implements MigrationInterface {
    name = 'Init1748663815859'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "owner_account_number"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "owner_account_number" character varying NOT NULL DEFAULT ''`);
    }

}
