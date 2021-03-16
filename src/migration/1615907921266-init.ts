import {MigrationInterface, QueryRunner} from "typeorm";

export class init1615907921266 implements MigrationInterface {
    name = 'init1615907921266'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post" ALTER COLUMN "description" SET NOT NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "post"."description" IS NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "post"."description" IS NULL`);
        await queryRunner.query(`ALTER TABLE "post" ALTER COLUMN "description" DROP NOT NULL`);
    }

}
