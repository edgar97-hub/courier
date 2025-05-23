"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Init1747942291006 = void 0;
class Init1747942291006 {
    constructor() {
        this.name = 'Init1747942291006';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "delivery_coordinates" DROP NOT NULL`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "delivery_coordinates" SET NOT NULL`);
    }
}
exports.Init1747942291006 = Init1747942291006;
//# sourceMappingURL=1747942291006-init.js.map