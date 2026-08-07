"use client";

import { useActionState } from "react";
import { createTeamMember } from "./actions";
import { inputClass, labelClass, cardClass } from "@/components/form-styles";
import { buttonStyles } from "@/components/button-styles";

export default function NewMemberForm() {
  const [state, formAction, pending] = useActionState(createTeamMember, undefined);

  return (
    <form action={formAction} className={`grid gap-4 p-6 sm:grid-cols-2 ${cardClass}`}>
      <div>
        <label htmlFor="name" className={labelClass}>
          Nome
        </label>
        <input id="name" name="name" required className={inputClass} />
      </div>
      <div>
        <label htmlFor="email" className={labelClass}>
          Email
        </label>
        <input id="email" name="email" type="email" required className={inputClass} />
      </div>
      <div>
        <label htmlFor="password" className={labelClass}>
          Palavra-passe inicial
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="role" className={labelClass}>
          Perfil
        </label>
        <select id="role" name="role" defaultValue="ENFERMEIRO" className={inputClass}>
          <option value="ENFERMEIRO">Enfermeiro</option>
          <option value="ADMIN">Administração</option>
        </select>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="phone" className={labelClass}>
          Telefone (opcional)
        </label>
        <input id="phone" name="phone" className={inputClass} />
      </div>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 sm:col-span-2">
          {state.error}
        </p>
      )}

      <div className="sm:col-span-2">
        <button type="submit" disabled={pending} className={buttonStyles.primary}>
          {pending ? "A criar..." : "Criar conta"}
        </button>
      </div>
    </form>
  );
}
