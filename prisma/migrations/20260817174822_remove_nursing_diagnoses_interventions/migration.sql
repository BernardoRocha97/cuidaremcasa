-- DropForeignKey
ALTER TABLE "visit_nursing_diagnoses" DROP CONSTRAINT "visit_nursing_diagnoses_nursingDiagnosisId_fkey";

-- DropForeignKey
ALTER TABLE "visit_nursing_diagnoses" DROP CONSTRAINT "visit_nursing_diagnoses_visitId_fkey";

-- DropForeignKey
ALTER TABLE "visit_nursing_interventions" DROP CONSTRAINT "visit_nursing_interventions_nursingInterventionId_fkey";

-- DropForeignKey
ALTER TABLE "visit_nursing_interventions" DROP CONSTRAINT "visit_nursing_interventions_visitId_fkey";

-- DropTable
DROP TABLE "nursing_diagnoses";

-- DropTable
DROP TABLE "nursing_interventions";

-- DropTable
DROP TABLE "visit_nursing_diagnoses";

-- DropTable
DROP TABLE "visit_nursing_interventions";
