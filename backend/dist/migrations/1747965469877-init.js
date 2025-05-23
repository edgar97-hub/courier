"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Init1747965469877 = void 0;
class Init1747965469877 {
    constructor() {
        this.name = 'Init1747965469877';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "assumes_5_percent_pos"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "assumes_5_percent_pos" boolean NOT NULL DEFAULT false`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "assumes_5_percent_pos"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "assumes_5_percent_pos" character varying NOT NULL DEFAULT ''`);
    }
}
exports.Init1747965469877 = Init1747965469877;
//# sourceMappingURL=1747965469877-init.js.map