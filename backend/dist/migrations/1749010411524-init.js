"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Init1749010411524 = void 0;
class Init1749010411524 {
    constructor() {
        this.name = 'Init1749010411524';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "orders" ADD "observation_shipping_cost_modification" character varying`);
        await queryRunner.query(`ALTER TABLE "settings" ADD "global_notice_image_url" character varying NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "product_delivery_photo_url" DROP DEFAULT`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "product_delivery_photo_url" SET DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "settings" DROP COLUMN "global_notice_image_url"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "observation_shipping_cost_modification"`);
    }
}
exports.Init1749010411524 = Init1749010411524;
//# sourceMappingURL=1749010411524-init.js.map