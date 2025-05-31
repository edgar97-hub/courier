"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Init1748663933320 = void 0;
class Init1748663933320 {
    constructor() {
        this.name = 'Init1748663933320';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710"`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username")`);
    }
}
exports.Init1748663933320 = Init1748663933320;
//# sourceMappingURL=1748663933320-init.js.map