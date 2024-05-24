-- AlterTable
CREATE SEQUENCE university_id_seq;
ALTER TABLE "University" ALTER COLUMN "id" SET DEFAULT nextval('university_id_seq');
ALTER SEQUENCE university_id_seq OWNED BY "University"."id";
