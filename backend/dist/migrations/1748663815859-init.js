"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Init1748663815859 = void 0;
class Init1748663815859 {
    constructor() {
        this.name = 'Init1748663815859';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "owner_account_number"`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "users" ADD "owner_account_number" character varying NOT NULL DEFAULT ''`);
    }
}
exports.Init1748663815859 = Init1748663815859;
//# sourceMappingURL=1748663815859-init.js.map