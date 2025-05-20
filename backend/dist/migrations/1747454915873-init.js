"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Init1747454915873 = void 0;
class Init1747454915873 {
    constructor() {
        this.name = 'Init1747454915873';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "districts" ADD "weight_from" double precision NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "districts" ADD "weight_to" double precision NOT NULL DEFAULT '0'`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "districts" DROP COLUMN "weight_to"`);
        await queryRunner.query(`ALTER TABLE "districts" DROP COLUMN "weight_from"`);
    }
}
exports.Init1747454915873 = Init1747454915873;
//# sourceMappingURL=1747454915873-init.js.map