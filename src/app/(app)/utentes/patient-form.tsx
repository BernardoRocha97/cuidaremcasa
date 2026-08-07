import { inputClass, labelClass, cardClass } from "@/components/form-styles";
import { buttonStyles } from "@/components/button-styles";

type PatientFormValues = {
  name: string;
  birthDate: string;
  address: string;
  phone: string;
  emergencyContact: string;
  nationalId: string;
  notes: string;
  primaryDoctor: string;
  allergies: string;
  currentMedication: string;
  medicalConditions: string;
  caregiverName: string;
  caregiverPhone: string;
  caregiverRelationship: string;
  billingName: string;
  billingNif: string;
  billingAddress: string;
};

export default function PatientForm({
  action,
  defaultValues,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  defaultValues?: Partial<PatientFormValues>;
  submitLabel: string;
}) {
  return (
    <form action={action} className="space-y-8">
      <FormSection title="Dados pessoais">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome completo" name="name" required defaultValue={defaultValues?.name} />
          <Field
            label="Data de nascimento"
            name="birthDate"
            type="date"
            defaultValue={defaultValues?.birthDate}
          />
          <Field label="Telefone" name="phone" defaultValue={defaultValues?.phone} />
          <Field
            label="Nº de utente / NIF"
            name="nationalId"
            defaultValue={defaultValues?.nationalId}
          />
          <Field
            label="Contacto de emergência"
            name="emergencyContact"
            defaultValue={defaultValues?.emergencyContact}
          />
        </div>
        <div className="mt-4">
          <Field label="Morada" name="address" defaultValue={defaultValues?.address} />
        </div>
      </FormSection>

      <FormSection title="Dados clínicos">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Médico assistente"
            name="primaryDoctor"
            defaultValue={defaultValues?.primaryDoctor}
          />
          <Field label="Alergias" name="allergies" defaultValue={defaultValues?.allergies} />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <TextAreaField
            label="Medicação habitual"
            name="currentMedication"
            defaultValue={defaultValues?.currentMedication}
          />
          <TextAreaField
            label="Diagnóstico / patologias"
            name="medicalConditions"
            defaultValue={defaultValues?.medicalConditions}
          />
        </div>
      </FormSection>

      <FormSection title="Cuidador / família">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field
            label="Nome do cuidador"
            name="caregiverName"
            defaultValue={defaultValues?.caregiverName}
          />
          <Field
            label="Telefone do cuidador"
            name="caregiverPhone"
            defaultValue={defaultValues?.caregiverPhone}
          />
          <Field
            label="Grau de parentesco"
            name="caregiverRelationship"
            placeholder="Ex: Filha, Cônjuge..."
            defaultValue={defaultValues?.caregiverRelationship}
          />
        </div>
      </FormSection>

      <FormSection
        title="Dados de faturação"
        description="Só é preciso preencher se a fatura for emitida em nome de outra pessoa/entidade e não do próprio utente."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Nome para faturação"
            name="billingName"
            defaultValue={defaultValues?.billingName}
          />
          <Field label="NIF de faturação" name="billingNif" defaultValue={defaultValues?.billingNif} />
        </div>
        <div className="mt-4">
          <Field
            label="Morada de faturação"
            name="billingAddress"
            defaultValue={defaultValues?.billingAddress}
          />
        </div>
      </FormSection>

      <FormSection title="Notas gerais">
        <TextAreaField label="Notas" name="notes" defaultValue={defaultValues?.notes} rows={4} />
      </FormSection>

      <button type="submit" className={buttonStyles.primary}>
        {submitLabel}
      </button>
    </form>
  );
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`p-6 ${cardClass}`}>
      <h2 className="text-sm font-semibold text-stone-900">{title}</h2>
      {description && <p className="mt-0.5 mb-4 text-xs text-stone-400">{description}</p>}
      <div className={description ? "" : "mt-4"}>{children}</div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className={labelClass}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className={inputClass}
      />
    </div>
  );
}

function TextAreaField({
  label,
  name,
  rows = 2,
  defaultValue,
}: {
  label: string;
  name: string;
  rows?: number;
  defaultValue?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className={labelClass}>
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        className={inputClass}
      />
    </div>
  );
}
