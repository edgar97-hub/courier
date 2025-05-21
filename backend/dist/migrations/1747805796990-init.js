"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Init1747805796990 = void 0;
class Init1747805796990 {
    constructor() {
        this.name = 'Init1747805796990';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "payment_method_for_collection" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "observations" DROP NOT NULL`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "observations" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "payment_method_for_collection" SET NOT NULL`);
    }
}
exports.Init1747805796990 = Init1747805796990;
//# sourceMappingURL=1747805796990-init.js.map