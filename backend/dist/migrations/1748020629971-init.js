"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Init1748020629971 = void 0;
class Init1748020629971 {
    constructor() {
        this.name = 'Init1748020629971';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "settings" ADD "excel_import_template_url" character varying NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "settings" ADD "coverage_map_url" character varying NOT NULL DEFAULT ''`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "settings" DROP COLUMN "coverage_map_url"`);
        await queryRunner.query(`ALTER TABLE "settings" DROP COLUMN "excel_import_template_url"`);
    }
}
exports.Init1748020629971 = Init1748020629971;
//# sourceMappingURL=1748020629971-init.js.map