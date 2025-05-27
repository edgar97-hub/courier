"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Init1748356441007 = void 0;
class Init1748356441007 {
    constructor() {
        this.name = 'Init1748356441007';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "orders" ADD "payment_method_for_shipping_cost" character varying DEFAULT ''`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "payment_method_for_shipping_cost"`);
    }
}
exports.Init1748356441007 = Init1748356441007;
//# sourceMappingURL=1748356441007-init.js.map