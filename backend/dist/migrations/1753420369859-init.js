"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Init1753420369859 = void 0;
class Init1753420369859 {
    constructor() {
        this.name = 'Init1753420369859';
    }
    async up(queryRunner) {
        await queryRunner.query(`CREATE TYPE "public"."cash_management_type_movement_enum" AS ENUM('INGRESO', 'EGRESO')`);
        await queryRunner.query(`CREATE TABLE "cash_management" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT now(), "code" SERIAL NOT NULL, "date" date, "amount" double precision NOT NULL DEFAULT '0', "type_movement" "public"."cash_management_type_movement_enum" NOT NULL DEFAULT 'INGRESO', "payments_method" character varying DEFAULT '', "description" character varying DEFAULT '', "user_id" uuid, "order_id" uuid, CONSTRAINT "UQ_7d22b249b4c1f0d14d65fa55ab1" UNIQUE ("code"), CONSTRAINT "PK_382e7d9e6f70d3beec123f79ee1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "cash_management" ADD CONSTRAINT "FK_32b886473b05a211d4e816f3556" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cash_management" ADD CONSTRAINT "FK_72da3903be1f3a6abeeb359884e" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "cash_management" DROP CONSTRAINT "FK_72da3903be1f3a6abeeb359884e"`);
        await queryRunner.query(`ALTER TABLE "cash_management" DROP CONSTRAINT "FK_32b886473b05a211d4e816f3556"`);
        await queryRunner.query(`DROP TABLE "cash_management"`);
        await queryRunner.query(`DROP TYPE "public"."cash_management_type_movement_enum"`);
    }
}
exports.Init1753420369859 = Init1753420369859;
//# sourceMappingURL=1753420369859-init.js.map