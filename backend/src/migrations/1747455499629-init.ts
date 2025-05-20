import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1747455499629 implements MigrationInterface {
    name = 'Init1747455499629'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "districts" ADD "is_standard" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "districts" DROP COLUMN "is_standard"`);
    }

}
