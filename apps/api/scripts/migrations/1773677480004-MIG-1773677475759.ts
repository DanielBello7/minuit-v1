import { MigrationInterface, QueryRunner } from "typeorm";

export class MIG17736774757591773677480004 implements MigrationInterface {
    name = 'MIG17736774757591773677480004'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_type_enum" AS ENUM('Client', 'Admins')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "index" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "firstname" character varying NOT NULL, "surname" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying, "avatar" character varying, "timezone" character varying NOT NULL, "username" character varying NOT NULL, "display_name" character varying NOT NULL, "type" "public"."users_type_enum" NOT NULL, "is_email_verified" boolean NOT NULL, "has_password" boolean NOT NULL, "refresh_token" character varying, "last_login_date" TIMESTAMP, "dark_mode" boolean NOT NULL, "is_onboarded" boolean NOT NULL, CONSTRAINT "UQ_c9d080535db79bcaaf24931e551" UNIQUE ("index"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."transactions_type_enum" AS ENUM('REFUNDS', 'PAYMENT')`);
        await queryRunner.query(`CREATE TYPE "public"."transactions_status_enum" AS ENUM('PENDING', 'COMPLETED', 'FAILED', 'EXPIRED', 'PROCESSING')`);
        await queryRunner.query(`CREATE TABLE "transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "index" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "narration" character varying, "user_id" uuid NOT NULL, "charge" numeric(20,2) NOT NULL, "amount" numeric(20,2) NOT NULL, "currency_code" character varying NOT NULL, "gateway" character varying, "method" character varying, "type" "public"."transactions_type_enum" NOT NULL, "status" "public"."transactions_status_enum" NOT NULL, "metadata" jsonb NOT NULL, "expires_at" TIMESTAMP NOT NULL, CONSTRAINT "UQ_1b330ec1c9f6f7d686571bcf160" UNIQUE ("index"), CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."subscriptions_duration_period_enum" AS ENUM('MONTHS', 'YEARS', 'DAYS', 'WEEKS')`);
        await queryRunner.query(`CREATE TABLE "subscriptions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "index" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "transaction_id" uuid NOT NULL, "user_id" uuid NOT NULL, "package_id" uuid NOT NULL, "currency_code" character varying NOT NULL, "amount" numeric(20,2) NOT NULL, "charge" numeric(20,2) NOT NULL, "duration" integer NOT NULL, "duration_period" "public"."subscriptions_duration_period_enum" NOT NULL, "expires_at" TIMESTAMP NOT NULL, "last_used_at" TIMESTAMP, "used_at" TIMESTAMP, CONSTRAINT "UQ_f1f5973568c9a778eb7211753c2" UNIQUE ("index"), CONSTRAINT "PK_a87248d73155605cf782be9ee5e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "hubs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "index" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "user_id" uuid NOT NULL, "subscription_id" uuid NOT NULL, "active_at" TIMESTAMP NOT NULL, CONSTRAINT "UQ_6acbb5f0f42e3fe409120d394a1" UNIQUE ("index"), CONSTRAINT "REL_1531a036c5d3522a694d869914" UNIQUE ("user_id"), CONSTRAINT "REL_29d43aac2dcd6406e783524056" UNIQUE ("subscription_id"), CONSTRAINT "PK_44b53d1f2b4568b26ce4710b843" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "settings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "index" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "version" character varying NOT NULL, "max_free_alarms" integer NOT NULL DEFAULT '1', "max_free_clocks" integer NOT NULL DEFAULT '3', "currencies" jsonb NOT NULL DEFAULT '[]', "transaction_expiry_hours" integer NOT NULL DEFAULT '6', "charges" jsonb NOT NULL, CONSTRAINT "UQ_40aac8ed58e4f3713b268f3a8d9" UNIQUE ("index"), CONSTRAINT "unique_singleton" UNIQUE ("id"), CONSTRAINT "PK_0669fe20e252eb692bf4d344975" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."packages_type_enum" AS ENUM('PAID', 'FREE')`);
        await queryRunner.query(`CREATE TYPE "public"."packages_duration_period_enum" AS ENUM('MONTHS', 'YEARS', 'DAYS', 'WEEKS')`);
        await queryRunner.query(`CREATE TABLE "packages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "index" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "pricings" jsonb NOT NULL DEFAULT '[]', "title" character varying NOT NULL, "description" character varying NOT NULL, "features" jsonb NOT NULL DEFAULT '[]', "duration" integer NOT NULL, "admin_id" uuid NOT NULL, "type" "public"."packages_type_enum" NOT NULL, "duration_period" "public"."packages_duration_period_enum" NOT NULL, CONSTRAINT "UQ_0918dde77d5b895072f6d9df48f" UNIQUE ("index"), CONSTRAINT "PK_020801f620e21f943ead9311c98" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "feedbacks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "index" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "user_id" uuid, "name" character varying NOT NULL, "message" character varying NOT NULL, "rating" integer NOT NULL DEFAULT '0', CONSTRAINT "UQ_ddad9ad007c64c0e124158f4e19" UNIQUE ("index"), CONSTRAINT "PK_79affc530fdd838a9f1e0cc30be" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."clocks_format_enum" AS ENUM('DIGITAL', 'ANALOG')`);
        await queryRunner.query(`CREATE TABLE "clocks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "index" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "user_id" uuid NOT NULL, "city" character varying NOT NULL, "region" character varying NOT NULL, "country" character varying NOT NULL, "timezone" character varying NOT NULL, "format" "public"."clocks_format_enum" NOT NULL, "is_active" boolean NOT NULL, "title" character varying, "description" character varying, "theme" character varying, CONSTRAINT "UQ_7644fa080267dcb7cfecc857721" UNIQUE ("index"), CONSTRAINT "UQ_4b73aaa07264752d66870e9f513" UNIQUE ("user_id", "city"), CONSTRAINT "PK_6d0ea9761dab0136878c6ddffee" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."otps_purpose_enum" AS ENUM('LOGIN', 'RECOVERY', 'VERIFY')`);
        await queryRunner.query(`CREATE TABLE "otps" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "index" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "value" character varying(6) NOT NULL, "email" character varying NOT NULL, "purpose" "public"."otps_purpose_enum" NOT NULL, "expires_at" TIMESTAMP NOT NULL, CONSTRAINT "UQ_f4e31ff1c6dd486903065317515" UNIQUE ("index"), CONSTRAINT "UQ_10b310ef149685965bc39b8cf74" UNIQUE ("value"), CONSTRAINT "PK_91fef5ed60605b854a2115d2410" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "alarms" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "index" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "user_id" uuid NOT NULL, "ring_at" jsonb NOT NULL DEFAULT '[]', "is_active" boolean NOT NULL, "city" character varying NOT NULL, "country" character varying NOT NULL, "region" character varying NOT NULL, "timezone" character varying NOT NULL, CONSTRAINT "UQ_e6b70b3747d6cabea2874dea058" UNIQUE ("index"), CONSTRAINT "PK_b776da486fb19d38b4f7777a6da" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."admins_level_enum" AS ENUM('MASTER', 'RESIDENT')`);
        await queryRunner.query(`CREATE TABLE "admins" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "index" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "user_id" uuid NOT NULL, "level" "public"."admins_level_enum" NOT NULL, CONSTRAINT "UQ_01cb0563256e07b4b32fb916397" UNIQUE ("index"), CONSTRAINT "REL_2b901dd818a2a6486994d915a6" UNIQUE ("user_id"), CONSTRAINT "PK_e3b38270c97a854c48d2e80874e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_e9acc6efa76de013e8c1553ed2b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "hubs" ADD CONSTRAINT "FK_1531a036c5d3522a694d8699147" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "hubs" ADD CONSTRAINT "FK_29d43aac2dcd6406e7835240566" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "feedbacks" ADD CONSTRAINT "FK_4334f6be2d7d841a9d5205a100e" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "alarms" ADD CONSTRAINT "FK_83b18ceba9167238d5c9dcde470" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "admins" ADD CONSTRAINT "FK_2b901dd818a2a6486994d915a68" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "admins" DROP CONSTRAINT "FK_2b901dd818a2a6486994d915a68"`);
        await queryRunner.query(`ALTER TABLE "alarms" DROP CONSTRAINT "FK_83b18ceba9167238d5c9dcde470"`);
        await queryRunner.query(`ALTER TABLE "feedbacks" DROP CONSTRAINT "FK_4334f6be2d7d841a9d5205a100e"`);
        await queryRunner.query(`ALTER TABLE "hubs" DROP CONSTRAINT "FK_29d43aac2dcd6406e7835240566"`);
        await queryRunner.query(`ALTER TABLE "hubs" DROP CONSTRAINT "FK_1531a036c5d3522a694d8699147"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_e9acc6efa76de013e8c1553ed2b"`);
        await queryRunner.query(`DROP TABLE "admins"`);
        await queryRunner.query(`DROP TYPE "public"."admins_level_enum"`);
        await queryRunner.query(`DROP TABLE "alarms"`);
        await queryRunner.query(`DROP TABLE "otps"`);
        await queryRunner.query(`DROP TYPE "public"."otps_purpose_enum"`);
        await queryRunner.query(`DROP TABLE "clocks"`);
        await queryRunner.query(`DROP TYPE "public"."clocks_format_enum"`);
        await queryRunner.query(`DROP TABLE "feedbacks"`);
        await queryRunner.query(`DROP TABLE "packages"`);
        await queryRunner.query(`DROP TYPE "public"."packages_duration_period_enum"`);
        await queryRunner.query(`DROP TYPE "public"."packages_type_enum"`);
        await queryRunner.query(`DROP TABLE "settings"`);
        await queryRunner.query(`DROP TABLE "hubs"`);
        await queryRunner.query(`DROP TABLE "subscriptions"`);
        await queryRunner.query(`DROP TYPE "public"."subscriptions_duration_period_enum"`);
        await queryRunner.query(`DROP TABLE "transactions"`);
        await queryRunner.query(`DROP TYPE "public"."transactions_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."transactions_type_enum"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_type_enum"`);
    }

}
