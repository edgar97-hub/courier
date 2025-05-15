"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Init1747318072180 = void 0;
class Init1747318072180 {
    constructor() {
        this.name = 'Init1747318072180';
    }
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "settings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "business_name" character varying NOT NULL, "address" character varying NOT NULL, "phone_number" character varying NOT NULL, "logo_url" character varying NOT NULL, CONSTRAINT "PK_0669fe20e252eb692bf4d344975" PRIMARY KEY ("id"))`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE "settings"`);
    }
}
exports.Init1747318072180 = Init1747318072180;
//# sourceMappingURL=1747318072180-init.js.map