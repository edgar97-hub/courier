"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Init1748644147685 = void 0;
class Init1748644147685 {
    constructor() {
        this.name = 'Init1748644147685';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "users" ADD "name_account_number_owner" character varying NOT NULL DEFAULT ''`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "name_account_number_owner"`);
    }
}
exports.Init1748644147685 = Init1748644147685;
//# sourceMappingURL=1748644147685-init.js.map