"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Receipt,
  UserCog,
  ClipboardList,
  BookOpen,
} from "lucide-react";

const ADMIN_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/planeamento", label: "Planeamento", icon: CalendarDays },
  { href: "/utentes", label: "Utentes", icon: Users },
  { href: "/faturacao", label: "Faturação", icon: Receipt },
  { href: "/catalogo", label: "Catálogo", icon: BookOpen },
  { href: "/equipa", label: "Equipa", icon: UserCog },
];

const NURSE_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/agenda", label: "A minha agenda", icon: ClipboardList },
  { href: "/planeamento", label: "Planeamento", icon: CalendarDays },
];

export default function NavLinks({
  role,
  variant = "vertical",
}: {
  role: "ADMIN" | "ENFERMEIRO";
  variant?: "vertical" | "horizontal";
}) {
  const pathname = usePathname();
  const links = role === "ADMIN" ? ADMIN_LINKS : NURSE_LINKS;

  return (
    <nav className={variant === "vertical" ? "flex flex-col gap-1" : "flex gap-1 overflow-x-auto"}>
      {links.map((link) => {
        const active = pathname.startsWith(link.href);
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? "bg-emerald-600 text-white"
                : "text-stone-300 hover:bg-stone-800 hover:text-white"
            }`}
          >
            <Icon size={17} strokeWidth={2} />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
