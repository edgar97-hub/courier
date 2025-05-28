"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Init1748471747046 = void 0;
class Init1748471747046 {
    constructor() {
        this.name = 'Init1748471747046';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TYPE "public"."orders_status_enum" RENAME TO "orders_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."orders_status_enum" AS ENUM('REGISTRADO', 'RECOGIDO', 'EN ALMACEN', 'EN TRANSITO', 'ENTREGADO', 'CANCELADO', 'RECHAZADO EN PUNTO', 'REPROGRAMADO')`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "status" TYPE "public"."orders_status_enum" USING "status"::"text"::"public"."orders_status_enum"`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'REGISTRADO'`);
        await queryRunner.query(`DROP TYPE "public"."orders_status_enum_old"`);
    }
    async down(queryRunner) {
        await queryRunner.query(`CREATE TYPE "public"."orders_status_enum_old" AS ENUM('REGISTRADO', 'RECOGIDO', 'EN ALMACEN', 'EN TRANSITO', 'ENTREGADO', 'CANCELADO', 'RECHAZADO', 'REPROGRAMADO')`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "status" TYPE "public"."orders_status_enum_old" USING "status"::"text"::"public"."orders_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'REGISTRADO'`);
        await queryRunner.query(`DROP TYPE "public"."orders_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."orders_status_enum_old" RENAME TO "orders_status_enum"`);
    }
}
exports.Init1748471747046 = Init1748471747046;
//# sourceMappingURL=1748471747046-init.js.map