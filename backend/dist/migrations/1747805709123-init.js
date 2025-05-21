"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Init1747805709123 = void 0;
class Init1747805709123 {
    constructor() {
        this.name = 'Init1747805709123';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "payment_method_for_collection" SET DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "observations" SET DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "type_order_transfer_to_warehouse" SET DEFAULT ''`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "type_order_transfer_to_warehouse" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "observations" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "payment_method_for_collection" DROP DEFAULT`);
    }
}
exports.Init1747805709123 = Init1747805709123;
//# sourceMappingURL=1747805709123-init.js.map