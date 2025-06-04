"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Init1749060566171 = void 0;
class Init1749060566171 {
    constructor() {
        this.name = 'Init1749060566171';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "settings" ADD "promotional_sets" jsonb DEFAULT '[]'`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "settings" DROP COLUMN "promotional_sets"`);
    }
}
exports.Init1749060566171 = Init1749060566171;
//# sourceMappingURL=1749060566171-init.js.map