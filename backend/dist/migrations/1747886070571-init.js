"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Init1747886070571 = void 0;
class Init1747886070571 {
    constructor() {
        this.name = 'Init1747886070571';
    }
    async up(queryRunner) {
        await queryRunner.query(`CREATE TYPE "public"."orders_status_enum" AS ENUM('REGISTRADO', 'RECOGIDO', 'EN TRANSITO', 'ENTREGADO', 'CANCELADO')`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "status" "public"."orders_status_enum" NOT NULL`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."orders_status_enum"`);
    }
}
exports.Init1747886070571 = Init1747886070571;
//# sourceMappingURL=1747886070571-init.js.map