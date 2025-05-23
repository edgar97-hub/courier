"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Init1747964592577 = void 0;
class Init1747964592577 {
    constructor() {
        this.name = 'Init1747964592577';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "users" ADD "business_type" character varying NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "users" ADD "business_name" character varying NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "users" ADD "business_district" character varying NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "users" ADD "business_address" character varying NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "users" ADD "business_phone_number" character varying NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "users" ADD "business_sector" character varying NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "users" ADD "business_document_type" character varying NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "users" ADD "business_email" character varying NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "users" ADD "assumes_5_percent_pos" character varying NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "users" ADD "business_document_number" character varying NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "users" ADD "owner_name" character varying NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "users" ADD "owner_phone_number" character varying NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "users" ADD "owner_document_type" character varying NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "users" ADD "owner_document_number" character varying NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "users" ADD "owner_email_address" character varying NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "users" ADD "owner_bank_account" character varying NOT NULL DEFAULT ''`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "owner_bank_account"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "owner_email_address"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "owner_document_number"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "owner_document_type"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "owner_phone_number"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "owner_name"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "business_document_number"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "assumes_5_percent_pos"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "business_email"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "business_document_type"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "business_sector"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "business_phone_number"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "business_address"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "business_district"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "business_name"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "business_type"`);
    }
}
exports.Init1747964592577 = Init1747964592577;
//# sourceMappingURL=1747964592577-init.js.map