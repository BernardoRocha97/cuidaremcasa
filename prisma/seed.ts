import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { seedCatalog } from "./seed-catalog";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 10);
  const nursePassword = await bcrypt.hash("enfermeiro123", 10);

  await prisma.user.upsert({
    where: { email: "admin@empresa.pt" },
    update: {},
    create: {
      name: "Administração",
      email: "admin@empresa.pt",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: "enfermeiro@empresa.pt" },
    update: {},
    create: {
      name: "Enfermeiro Teste",
      email: "enfermeiro@empresa.pt",
      passwordHash: nursePassword,
      role: "ENFERMEIRO",
    },
  });

  const counts = await seedCatalog(prisma);

  console.log("Seed concluído: admin@empresa.pt / admin123, enfermeiro@empresa.pt / enfermeiro123");
  console.log(
    `Catálogo: ${counts.materialsCount} materiais, ${counts.interventionsCount} intervenções`
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
