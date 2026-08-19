import { FormEvent, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Camera } from "lucide-react";
import { toast } from "react-toastify";
import { depositBook, getZones } from "../api/client";
import { Layout } from "../components/Layout";
import { Card, PageHeader, PrimaryButton, inputClass } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import {
  BOOK_SUBJECTS,
  CONDITION_LABELS,
  DECOR_SUBJECTS,
  LEVEL_LABELS,
  LEVEL_OPTGROUPS,
  SUBJECT_LABELS,
  type BookCondition,
  type ListingCategory,
  type SchoolLevel,
  type Subject,
  type Zone,
} from "../types";
import { isSellerOnly } from "../utils/roles";

export function Deposit() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const seller = isSellerOnly(user);
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [zones, setZones] = useState<Zone[]>([]);
  const initialRayon: ListingCategory =
    searchParams.get("rayon") === "deco" ? "DECOR" : searchParams.get("rayon") === "divers" ? "MISC" : "BOOKS";

  const defaultSubject = (listingCategory: ListingCategory): Subject =>
    listingCategory === "DECOR" ? "MEUBLES" : listingCategory === "MISC" ? "AUTRE" : "MATHEMATIQUES";
  const [form, setForm] = useState({
    title: "",
    listingCategory: initialRayon,
    subject: defaultSubject(initialRayon),
    level: "SIXIEME" as SchoolLevel,
    condition: "BON" as BookCondition,
    libraryMode: false,
    anonymous: !user,
    zoneCode: "",
  });

  useEffect(() => {
    getZones().then((res) => {
      setZones(res.data);
      if (res.data[0]) {
        setForm((f) => ({ ...f, zoneCode: f.zoneCode || res.data[0].code }));
      }
    });
  }, []);

  const setRayon = (listingCategory: ListingCategory) => {
    setForm((f) => ({
      ...f,
      listingCategory,
      subject: defaultSubject(listingCategory),
    }));
  };

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

    const data = new FormData();
    data.append("title", form.title);
    data.append("subject", form.subject);
    if (form.listingCategory === "BOOKS") {
      data.append("level", form.level);
    }
    data.append("condition", form.condition);
    data.append("libraryMode", String(form.libraryMode && form.listingCategory === "BOOKS"));
    data.append("listingCategory", form.listingCategory);
    data.append("anonymous", String(form.anonymous || !user));
    data.append("photo", file);
    if (!user) {
      data.append("zoneCode", form.zoneCode);
    }

    setLoading(true);
    try {
      const res = await depositBook(data);
      toast.success(res.message || "Annonce publiée");
      setForm((f) => ({
        ...f,
        title: "",
        libraryMode: false,
        anonymous: !user,
      }));
      setPreview(null);
      if (fileRef.current) fileRef.current.value = "";
      if (user) await refreshUser();
      if (seller || user) {
        navigate("/seller");
      } else {
        navigate(form.listingCategory === "DECOR" ? "/deco" : form.listingCategory === "MISC" ? "/divers" : "/livres");
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Erreur lors du dépôt");
    } finally {
      setLoading(false);
    }
  };

  const subjects = form.listingCategory === "DECOR" ? DECOR_SUBJECTS : BOOK_SUBJECTS;

  return (
    <Layout>
      <PageHeader
        title="Déposer une annonce"
        subtitle={
          user
            ? "Livres, intérieur déco ou articles divers. Vous pouvez masquer votre nom."
            : "Publiez sans créer de compte : l’annonce apparaît comme anonyme."
        }
        accent={seller ? "teal" : "emerald"}
      />
      <Card className="max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-sm font-medium text-slate-700">Rayon</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRayon("BOOKS")}
                className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                  form.listingCategory === "BOOKS"
                    ? "border-emerald-700 bg-emerald-50 text-emerald-800"
                    : "border-slate-200 text-slate-600"
                }`}
              >
                Livres
              </button>
              <button
                type="button"
                onClick={() => setRayon("DECOR")}
                className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                  form.listingCategory === "DECOR"
                    ? "border-emerald-700 bg-emerald-50 text-emerald-800"
                    : "border-slate-200 text-slate-600"
                }`}
              >
                Intérieur Déco
              </button>
              <button
                type="button"
                onClick={() => setRayon("MISC")}
                className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                  form.listingCategory === "MISC"
                    ? "border-emerald-700 bg-emerald-50 text-emerald-800"
                    : "border-slate-200 text-slate-600"
                }`}
              >
                Articles divers
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Photo *</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 py-10 hover:border-emerald-400"
            >
              {preview ? (
                <img src={preview} alt="Aperçu" className="max-h-48 rounded-lg object-contain" />
              ) : (
                <>
                  <Camera className="h-10 w-10 text-slate-300" />
                  <p className="mt-2 text-sm text-slate-400">Cliquez pour ajouter une photo</p>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handlePhoto(e.target.files?.[0])} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Titre</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={inputClass}
              placeholder={
                form.listingCategory === "DECOR"
                  ? "Ex. Canapé 3 places"
                  : form.listingCategory === "MISC"
                    ? "Ex. Cartable, vélo enfant"
                    : "Ex. Transmath 6ème"
              }
            />
          </div>
          {form.listingCategory !== "MISC" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                {form.listingCategory === "DECOR" ? "Type" : "Matière"}
              </label>
              <select
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value as Subject })}
                className={inputClass}
              >
                {subjects.map((k) => (
                  <option key={k} value={k}>{SUBJECT_LABELS[k]}</option>
                ))}
              </select>
            </div>
            {form.listingCategory === "BOOKS" && (
              <div>
                <label className="block text-sm font-medium text-slate-700">Niveau</label>
                <select
                  value={form.level}
                  onChange={(e) => setForm({ ...form, level: e.target.value as SchoolLevel })}
                  className={inputClass}
                >
                  {LEVEL_OPTGROUPS.map((group) => (
                    <optgroup key={group.label} label={group.label}>
                      {group.levels.map((k) => (
                        <option key={k} value={k}>{LEVEL_LABELS[k]}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            )}
          </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700">État</label>
            <select
              value={form.condition}
              onChange={(e) => setForm({ ...form, condition: e.target.value as BookCondition })}
              className={inputClass}
            >
              {Object.entries(CONDITION_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          {!user && (
            <div>
              <label className="block text-sm font-medium text-slate-700">Quartier</label>
              <select
                required
                value={form.zoneCode}
                onChange={(e) => setForm({ ...form, zoneCode: e.target.value })}
                className={inputClass}
              >
                {zones.map((z) => (
                  <option key={z.code} value={z.code}>{z.name}</option>
                ))}
              </select>
            </div>
          )}
          {user && form.listingCategory === "BOOKS" && !seller && (
            <label className="flex items-start gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={form.libraryMode}
                onChange={(e) => setForm({ ...form, libraryMode: e.target.checked })}
                className="mt-0.5 rounded border-slate-300 text-emerald-600"
              />
              Déposer en mode bibliothèque (emprunt avec caution, pas de tampon)
            </label>
          )}
          <label className="flex items-start gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={form.anonymous || !user}
              onChange={(e) => setForm({ ...form, anonymous: e.target.checked })}
              disabled={!user}
              className="mt-0.5 rounded border-slate-300 text-emerald-600"
            />
            Publier en utilisateur anonyme (votre nom n’apparaît pas)
          </label>
          {!user && (
            <p className="text-xs text-slate-400">
              Sans compte, l’annonce est forcément anonyme.{" "}
              <Link to="/register" className="text-emerald-700 hover:underline">Créer un compte</Link>
              {" "}si vous voulez suivre vos ventes.
            </p>
          )}
          <PrimaryButton type="submit" disabled={loading} className="w-full py-3">
            {loading ? "Publication..." : "Publier l’annonce"}
          </PrimaryButton>
        </form>
      </Card>
    </Layout>
  );
}
