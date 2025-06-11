"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Init1749680124563 = void 0;
class Init1749680124563 {
    constructor() {
        this.name = 'Init1749680124563';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TYPE "public"."orders_status_enum" RENAME TO "orders_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."orders_status_enum" AS ENUM('REGISTRADO', 'RECOGIDO', 'EN ALMACEN', 'EN TRANSITO', 'ENTREGADO', 'CANCELADO', 'ANULADO', 'RECHAZADO EN PUNTO', 'REPROGRAMADO')`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "status" TYPE "public"."orders_status_enum" USING "status"::"text"::"public"."orders_status_enum"`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'REGISTRADO'`);
        await queryRunner.query(`DROP TYPE "public"."orders_status_enum_old"`);
    }
    async down(queryRunner) {
        await queryRunner.query(`CREATE TYPE "public"."orders_status_enum_old" AS ENUM('REGISTRADO', 'RECOGIDO', 'EN ALMACEN', 'EN TRANSITO', 'ENTREGADO', 'CANCELADO', 'RECHAZADO EN PUNTO', 'REPROGRAMADO')`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "status" TYPE "public"."orders_status_enum_old" USING "status"::"text"::"public"."orders_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'REGISTRADO'`);
        await queryRunner.query(`DROP TYPE "public"."orders_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."orders_status_enum_old" RENAME TO "orders_status_enum"`);
    }
}
exports.Init1749680124563 = Init1749680124563;
//# sourceMappingURL=1749680124563-init.js.map