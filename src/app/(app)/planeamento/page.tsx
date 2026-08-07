import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { buildMonthGrid, dateKey } from "@/lib/calendar";
import { MONTH_NAMES } from "@/lib/format";
import { interventionsLabel } from "@/lib/visit-display";
import { buttonStyles } from "@/components/button-styles";
import PageHeader from "@/components/page-header";

const STATUS_DOT: Record<string, string> = {
  AGENDADA: "bg-sky-100 text-sky-700 hover:bg-sky-200",
  CONCLUIDA: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
  CANCELADA: "bg-stone-200 text-stone-500 line-through hover:bg-stone-300",
  FALTA: "bg-red-100 text-red-700 hover:bg-red-200",
};

export default async function PlaneamentoPage({
  searchParams,
}: PageProps<"/planeamento">) {
  const params = await searchParams;
  const now = new Date();
  const year = Number(params.year) || now.getFullYear();
  const month = Number(params.month) || now.getMonth() + 1;

  const weeks = buildMonthGrid(year, month);
  const rangeStart = weeks[0][0];
  const rangeEnd = weeks[weeks.length - 1][6];
  rangeEnd.setHours(23, 59, 59, 999);

  const visits = await prisma.visit.findMany({
    where: { scheduledDate: { gte: rangeStart, lte: rangeEnd } },
    include: {
      patient: true,
      nurse: true,
      interventions: { include: { interventionType: true } },
    },
    orderBy: { scheduledDate: "asc" },
  });

  const visitsByDay = new Map<string, typeof visits>();
  for (const visit of visits) {
    const key = dateKey(visit.scheduledDate);
    if (!visitsByDay.has(key)) visitsByDay.set(key, []);
    visitsByDay.get(key)!.push(visit);
  }

  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;

  const todayKey = dateKey(now);

  return (
    <div>
      <PageHeader
        title="Planeamento"
        description="Calendário de visitas agendadas"
        action={
          <Link href={`/planeamento/nova?date=${dateKey(now)}`} className={buttonStyles.primary}>
            <Plus size={16} /> Nova visita
          </Link>
        }
      />

      <div className="mb-4 flex items-center gap-3">
        <Link
          href={`/planeamento?year=${prevYear}&month=${prevMonth}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-300 bg-white text-stone-500 hover:bg-stone-50"
        >
          <ChevronLeft size={16} />
        </Link>
        <h2 className="w-40 text-center text-base font-semibold text-stone-900">
          {MONTH_NAMES[month - 1]} {year}
        </h2>
        <Link
          href={`/planeamento?year=${nextYear}&month=${nextMonth}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-300 bg-white text-stone-500 hover:bg-stone-50"
        >
          <ChevronRight size={16} />
        </Link>
      </div>

      <p className="mb-2 text-xs text-stone-400 sm:hidden">Desliza para o lado para ver a semana toda →</p>
      <div className="overflow-x-auto rounded-2xl border border-stone-200 shadow-sm">
        <div className="grid min-w-[720px] grid-cols-7 gap-px bg-stone-200 text-xs sm:min-w-0">
          {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((d) => (
            <div key={d} className="bg-stone-50 px-2 py-2 text-center font-medium text-stone-500">
              {d}
            </div>
          ))}

          {weeks.flatMap((week) =>
            week.map((day) => {
              const key = dateKey(day);
              const dayVisits = visitsByDay.get(key) ?? [];
              const inMonth = day.getMonth() === month - 1;

              return (
                <div
                  key={key}
                  className={`group min-h-[112px] bg-white p-1.5 ${!inMonth ? "bg-stone-50/60" : ""}`}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span
                      className={`text-xs ${
                        key === todayKey
                          ? "flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 font-semibold text-white"
                          : inMonth
                            ? "text-stone-500"
                            : "text-stone-300"
                      }`}
                    >
                      {day.getDate()}
                    </span>
                    <Link
                      href={`/planeamento/nova?date=${key}`}
                      className="text-stone-300 transition-opacity hover:text-emerald-600 sm:opacity-0 sm:group-hover:opacity-100"
                    >
                      <Plus size={14} />
                    </Link>
                  </div>
                  <div className="space-y-1">
                    {dayVisits.map((visit) => (
                      <Link
                        key={visit.id}
                        href={`/planeamento/${visit.id}`}
                        className={`block truncate rounded-md px-1.5 py-0.5 transition-colors ${STATUS_DOT[visit.status]}`}
                        title={`${visit.patient.name} · ${interventionsLabel(visit.interventions)}`}
                      >
                        {visit.scheduledDate.toLocaleTimeString("pt-PT", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        {visit.patient.name}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
