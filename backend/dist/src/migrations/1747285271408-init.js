"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Init1747285271408 = void 0;
class Init1747285271408 {
    constructor() {
        this.name = 'Init1747285271408';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "first_name"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "last_name"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "age"`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "users" ADD "age" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD "last_name" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD "first_name" character varying NOT NULL`);
    }
}
exports.Init1747285271408 = Init1747285271408;
//# sourceMappingURL=1747285271408-init.js.map