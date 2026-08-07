import Link from "next/link";
import { MapPin, Navigation } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/format";
import { interventionsLabel } from "@/lib/visit-display";
import { wazeUrl } from "@/lib/maps";
import { markVisitMissed } from "../planeamento/actions";
import { cardClass } from "@/components/form-styles";
import { buttonStyles } from "@/components/button-styles";
import PageHeader from "@/components/page-header";

export default async function AgendaPage() {
  const session = await auth();
  const isAdmin = session?.user.role === "ADMIN";

  const visits = await prisma.visit.findMany({
    where: {
      status: "AGENDADA",
      ...(isAdmin ? {} : { nurseId: session?.user.id }),
    },
    include: {
      patient: true,
      nurse: true,
      interventions: { include: { interventionType: true } },
    },
    orderBy: { scheduledDate: "asc" },
  });

  return (
    <div>
      <PageHeader
        title={isAdmin ? "Todas as visitas agendadas" : "A minha agenda"}
        description={`${visits.length} visita${visits.length === 1 ? "" : "s"} por concluir`}
      />

      <div className="space-y-3">
        {visits.map((visit) => (
          <div
            key={visit.id}
            className={`flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between ${cardClass}`}
          >
            <div>
              <p className="font-medium text-stone-900">{visit.patient.name}</p>
              <p className="text-sm text-stone-500">
                {formatDateTime(visit.scheduledDate)} · {interventionsLabel(visit.interventions)}
                {isAdmin && visit.nurse ? ` · ${visit.nurse.name}` : ""}
              </p>
              {visit.patient.address && (
                <p className="mt-0.5 flex items-center gap-1 text-xs text-stone-400">
                  <MapPin size={12} /> {visit.patient.address}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {visit.patient.address && (
                <a
                  href={wazeUrl(visit.patient.address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonStyles.secondary}
                >
                  <Navigation size={16} /> Waze
                </a>
              )}
              <Link href={`/agenda/${visit.id}/concluir`} className={buttonStyles.primary}>
                Concluir
              </Link>
              <form action={markVisitMissed.bind(null, visit.id)}>
                <button type="submit" className={buttonStyles.danger}>
                  Falta
                </button>
              </form>
            </div>
          </div>
        ))}

        {visits.length === 0 && (
          <p className={`px-4 py-12 text-center text-stone-400 ${cardClass}`}>
            Sem visitas agendadas.
          </p>
        )}
      </div>
    </div>
  );
}
