-- AlterTable
CREATE SEQUENCE adminsession_id_seq;
ALTER TABLE "AdminSession" ALTER COLUMN "id" SET DEFAULT nextval('adminsession_id_seq');
ALTER SEQUENCE adminsession_id_seq OWNED BY "AdminSession"."id";
