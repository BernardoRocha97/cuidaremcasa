import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { seedCatalog } from "./seed-catalog";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.PROD_ADMIN_EMAIL;
  const password = process.env.PROD_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("Define PROD_ADMIN_EMAIL e PROD_ADMIN_PASSWORD antes de correr este seed.");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      name: "Administração",
      email,
      passwordHash,
      role: "ADMIN",
    },
  });

  const counts = await seedCatalog(prisma);

  console.log(`Conta de administração criada: ${email}`);
  console.log(
    `Catálogo: ${counts.materialsCount} materiais, ${counts.interventionsCount} intervenções, ${counts.nursingDiagnosesCount} diagnósticos de enfermagem, ${counts.nursingInterventionsCount} intervenções de enfermagem`
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
