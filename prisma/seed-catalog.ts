import type { PrismaClient } from "../src/generated/prisma/client";

export async function seedCatalog(prisma: PrismaClient) {
  const materials: Record<string, { unit: string; unitPrice: number }> = {
    "Seringa 5ml": { unit: "un", unitPrice: 0.15 },
    Agulha: { unit: "un", unitPrice: 0.1 },
    Luvas: { unit: "par", unitPrice: 0.2 },
    "Compressa esterilizada": { unit: "un", unitPrice: 0.25 },
    "Soro fisiológico 500ml": { unit: "un", unitPrice: 1.5 },
    "Penso adesivo": { unit: "un", unitPrice: 0.3 },
    Álcool: { unit: "un", unitPrice: 0.5 },
  };

  const materialIds: Record<string, string> = {};
  for (const [name, data] of Object.entries(materials)) {
    const existing = await prisma.material.findFirst({ where: { name } });
    const material = existing ?? (await prisma.material.create({ data: { name, ...data } }));
    materialIds[name] = material.id;
  }

  const interventions: {
    name: string;
    basePrice: number;
    materials: { name: string; quantity: number }[];
  }[] = [
    {
      name: "Administração de injetável",
      basePrice: 8,
      materials: [
        { name: "Seringa 5ml", quantity: 1 },
        { name: "Agulha", quantity: 1 },
        { name: "Luvas", quantity: 1 },
        { name: "Álcool", quantity: 1 },
      ],
    },
    {
      name: "Penso simples",
      basePrice: 6,
      materials: [
        { name: "Compressa esterilizada", quantity: 2 },
        { name: "Soro fisiológico 500ml", quantity: 1 },
        { name: "Luvas", quantity: 1 },
        { name: "Penso adesivo", quantity: 1 },
      ],
    },
    {
      name: "Colheita de sangue",
      basePrice: 7,
      materials: [
        { name: "Seringa 5ml", quantity: 1 },
        { name: "Agulha", quantity: 1 },
        { name: "Luvas", quantity: 1 },
        { name: "Álcool", quantity: 1 },
      ],
    },
    {
      name: "Higiene e conforto",
      basePrice: 10,
      materials: [{ name: "Luvas", quantity: 1 }],
    },
  ];

  for (const item of interventions) {
    const existing = await prisma.interventionType.findFirst({ where: { name: item.name } });
    const interventionType = existing
      ? await prisma.interventionType.update({
          where: { id: existing.id },
          data: { basePrice: item.basePrice },
        })
      : await prisma.interventionType.create({
          data: { name: item.name, basePrice: item.basePrice },
        });

    for (const link of item.materials) {
      await prisma.interventionMaterial.upsert({
        where: {
          interventionTypeId_materialId: {
            interventionTypeId: interventionType.id,
            materialId: materialIds[link.name],
          },
        },
        update: { defaultQuantity: link.quantity },
        create: {
          interventionTypeId: interventionType.id,
          materialId: materialIds[link.name],
          defaultQuantity: link.quantity,
        },
      });
    }
  }

  const nursingDiagnoses = [
    { name: "Risco de queda", description: "Utente com risco aumentado de cair" },
    { name: "Risco de úlcera de pressão", description: "Risco de lesão da pele por pressão/imobilidade" },
    { name: "Défice de autocuidado: Higiene", description: "Incapacidade de realizar a higiene pessoal sem apoio" },
    { name: "Défice de autocuidado: Alimentar-se", description: "Incapacidade de se alimentar sem apoio" },
    { name: "Dor aguda", description: "" },
    { name: "Risco de infeção", description: "" },
    { name: "Mobilidade física comprometida", description: "" },
    { name: "Ansiedade", description: "" },
  ];

  for (const diag of nursingDiagnoses) {
    const existing = await prisma.nursingDiagnosis.findFirst({ where: { name: diag.name } });
    if (!existing) {
      await prisma.nursingDiagnosis.create({
        data: { name: diag.name, description: diag.description || null },
      });
    }
  }

  const nursingInterventions = [
    { name: "Vigiar sinais vitais", description: "" },
    { name: "Vigiar integridade cutânea", description: "" },
    { name: "Posicionar o utente", description: "" },
    { name: "Ensinar sobre gestão de medicação", description: "" },
    { name: "Cuidar de ferida", description: "" },
    { name: "Prevenir queda", description: "" },
    { name: "Gerir a dor", description: "" },
    { name: "Incentivar a mobilidade", description: "" },
  ];

  for (const intervention of nursingInterventions) {
    const existing = await prisma.nursingIntervention.findFirst({
      where: { name: intervention.name },
    });
    if (!existing) {
      await prisma.nursingIntervention.create({
        data: { name: intervention.name, description: intervention.description || null },
      });
    }
  }

  return {
    materialsCount: Object.keys(materials).length,
    interventionsCount: interventions.length,
    nursingDiagnosesCount: nursingDiagnoses.length,
    nursingInterventionsCount: nursingInterventions.length,
  };
}
