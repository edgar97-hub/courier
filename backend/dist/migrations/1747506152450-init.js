"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Init1747506152450 = void 0;
class Init1747506152450 {
    constructor() {
        this.name = 'Init1747506152450';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "settings" ADD "standard_measurements_width" double precision NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "settings" ADD "standard_measurements_height" double precision NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "settings" ADD "standard_measurements_length" double precision NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "settings" ADD "standard_measurements_weight" double precision NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "settings" ADD "maximum_measurements_width" double precision NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "settings" ADD "maximum_measurements_height" double precision NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "settings" ADD "maximum_measurements_length" double precision NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "settings" ADD "maximum_measurements_weight" double precision NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "settings" ADD "volumetric_factor" double precision NOT NULL DEFAULT '0'`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "settings" DROP COLUMN "volumetric_factor"`);
        await queryRunner.query(`ALTER TABLE "settings" DROP COLUMN "maximum_measurements_weight"`);
        await queryRunner.query(`ALTER TABLE "settings" DROP COLUMN "maximum_measurements_length"`);
        await queryRunner.query(`ALTER TABLE "settings" DROP COLUMN "maximum_measurements_height"`);
        await queryRunner.query(`ALTER TABLE "settings" DROP COLUMN "maximum_measurements_width"`);
        await queryRunner.query(`ALTER TABLE "settings" DROP COLUMN "standard_measurements_weight"`);
        await queryRunner.query(`ALTER TABLE "settings" DROP COLUMN "standard_measurements_length"`);
        await queryRunner.query(`ALTER TABLE "settings" DROP COLUMN "standard_measurements_height"`);
        await queryRunner.query(`ALTER TABLE "settings" DROP COLUMN "standard_measurements_width"`);
    }
}
exports.Init1747506152450 = Init1747506152450;
//# sourceMappingURL=1747506152450-init.js.map