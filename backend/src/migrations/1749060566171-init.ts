import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1749060566171 implements MigrationInterface {
    name = 'Init1749060566171'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "settings" ADD "promotional_sets" jsonb DEFAULT '[]'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "settings" DROP COLUMN "promotional_sets"`);
    }

}
