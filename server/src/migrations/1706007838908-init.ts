import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1706007838908 implements MigrationInterface {
    name = 'Init1706007838908'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "industry" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_fc3e38485cff79e9fbba8f13831" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_e756cbed5e9f27221c238f11fc" ON "industry" ("name") `);
        await queryRunner.query(`CREATE TABLE "keyword" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_affdb8c8fa5b442900cb3aa21dc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_c37917986ab4672d78f5e037ec" ON "keyword" ("name") `);
        await queryRunner.query(`CREATE TABLE "company" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "website_url" character varying, "linkedin_url" character varying, "tagline" character varying, "about" character varying, "year_founded" integer, "locality" character varying, "country" character varying, "employee_count_est" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "industry_id" integer, CONSTRAINT "PK_056f7854a7afdba7cbd6d45fc20" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_a76c5cd486f7779bd9c319afd2" ON "company" ("name") `);
        await queryRunner.query(`CREATE TABLE "company_keywords_keyword" ("company_id" integer NOT NULL, "keyword_id" integer NOT NULL, CONSTRAINT "PK_2ebfb02de6b47cf995691ae6116" PRIMARY KEY ("company_id", "keyword_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_1b9c171689c1260dc96b3b59cb" ON "company_keywords_keyword" ("company_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_6276c2a4536c4c68a3e7d3dca2" ON "company_keywords_keyword" ("keyword_id") `);
        await queryRunner.query(`ALTER TABLE "company" ADD CONSTRAINT "FK_015377d525f607f1bc310cc1f11" FOREIGN KEY ("industry_id") REFERENCES "industry"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "company_keywords_keyword" ADD CONSTRAINT "FK_1b9c171689c1260dc96b3b59cb0" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "company_keywords_keyword" ADD CONSTRAINT "FK_6276c2a4536c4c68a3e7d3dca2b" FOREIGN KEY ("keyword_id") REFERENCES "keyword"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "company_keywords_keyword" DROP CONSTRAINT "FK_6276c2a4536c4c68a3e7d3dca2b"`);
        await queryRunner.query(`ALTER TABLE "company_keywords_keyword" DROP CONSTRAINT "FK_1b9c171689c1260dc96b3b59cb0"`);
        await queryRunner.query(`ALTER TABLE "company" DROP CONSTRAINT "FK_015377d525f607f1bc310cc1f11"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6276c2a4536c4c68a3e7d3dca2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1b9c171689c1260dc96b3b59cb"`);
        await queryRunner.query(`DROP TABLE "company_keywords_keyword"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a76c5cd486f7779bd9c319afd2"`);
        await queryRunner.query(`DROP TABLE "company"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c37917986ab4672d78f5e037ec"`);
        await queryRunner.query(`DROP TABLE "keyword"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e756cbed5e9f27221c238f11fc"`);
        await queryRunner.query(`DROP TABLE "industry"`);
    }

}
