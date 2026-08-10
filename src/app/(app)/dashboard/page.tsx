import Link from "next/link";
import { CalendarCheck, Users, Receipt } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { interventionsLabel } from "@/lib/visit-display";
import { cardClass } from "@/components/form-styles";
import { buttonStyles } from "@/components/button-styles";
import Badge, { VISIT_STATUS_LABEL, VISIT_STATUS_VARIANT } from "@/components/badge";
import PageHeader from "@/components/page-header";
import StatCard from "@/components/stat-card";

export default async function DashboardPage() {
  const session = await auth();
  const isAdmin = session?.user.role === "ADMIN";

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const nurseFilter = isAdmin ? {} : { nurseId: session?.user.id };

  const [todayVisits, pendingInvoices, activePatients] = await Promise.all([
    prisma.visit.findMany({
      where: {
        ...nurseFilter,
        scheduledDate: { gte: todayStart, lte: todayEnd },
        status: { in: ["AGENDADA", "CONCLUIDA"] },
      },
      include: {
        patient: true,
        nurse: true,
        interventions: { include: { interventionType: true } },
      },
      orderBy: { scheduledDate: "asc" },
    }),
    isAdmin
      ? prisma.invoice.findMany({
          where: { status: { in: ["PENDENTE", "VENCIDA"] } },
          include: { patient: true },
        })
      : Promise.resolve([]),
    isAdmin ? prisma.patient.count({ where: { active: true } }) : Promise.resolve(null),
  ]);

  const pendingTotal = pendingInvoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Olá, ${session?.user.name?.split(" ")[0]}`}
        description={isAdmin ? "Resumo geral da operação" : "O que tens agendado para hoje"}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={CalendarCheck} label="Visitas hoje" value={String(todayVisits.length)} />
        {isAdmin && (
          <>
            <StatCard icon={Users} label="Utentes ativos" value={String(activePatients)} />
            <StatCard
              icon={Receipt}
              label="Faturas pendentes"
              value={`${pendingInvoices.length} · ${formatCurrency(pendingTotal)}`}
            />
          </>
        )}
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">
          Visitas de hoje
        </h2>
        <div className="space-y-2">
          {todayVisits.map((visit) => (
            <div
              key={visit.id}
              className={`flex items-center justify-between p-4 ${cardClass}`}
            >
              <div>
                <p className="font-medium text-stone-900">{visit.patient.name}</p>
                <p className="text-sm text-stone-500">
                  {formatDateTime(visit.scheduledDate)} · {interventionsLabel(visit.interventions)}
                  {isAdmin && visit.nurse ? ` · ${visit.nurse.name}` : ""}
                </p>
              </div>
              <Badge variant={VISIT_STATUS_VARIANT[visit.status]}>
                {VISIT_STATUS_LABEL[visit.status]}
              </Badge>
            </div>
          ))}
          {todayVisits.length === 0 && (
            <p className={`px-4 py-8 text-center text-stone-400 ${cardClass}`}>
              Sem visitas agendadas para hoje.
            </p>
          )}
        </div>
      </section>

      <Link href={isAdmin ? "/planeamento" : "/agenda"} className={buttonStyles.primary}>
        {isAdmin ? "Ver planeamento" : "Ver a minha agenda"}
      </Link>
    </div>
  );
}
