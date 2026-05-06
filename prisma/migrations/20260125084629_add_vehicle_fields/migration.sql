/*
  Warnings:

  - Added the required column `nameEnglish` to the `car_brands` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nameThai` to the `car_brands` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "car_brands" ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "modelCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "nameEnglish" TEXT NOT NULL,
ADD COLUMN     "nameThai" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "car_models" ADD COLUMN     "fuelType" TEXT,
ADD COLUMN     "vehicleType" TEXT,
ADD COLUMN     "yearEnd" INTEGER,
ADD COLUMN     "yearStart" INTEGER;
