"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Init1748367232817 = void 0;
class Init1748367232817 {
    constructor() {
        this.name = 'Init1748367232817';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "payment_method_for_shipping_cost"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "payment_method_for_shipping_cost" character varying DEFAULT ''`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "payment_method_for_shipping_cost"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "payment_method_for_shipping_cost" double precision DEFAULT '0'`);
    }
}
exports.Init1748367232817 = Init1748367232817;
//# sourceMappingURL=1748367232817-init.js.map