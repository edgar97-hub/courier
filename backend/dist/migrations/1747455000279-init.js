"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Init1747455000279 = void 0;
class Init1747455000279 {
    constructor() {
        this.name = 'Init1747455000279';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "districts" DROP COLUMN "price"`);
        await queryRunner.query(`ALTER TABLE "districts" ADD "price" double precision NOT NULL DEFAULT '0'`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "districts" DROP COLUMN "price"`);
        await queryRunner.query(`ALTER TABLE "districts" ADD "price" character varying NOT NULL`);
    }
}
exports.Init1747455000279 = Init1747455000279;
//# sourceMappingURL=1747455000279-init.js.map