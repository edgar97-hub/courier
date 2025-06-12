"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Init1749743209593 = void 0;
class Init1749743209593 {
    constructor() {
        this.name = 'Init1749743209593';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "delivery_date"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "delivery_date" date`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "delivery_date"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "delivery_date" TIMESTAMP`);
    }
}
exports.Init1749743209593 = Init1749743209593;
//# sourceMappingURL=1749743209593-init.js.map