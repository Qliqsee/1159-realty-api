-- CreateEnum
CREATE TYPE "Country" AS ENUM ('NIGERIA', 'OTHERS');

-- AlterTable: Add capital column to states
ALTER TABLE "states" ADD COLUMN "capital" TEXT;

-- AlterTable: Add new fields to admins
ALTER TABLE "admins" ADD COLUMN "stateId" INTEGER,
ADD COLUMN "country_new" "Country";

-- AlterTable: Add new fields to clients
ALTER TABLE "clients" ADD COLUMN "stateId" INTEGER,
ADD COLUMN "country_new" "Country";

-- Seed 36 Nigerian States with Capitals
INSERT INTO "states" (id, name, capital, "createdAt") VALUES
(1, 'Abia', 'Umuahia', NOW()),
(2, 'Adamawa', 'Yola', NOW()),
(3, 'Akwa Ibom', 'Uyo', NOW()),
(4, 'Anambra', 'Awka', NOW()),
(5, 'Bauchi', 'Bauchi', NOW()),
(6, 'Bayelsa', 'Yenagoa', NOW()),
(7, 'Benue', 'Makurdi', NOW()),
(8, 'Borno', 'Maiduguri', NOW()),
(9, 'Cross River', 'Calabar', NOW()),
(10, 'Delta', 'Asaba', NOW()),
(11, 'Ebonyi', 'Abakaliki', NOW()),
(12, 'Edo', 'Benin City', NOW()),
(13, 'Ekiti', 'Ado Ekiti', NOW()),
(14, 'Enugu', 'Enugu', NOW()),
(15, 'Gombe', 'Gombe', NOW()),
(16, 'Imo', 'Owerri', NOW()),
(17, 'Jigawa', 'Dutse', NOW()),
(18, 'Kaduna', 'Kaduna', NOW()),
(19, 'Kano', 'Kano', NOW()),
(20, 'Katsina', 'Katsina', NOW()),
(21, 'Kebbi', 'Birnin Kebbi', NOW()),
(22, 'Kogi', 'Lokoja', NOW()),
(23, 'Kwara', 'Ilorin', NOW()),
(24, 'Lagos', 'Ikeja', NOW()),
(25, 'Nasarawa', 'Lafia', NOW()),
(26, 'Niger', 'Minna', NOW()),
(27, 'Ogun', 'Abeokuta', NOW()),
(28, 'Ondo', 'Akure', NOW()),
(29, 'Osun', 'Osogbo', NOW()),
(30, 'Oyo', 'Ibadan', NOW()),
(31, 'Plateau', 'Jos', NOW()),
(32, 'Rivers', 'Port Harcourt', NOW()),
(33, 'Sokoto', 'Sokoto', NOW()),
(34, 'Taraba', 'Jalingo', NOW()),
(35, 'Yobe', 'Damaturu', NOW()),
(36, 'Zamfara', 'Gusau', NOW()),
(37, 'FCT', 'Abuja', NOW())
ON CONFLICT (id) DO NOTHING;

-- Migrate data: Set country_new to NIGERIA if old country was 'Nigeria' or similar
UPDATE "admins" SET "country_new" = 'NIGERIA' WHERE LOWER(country) LIKE '%nigeria%';
UPDATE "clients" SET "country_new" = 'NIGERIA' WHERE LOWER(country) LIKE '%nigeria%';

-- Drop old columns
ALTER TABLE "admins" DROP COLUMN "state",
DROP COLUMN "country";

ALTER TABLE "clients" DROP COLUMN "state",
DROP COLUMN "country";

-- Rename new columns
ALTER TABLE "admins" RENAME COLUMN "country_new" TO "country";
ALTER TABLE "clients" RENAME COLUMN "country_new" TO "country";

-- AddForeignKey
ALTER TABLE "admins" ADD CONSTRAINT "admins_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "states"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "states"("id") ON DELETE SET NULL ON UPDATE CASCADE;
