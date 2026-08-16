import { FormEvent, useRef, useState } from "react";
import { Camera } from "lucide-react";
import { toast } from "react-toastify";
import { depositBook } from "../api/client";
import { Layout } from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import {
  CONDITION_LABELS,
  LEVEL_LABELS,
  SUBJECT_LABELS,
  type BookCondition,
  type SchoolLevel,
  type Subject,
} from "../types";

export function Deposit() {
  const { user, refreshUser } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    subject: "MATHEMATIQUES" as Subject,
    level: "SIXIEME" as SchoolLevel,
    condition: "BON" as BookCondition,
    libraryMode: false,
  });

  const handlePhoto = (file: File | undefined) => {
    if (!file) return;
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) {
      toast.error("La photo est obligatoire");
      return;
    }
    if (!user) {
      toast.info("Connectez-vous pour déposer un livre");
      return;
    }

    const data = new FormData();
    data.append("title", form.title);
    data.append("subject", form.subject);
    data.append("level", form.level);
    data.append("condition", form.condition);
    data.append("libraryMode", String(form.libraryMode));
    data.append("photo", file);

    setLoading(true);
    try {
      const res = await depositBook(data);
      toast.success(res.message || "Livre déposé — +1 tampon !");
      setForm({ title: "", subject: "MATHEMATIQUES", level: "SIXIEME", condition: "BON", libraryMode: false });
      setPreview(null);
      if (fileRef.current) fileRef.current.value = "";
      await refreshUser();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Erreur lors du dépôt");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500";

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-gray-900">Déposer un manuel</h1>
      <p className="mt-1 text-gray-500">
        Ajoutez une photo et les informations — {form.libraryMode ? "mode bibliothèque" : "+1 tampon"}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 max-w-lg space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div>
          <label className="block text-sm font-medium text-gray-700">Photo du livre *</label>
          <div
            onClick={() => fileRef.current?.click()}
            className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 py-8 hover:border-emerald-300"
          >
            {preview ? (
              <img src={preview} alt="Aperçu" className="max-h-48 rounded-lg object-contain" />
            ) : (
              <>
                <Camera className="h-10 w-10 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">Cliquez pour ajouter une photo</p>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handlePhoto(e.target.files?.[0])} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Titre</label>
          <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} placeholder="Ex: Transmath 6ème" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Matière</label>
            <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value as Subject })} className={inputClass}>
              {Object.entries(SUBJECT_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Niveau</label>
            <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value as SchoolLevel })} className={inputClass}>
              {Object.entries(LEVEL_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">État</label>
          <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value as BookCondition })} className={inputClass}>
            {Object.entries(CONDITION_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.libraryMode}
            onChange={(e) => setForm({ ...form, libraryMode: e.target.checked })}
            className="rounded border-gray-300 text-emerald-600"
          />
          Déposer en mode bibliothèque (emprunt avec caution, pas de tampon)
        </label>

        <button type="submit" disabled={loading || !user} className="w-full rounded-xl bg-emerald-700 py-3 font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">
          {loading ? "Dépôt en cours..." : "Déposer le livre"}
        </button>
      </form>
    </Layout>
  );
}
