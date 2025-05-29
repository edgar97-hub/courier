"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Init1748552235190 = void 0;
class Init1748552235190 {
    constructor() {
        this.name = 'Init1748552235190';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "settings" ADD "ruc" character varying NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "settings" ALTER COLUMN "address" SET DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "settings" ALTER COLUMN "phone_number" SET DEFAULT ''`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "settings" ALTER COLUMN "phone_number" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "settings" ALTER COLUMN "address" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "settings" DROP COLUMN "ruc"`);
    }
}
exports.Init1748552235190 = Init1748552235190;
//# sourceMappingURL=1748552235190-init.js.map