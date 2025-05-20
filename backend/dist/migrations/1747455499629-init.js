"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Init1747455499629 = void 0;
class Init1747455499629 {
    constructor() {
        this.name = 'Init1747455499629';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "districts" ADD "is_standard" boolean NOT NULL DEFAULT false`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "districts" DROP COLUMN "is_standard"`);
    }
}
exports.Init1747455499629 = Init1747455499629;
//# sourceMappingURL=1747455499629-init.js.map