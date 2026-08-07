import { HeartHandshake } from "lucide-react";
import Brand from "@/components/brand";
import LoginForm from "./login-form";

export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  const params = await searchParams;
  const callbackUrl =
    typeof params.callbackUrl === "string" ? params.callbackUrl : "/dashboard";

  return (
    <main className="flex min-h-screen flex-1">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-stone-900 px-12 py-10 lg:flex">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-emerald-600/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
        <Brand />
        <div className="relative">
          <HeartHandshake size={40} className="mb-6 text-emerald-500" strokeWidth={1.5} />
          <h2 className="max-w-sm text-2xl font-medium leading-snug text-white">
            Cuidados de enfermagem organizados, do planeamento à faturação.
          </h2>
        </div>
        <p className="relative text-sm text-stone-500">
          © {new Date().getFullYear()} Cuidar em Casa
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Brand dark={false} />
          </div>
          <h1 className="text-xl font-semibold text-stone-900">Iniciar sessão</h1>
          <p className="mt-1 mb-6 text-sm text-stone-500">
            Entra com as credenciais da tua conta.
          </p>
          <LoginForm callbackUrl={callbackUrl} />
        </div>
      </div>
    </main>
  );
}
