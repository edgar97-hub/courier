"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Init1747805816045 = void 0;
class Init1747805816045 {
    constructor() {
        this.name = 'Init1747805816045';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "payment_method_for_collection" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "observations" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "type_order_transfer_to_warehouse" DROP NOT NULL`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "type_order_transfer_to_warehouse" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "observations" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "payment_method_for_collection" SET NOT NULL`);
    }
}
exports.Init1747805816045 = Init1747805816045;
//# sourceMappingURL=1747805816045-init.js.map