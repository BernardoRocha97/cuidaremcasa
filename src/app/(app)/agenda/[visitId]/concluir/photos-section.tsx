import { Upload, X } from "lucide-react";
import { cardClass } from "@/components/form-styles";
import { buttonStyles } from "@/components/button-styles";

type Photo = { id: string; caption: string | null };

export default function PhotosSection({
  photos,
  addAction,
  removeAction,
}: {
  photos: Photo[];
  addAction: (formData: FormData) => void;
  removeAction: (photoId: string) => void;
}) {
  return (
    <div className={`p-4 ${cardClass}`}>
      {photos.length > 0 && (
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((photo) => (
            <div key={photo.id} className="group relative overflow-hidden rounded-lg border border-stone-200">
              <img
                src={`/api/photos/${photo.id}`}
                alt={photo.caption ?? "Foto da visita"}
                className="h-32 w-full object-cover"
              />
              {photo.caption && (
                <p className="truncate bg-stone-900/70 px-2 py-1 text-xs text-white">
                  {photo.caption}
                </p>
              )}
              <form
                action={removeAction.bind(null, photo.id)}
                className="absolute right-1 top-1"
              >
                <button
                  type="submit"
                  title="Remover foto"
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-stone-900/70 text-white hover:bg-red-600"
                >
                  <X size={13} />
                </button>
              </form>
            </div>
          ))}
        </div>
      )}

      <form action={addAction} className="flex flex-wrap items-end gap-2">
        <div className="flex-1 min-w-[160px]">
          <input
            type="file"
            name="photo"
            accept="image/*"
            capture="environment"
            required
            className="block w-full text-sm text-stone-600 file:mr-3 file:rounded-md file:border-0 file:bg-stone-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-stone-700 hover:file:bg-stone-200"
          />
        </div>
        <input
          type="text"
          name="caption"
          placeholder="Legenda (opcional, ex: ferida no calcanhar)"
          className="min-w-[160px] flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
        <button type="submit" className={buttonStyles.secondary}>
          <Upload size={16} /> Enviar foto
        </button>
      </form>
      <p className="mt-2 text-xs text-stone-400">JPEG, PNG ou WEBP, até 8MB.</p>
    </div>
  );
}
