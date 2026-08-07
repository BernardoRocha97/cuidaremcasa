import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import Brand from "@/components/brand";
import NavLinks from "./nav-links";
import { logoutAction } from "./actions";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const initials = session.user.name
    ? session.user.name
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <div className="flex min-h-full flex-1 flex-col md:flex-row">
      {/* Sidebar (desktop) */}
      <aside className="hidden shrink-0 flex-col bg-stone-900 md:flex md:w-64">
        <div className="px-5 py-5">
          <Brand />
        </div>
        <div className="flex-1 px-3">
          <NavLinks role={session.user.role} />
        </div>
        <div className="border-t border-stone-800 p-3">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stone-700 text-xs font-semibold text-stone-100">
              {initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{session.user.name}</p>
              <p className="truncate text-xs text-stone-400">
                {session.user.role === "ADMIN" ? "Administração" : "Enfermeiro"}
              </p>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                title="Sair"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 hover:bg-stone-800 hover:text-white"
              >
                <LogOut size={16} />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="flex flex-col gap-3 border-b border-stone-200 bg-stone-900 px-4 py-3 md:hidden">
        <div className="flex items-center justify-between">
          <Brand />
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 hover:bg-stone-800 hover:text-white"
            >
              <LogOut size={16} />
            </button>
          </form>
        </div>
        <NavLinks role={session.user.role} variant="horizontal" />
      </header>

      <div className="flex flex-1 flex-col bg-stone-50">
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
