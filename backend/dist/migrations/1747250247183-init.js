"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Init1747250247183 = void 0;
class Init1747250247183 {
    constructor() {
        this.name = 'Init1747250247183';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TYPE "public"."users_role_enum" RENAME TO "users_role_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('ADMIN', 'CUSTOMER', 'MOTORIZADO')`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" TYPE "public"."users_role_enum" USING "role"::"text"::"public"."users_role_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum_old"`);
    }
    async down(queryRunner) {
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum_old" AS ENUM('BASIC', 'CREATOR', 'ADMIN')`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" TYPE "public"."users_role_enum_old" USING "role"::"text"::"public"."users_role_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."users_role_enum_old" RENAME TO "users_role_enum"`);
    }
}
exports.Init1747250247183 = Init1747250247183;
//# sourceMappingURL=1747250247183-init.js.map