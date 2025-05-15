"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Init1747314729183 = void 0;
class Init1747314729183 {
    constructor() {
        this.name = 'Init1747314729183';
    }
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "districts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "price" character varying NOT NULL, CONSTRAINT "PK_972a72ff4e3bea5c7f43a2b98af" PRIMARY KEY ("id"))`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE "districts"`);
    }
}
exports.Init1747314729183 = Init1747314729183;
//# sourceMappingURL=1747314729183-init.js.map