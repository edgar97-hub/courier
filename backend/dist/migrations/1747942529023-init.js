"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Init1747942529023 = void 0;
class Init1747942529023 {
    constructor() {
        this.name = 'Init1747942529023';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "package_size_type" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "amount_to_collect_at_delivery" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'REGISTRADO'`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "amount_to_collect_at_delivery" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "package_size_type" SET NOT NULL`);
    }
}
exports.Init1747942529023 = Init1747942529023;
//# sourceMappingURL=1747942529023-init.js.map