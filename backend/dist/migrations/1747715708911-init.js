"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Init1747715708911 = void 0;
class Init1747715708911 {
    constructor() {
        this.name = 'Init1747715708911';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "settings" ADD "terms_conditions_url" character varying DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "settings" ALTER COLUMN "logo_url" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "settings" ALTER COLUMN "logo_url" SET DEFAULT ''`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "settings" ALTER COLUMN "logo_url" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "settings" ALTER COLUMN "logo_url" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "settings" DROP COLUMN "terms_conditions_url"`);
    }
}
exports.Init1747715708911 = Init1747715708911;
//# sourceMappingURL=1747715708911-init.js.map