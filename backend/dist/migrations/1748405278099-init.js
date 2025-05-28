"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Init1748405278099 = void 0;
class Init1748405278099 {
    constructor() {
        this.name = 'Init1748405278099';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "users" ADD "photo_url" character varying NOT NULL DEFAULT ''`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "photo_url"`);
    }
}
exports.Init1748405278099 = Init1748405278099;
//# sourceMappingURL=1748405278099-init.js.map