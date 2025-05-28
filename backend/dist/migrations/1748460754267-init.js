"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Init1748460754267 = void 0;
class Init1748460754267 {
    constructor() {
        this.name = 'Init1748460754267';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "orders" ADD "customer_id" uuid`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_772d0ce0473ac2ccfa26060dbe9" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_772d0ce0473ac2ccfa26060dbe9"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "customer_id"`);
    }
}
exports.Init1748460754267 = Init1748460754267;
//# sourceMappingURL=1748460754267-init.js.map