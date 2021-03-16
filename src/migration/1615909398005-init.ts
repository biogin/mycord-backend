import {MigrationInterface, QueryRunner} from "typeorm";

export class init1615909398005 implements MigrationInterface {
    name = 'init1615909398005'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "like_likedentitytype_enum" AS ENUM('comment', 'post')`);
        await queryRunner.query(`CREATE TABLE "like" ("id" SERIAL NOT NULL, "likedEntityType" "like_likedentitytype_enum" NOT NULL, "postId" integer, "commentId" integer, "userId" integer, CONSTRAINT "REL_e8fb739f08d47955a39850fac2" UNIQUE ("userId"), CONSTRAINT "PK_eff3e46d24d416b52a7e0ae4159" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "post" ("id" SERIAL NOT NULL, "description" character varying(1000) NOT NULL DEFAULT '', "title" character varying(100) NOT NULL DEFAULT '', "audioUrl" text NOT NULL DEFAULT '', "userId" integer, CONSTRAINT "PK_be5fda3aac270b134ff9c21cdee" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "profile" ("id" SERIAL NOT NULL, "name" character varying(256) NOT NULL, "password" text NOT NULL, "imageUrl" text NOT NULL, "email" character varying(256) NOT NULL, CONSTRAINT "PK_3dd8bfc97e4a77c70971591bdcb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "profileId" integer, CONSTRAINT "REL_9466682df91534dd95e4dbaa61" UNIQUE ("profileId"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "comment" ("id" SERIAL NOT NULL, "text" character varying(1000) NOT NULL DEFAULT '', "postId" integer, CONSTRAINT "PK_0b0e4bbc8415ec426f87f3a88e2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "like" ADD CONSTRAINT "FK_3acf7c55c319c4000e8056c1279" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "like" ADD CONSTRAINT "FK_d86e0a3eeecc21faa0da415a18a" FOREIGN KEY ("commentId") REFERENCES "comment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "like" ADD CONSTRAINT "FK_e8fb739f08d47955a39850fac23" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post" ADD CONSTRAINT "FK_5c1cf55c308037b5aca1038a131" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_9466682df91534dd95e4dbaa616" FOREIGN KEY ("profileId") REFERENCES "profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_94a85bb16d24033a2afdd5df060" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_94a85bb16d24033a2afdd5df060"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_9466682df91534dd95e4dbaa616"`);
        await queryRunner.query(`ALTER TABLE "post" DROP CONSTRAINT "FK_5c1cf55c308037b5aca1038a131"`);
        await queryRunner.query(`ALTER TABLE "like" DROP CONSTRAINT "FK_e8fb739f08d47955a39850fac23"`);
        await queryRunner.query(`ALTER TABLE "like" DROP CONSTRAINT "FK_d86e0a3eeecc21faa0da415a18a"`);
        await queryRunner.query(`ALTER TABLE "like" DROP CONSTRAINT "FK_3acf7c55c319c4000e8056c1279"`);
        await queryRunner.query(`DROP TABLE "comment"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "profile"`);
        await queryRunner.query(`DROP TABLE "post"`);
        await queryRunner.query(`DROP TABLE "like"`);
        await queryRunner.query(`DROP TYPE "like_likedentitytype_enum"`);
    }

}
