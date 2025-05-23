import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1747886070571 implements MigrationInterface {
    name = 'Init1747886070571'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."orders_status_enum" AS ENUM('REGISTRADO', 'RECOGIDO', 'EN TRANSITO', 'ENTREGADO', 'CANCELADO')`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "status" "public"."orders_status_enum" NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."orders_status_enum"`);
    }

}
