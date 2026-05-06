/*
  Warnings:

  - You are about to drop the column `modelCount` on the `car_brands` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "car_brands" DROP COLUMN "modelCount";

-- AlterTable
ALTER TABLE "services" ADD COLUMN     "laborCost" DECIMAL(10,2);

-- AlterTable
ALTER TABLE "spares" ADD COLUMN     "vendorId" TEXT;

-- AddForeignKey
ALTER TABLE "spares" ADD CONSTRAINT "spares_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
