/*
  Warnings:

  - You are about to drop the column `careType` on the `visits` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "sequence" SERIAL NOT NULL;

-- AlterTable
ALTER TABLE "patients" ADD COLUMN     "allergies" TEXT,
ADD COLUMN     "billingAddress" TEXT,
ADD COLUMN     "billingName" TEXT,
ADD COLUMN     "billingNif" TEXT,
ADD COLUMN     "caregiverName" TEXT,
ADD COLUMN     "caregiverPhone" TEXT,
ADD COLUMN     "caregiverRelationship" TEXT,
ADD COLUMN     "currentMedication" TEXT,
ADD COLUMN     "medicalConditions" TEXT,
ADD COLUMN     "primaryDoctor" TEXT;

-- AlterTable
ALTER TABLE "visits" DROP COLUMN "careType";

-- CreateTable
CREATE TABLE "materials" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'un',
    "unitPrice" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "intervention_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "basePrice" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "intervention_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "intervention_materials" (
    "id" TEXT NOT NULL,
    "interventionTypeId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "defaultQuantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "intervention_materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visit_interventions" (
    "id" TEXT NOT NULL,
    "visitId" TEXT NOT NULL,
    "interventionTypeId" TEXT NOT NULL,
    "priceAtTime" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "visit_interventions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visit_intervention_materials" (
    "id" TEXT NOT NULL,
    "visitInterventionId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPriceAtUse" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "visit_intervention_materials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "intervention_materials_interventionTypeId_materialId_key" ON "intervention_materials"("interventionTypeId", "materialId");

-- CreateIndex
CREATE INDEX "visit_interventions_visitId_idx" ON "visit_interventions"("visitId");

-- AddForeignKey
ALTER TABLE "intervention_materials" ADD CONSTRAINT "intervention_materials_interventionTypeId_fkey" FOREIGN KEY ("interventionTypeId") REFERENCES "intervention_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intervention_materials" ADD CONSTRAINT "intervention_materials_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visit_interventions" ADD CONSTRAINT "visit_interventions_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "visits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visit_interventions" ADD CONSTRAINT "visit_interventions_interventionTypeId_fkey" FOREIGN KEY ("interventionTypeId") REFERENCES "intervention_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visit_intervention_materials" ADD CONSTRAINT "visit_intervention_materials_visitInterventionId_fkey" FOREIGN KEY ("visitInterventionId") REFERENCES "visit_interventions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visit_intervention_materials" ADD CONSTRAINT "visit_intervention_materials_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "materials"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
