"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Init1748291041849 = void 0;
class Init1748291041849 {
    constructor() {
        this.name = 'Init1748291041849';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "UQ_2db49e09e0f0475e2171a502e0f"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "tracking_code"`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "orders" ADD "tracking_code" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "UQ_2db49e09e0f0475e2171a502e0f" UNIQUE ("tracking_code")`);
    }
}
exports.Init1748291041849 = Init1748291041849;
//# sourceMappingURL=1748291041849-init.js.map