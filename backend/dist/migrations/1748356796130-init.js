"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Init1748356796130 = void 0;
class Init1748356796130 {
    constructor() {
        this.name = 'Init1748356796130';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "orders" ADD "product_delivery_photo_url" character varying DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "payment_method_for_shipping_cost"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "payment_method_for_shipping_cost" double precision DEFAULT '0'`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "payment_method_for_shipping_cost"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "payment_method_for_shipping_cost" character varying DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "product_delivery_photo_url"`);
    }
}
exports.Init1748356796130 = Init1748356796130;
//# sourceMappingURL=1748356796130-init.js.map