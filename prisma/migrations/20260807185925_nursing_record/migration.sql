-- AlterTable
ALTER TABLE "visit_records" ADD COLUMN     "height" DECIMAL(5,2),
ADD COLUMN     "oxygenSaturation" INTEGER,
ADD COLUMN     "painScale" INTEGER,
ADD COLUMN     "respiratoryRate" INTEGER,
ADD COLUMN     "weight" DECIMAL(5,2);

-- CreateTable
CREATE TABLE "nursing_diagnoses" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nursing_diagnoses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nursing_interventions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nursing_interventions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visit_nursing_diagnoses" (
    "id" TEXT NOT NULL,
    "visitId" TEXT NOT NULL,
    "nursingDiagnosisId" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "visit_nursing_diagnoses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visit_nursing_interventions" (
    "id" TEXT NOT NULL,
    "visitId" TEXT NOT NULL,
    "nursingInterventionId" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "visit_nursing_interventions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visit_photos" (
    "id" TEXT NOT NULL,
    "visitId" TEXT NOT NULL,
    "data" BYTEA NOT NULL,
    "mimeType" TEXT NOT NULL,
    "caption" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "visit_photos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "visit_nursing_diagnoses_visitId_nursingDiagnosisId_key" ON "visit_nursing_diagnoses"("visitId", "nursingDiagnosisId");

-- CreateIndex
CREATE UNIQUE INDEX "visit_nursing_interventions_visitId_nursingInterventionId_key" ON "visit_nursing_interventions"("visitId", "nursingInterventionId");

-- AddForeignKey
ALTER TABLE "visit_nursing_diagnoses" ADD CONSTRAINT "visit_nursing_diagnoses_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "visits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visit_nursing_diagnoses" ADD CONSTRAINT "visit_nursing_diagnoses_nursingDiagnosisId_fkey" FOREIGN KEY ("nursingDiagnosisId") REFERENCES "nursing_diagnoses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visit_nursing_interventions" ADD CONSTRAINT "visit_nursing_interventions_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "visits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visit_nursing_interventions" ADD CONSTRAINT "visit_nursing_interventions_nursingInterventionId_fkey" FOREIGN KEY ("nursingInterventionId") REFERENCES "nursing_interventions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visit_photos" ADD CONSTRAINT "visit_photos_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "visits"("id") ON DELETE CASCADE ON UPDATE CASCADE;
