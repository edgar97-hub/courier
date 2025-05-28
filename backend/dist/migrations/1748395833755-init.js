"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Init1748395833755 = void 0;
class Init1748395833755 {
    constructor() {
        this.name = 'Init1748395833755';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TYPE "public"."users_role_enum" RENAME TO "users_role_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('ADMINISTRADOR', 'CLIENTE', 'MOTORIZADO', 'RECEPCIONISTA')`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" TYPE "public"."users_role_enum" USING "role"::"text"::"public"."users_role_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum_old"`);
    }
    async down(queryRunner) {
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum_old" AS ENUM('ADMIN', 'CUSTOMER', 'MOTORIZED', 'RECEPTIONIST')`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" TYPE "public"."users_role_enum_old" USING "role"::"text"::"public"."users_role_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."users_role_enum_old" RENAME TO "users_role_enum"`);
    }
}
exports.Init1748395833755 = Init1748395833755;
//# sourceMappingURL=1748395833755-init.js.map