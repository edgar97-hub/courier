import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1747803211057 implements MigrationInterface {
    name = 'Init1747803211057'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "code" SERIAL NOT NULL, "shipment_type" character varying NOT NULL, "recipient_name" character varying NOT NULL, "recipient_phone" character varying NOT NULL, "delivery_district_name" character varying NOT NULL, "delivery_address" character varying NOT NULL, "delivery_coordinates" character varying NOT NULL, "delivery_date" character varying NOT NULL, "package_size_type" character varying NOT NULL, "package_width_cm" double precision NOT NULL DEFAULT '0', "package_length_cm" double precision NOT NULL DEFAULT '0', "package_height_cm" double precision NOT NULL DEFAULT '0', "package_weight_kg" double precision NOT NULL DEFAULT '0', "shipping_cost" double precision NOT NULL DEFAULT '0', "item_description" character varying NOT NULL, "amount_to_collect_at_delivery" double precision NOT NULL DEFAULT '0', "payment_method_for_collection" double precision NOT NULL DEFAULT '0', "observations" character varying NOT NULL, "type_order_transfer_to_warehouse" character varying NOT NULL, "user_id" uuid, CONSTRAINT "UQ_3e413c10c595c04c6c70e58a4dc" UNIQUE ("code"), CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_a922b820eeef29ac1c6800e826a" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_a922b820eeef29ac1c6800e826a"`);
        await queryRunner.query(`DROP TABLE "orders"`);
    }

}
