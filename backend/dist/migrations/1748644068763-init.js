"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Init1748644068763 = void 0;
class Init1748644068763 {
    constructor() {
        this.name = 'Init1748644068763';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "users" ADD "owner_account_number" character varying NOT NULL DEFAULT ''`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "owner_account_number"`);
    }
}
exports.Init1748644068763 = Init1748644068763;
//# sourceMappingURL=1748644068763-init.js.map