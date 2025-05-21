"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Init1747805406026 = void 0;
class Init1747805406026 {
    constructor() {
        this.name = 'Init1747805406026';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "payment_method_for_collection"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "payment_method_for_collection" character varying NOT NULL`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "payment_method_for_collection"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "payment_method_for_collection" double precision NOT NULL DEFAULT '0'`);
    }
}
exports.Init1747805406026 = Init1747805406026;
//# sourceMappingURL=1747805406026-init.js.map