/*
  Warnings:

  - The values [PENDING] on the enum `JobStatus` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[quotationNo]` on the table `service_jobs` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'REVISED');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO', 'DOCUMENT');

-- CreateEnum
CREATE TYPE "RecommendationPriority" AS ENUM ('URGENT', 'RECOMMENDED', 'OPTIONAL');

-- CreateEnum
CREATE TYPE "ReminderType" AS ENUM ('MILEAGE_BASED', 'TIME_BASED', 'BOTH');

-- CreateEnum
CREATE TYPE "ReminderStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED', 'SNOOZED');

-- AlterEnum
BEGIN;
CREATE TYPE "JobStatus_new" AS ENUM ('RECEIVED', 'INSPECTION', 'WAITING_APPROVAL', 'APPROVED', 'IN_PROGRESS', 'WAITING_PARTS', 'QC_CHECK', 'WAITING_PAYMENT', 'COMPLETED', 'DELIVERED', 'CANCELLED');
ALTER TABLE "public"."service_jobs" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "service_jobs" ALTER COLUMN "status" TYPE "JobStatus_new" USING ("status"::text::"JobStatus_new");
ALTER TYPE "JobStatus" RENAME TO "JobStatus_old";
ALTER TYPE "JobStatus_new" RENAME TO "JobStatus";
DROP TYPE "public"."JobStatus_old";
ALTER TABLE "service_jobs" ALTER COLUMN "status" SET DEFAULT 'RECEIVED';
COMMIT;

-- AlterTable
ALTER TABLE "service_job_items" ADD COLUMN     "actualQty" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "estimatedQty" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "isModified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "modifiedReason" TEXT;

-- AlterTable
ALTER TABLE "service_jobs" ADD COLUMN     "appointmentDate" TIMESTAMP(3),
ADD COLUMN     "approvalNotes" TEXT,
ADD COLUMN     "approvalSignature" TEXT,
ADD COLUMN     "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "approvedBy" TEXT,
ADD COLUMN     "approvedDate" TIMESTAMP(3),
ADD COLUMN     "estimatedCompletionDays" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "inspectionChecklist" JSONB,
ADD COLUMN     "quotationDate" TIMESTAMP(3),
ADD COLUMN     "quotationExpiry" TIMESTAMP(3),
ADD COLUMN     "quotationNo" TEXT,
ADD COLUMN     "workshopBay" TEXT,
ALTER COLUMN "status" SET DEFAULT 'RECEIVED';

-- CreateTable
CREATE TABLE "service_job_labor" (
    "id" TEXT NOT NULL,
    "serviceJobId" TEXT NOT NULL,
    "technicianId" TEXT NOT NULL,
    "serviceJobItemId" TEXT,
    "description" TEXT,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "hoursWorked" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "laborRate" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "laborCost" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_job_labor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_job_qc" (
    "id" TEXT NOT NULL,
    "serviceJobId" TEXT NOT NULL,
    "qcChecklist" JSONB,
    "qcPassedAll" BOOLEAN NOT NULL DEFAULT false,
    "qcNotes" TEXT,
    "qcBy" TEXT,
    "qcDate" TIMESTAMP(3),
    "deliveredBy" TEXT,
    "receivedBy" TEXT,
    "deliverySignature" TEXT,
    "deliveryDate" TIMESTAMP(3),
    "deliveryNotes" TEXT,
    "customerRating" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_job_qc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_job_media" (
    "id" TEXT NOT NULL,
    "serviceJobId" TEXT NOT NULL,
    "mediaType" "MediaType" NOT NULL DEFAULT 'IMAGE',
    "mediaUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "category" TEXT,
    "description" TEXT,
    "uploadedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_job_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "mileageInterval" INTEGER,
    "monthInterval" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenance_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_template_items" (
    "id" TEXT NOT NULL,
    "maintenanceTemplateId" TEXT NOT NULL,
    "serviceId" TEXT,
    "description" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "estimatedCost" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "maintenance_template_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_job_recommendations" (
    "id" TEXT NOT NULL,
    "serviceJobId" TEXT NOT NULL,
    "serviceId" TEXT,
    "description" TEXT NOT NULL,
    "reason" TEXT,
    "priority" "RecommendationPriority" NOT NULL DEFAULT 'RECOMMENDED',
    "estimatedCost" DECIMAL(10,2),
    "dueAtMileage" INTEGER,
    "dueAtDate" TIMESTAMP(3),
    "isAccepted" BOOLEAN NOT NULL DEFAULT false,
    "acceptedDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_job_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_reminders" (
    "id" TEXT NOT NULL,
    "carId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "reminderType" "ReminderType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueAtMileage" INTEGER,
    "dueAtDate" TIMESTAMP(3),
    "notifyBeforeDays" INTEGER,
    "notifyBeforeKm" INTEGER,
    "lastNotified" TIMESTAMP(3),
    "notifyVia" TEXT,
    "status" "ReminderStatus" NOT NULL DEFAULT 'ACTIVE',
    "completedDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenance_reminders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "service_job_qc_serviceJobId_key" ON "service_job_qc"("serviceJobId");

-- CreateIndex
CREATE UNIQUE INDEX "service_jobs_quotationNo_key" ON "service_jobs"("quotationNo");

-- AddForeignKey
ALTER TABLE "service_job_labor" ADD CONSTRAINT "service_job_labor_serviceJobId_fkey" FOREIGN KEY ("serviceJobId") REFERENCES "service_jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_job_labor" ADD CONSTRAINT "service_job_labor_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_job_labor" ADD CONSTRAINT "service_job_labor_serviceJobItemId_fkey" FOREIGN KEY ("serviceJobItemId") REFERENCES "service_job_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_job_qc" ADD CONSTRAINT "service_job_qc_serviceJobId_fkey" FOREIGN KEY ("serviceJobId") REFERENCES "service_jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_job_media" ADD CONSTRAINT "service_job_media_serviceJobId_fkey" FOREIGN KEY ("serviceJobId") REFERENCES "service_jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_template_items" ADD CONSTRAINT "maintenance_template_items_maintenanceTemplateId_fkey" FOREIGN KEY ("maintenanceTemplateId") REFERENCES "maintenance_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_template_items" ADD CONSTRAINT "maintenance_template_items_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_job_recommendations" ADD CONSTRAINT "service_job_recommendations_serviceJobId_fkey" FOREIGN KEY ("serviceJobId") REFERENCES "service_jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_job_recommendations" ADD CONSTRAINT "service_job_recommendations_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_reminders" ADD CONSTRAINT "maintenance_reminders_carId_fkey" FOREIGN KEY ("carId") REFERENCES "cars"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_reminders" ADD CONSTRAINT "maintenance_reminders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
