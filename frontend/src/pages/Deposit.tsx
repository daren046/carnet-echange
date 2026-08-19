import { FormEvent, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Camera } from "lucide-react";
import { toast } from "react-toastify";
import { depositBook } from "../api/client";
import { Layout } from "../components/Layout";
import { Card, PageHeader, PrimaryButton, inputClass } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import {
  LEVEL_CATEGORIES,
  LEVEL_CATEGORY_TO_LEVEL,
  type LevelCategoryId,
} from "../components/BrowseShell";
import {
  CONDITION_LABELS,
  DECOR_SUBJECTS,
  SUBJECT_LABELS,
  type BookCondition,
  type ListingCategory,
  type OfferType,
} from "../types";
import { isSellerOnly } from "../utils/roles";

function defaultCategory(listingCategory: ListingCategory): string {
  if (listingCategory === "DECOR") return "MEUBLES";
  if (listingCategory === "MISC") return "AUTRE";
  return "primaire";
}

export function Deposit() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const seller = isSellerOnly(user);
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const initialRayon: ListingCategory =
    searchParams.get("rayon") === "deco" ? "DECOR" : searchParams.get("rayon") === "divers" ? "MISC" : "BOOKS";

  const [form, setForm] = useState({
    title: "",
    listingCategory: initialRayon,
    category: defaultCategory(initialRayon),
    condition: "BON" as BookCondition,
    offerType: "EXCHANGE" as OfferType,
    expectedPrice: "",
    libraryMode: false,
    anonymous: !user,
    quartier: user?.zoneName ?? "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
  });

  const setRayon = (listingCategory: ListingCategory) => {
    setForm((f) => ({
      ...f,
      listingCategory,
      category: defaultCategory(listingCategory),
      expectedPrice: listingCategory === "BOOKS" ? "" : f.expectedPrice,
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
    if (!form.quartier.trim()) {
      toast.error("Indiquez votre quartier");
      return;
    }
    if (!user) {
      if (form.contactName.trim().length < 2) {
        toast.error("Indiquez votre nom pour que l’on puisse vous contacter");
        return;
      }
      if (!form.contactPhone.replace(/[^0-9+]/g, "").match(/^\+?[0-9]{8,15}$/)) {
        toast.error("Indiquez un numéro de téléphone valide");
        return;
      }
    }
    const library = form.libraryMode && form.listingCategory === "BOOKS";
    const pricedSale = !library && form.listingCategory !== "BOOKS" && form.offerType === "SALE";
    const price = Number(form.expectedPrice.replace(/[^0-9]/g, ""));
    if (pricedSale && (!Number.isInteger(price) || price < 1)) {
      toast.error("Indiquez le prix attendu pour une vente");
      return;
    }

    const data = new FormData();
    data.append("title", form.title);
    data.append("listingCategory", form.listingCategory);
    data.append("condition", form.condition);
    data.append("libraryMode", String(library));
    data.append("anonymous", String(form.anonymous || !user));
    data.append("quartier", form.quartier.trim());
    data.append("photo", file);
    if (!library) {
      data.append("offerType", form.offerType);
      if (pricedSale) {
        data.append("expectedPrice", String(price));
      }
    }

    if (form.listingCategory === "BOOKS") {
      data.append("subject", "AUTRE");
      data.append("level", LEVEL_CATEGORY_TO_LEVEL[form.category as LevelCategoryId]);
    } else if (form.listingCategory === "DECOR") {
      data.append("subject", form.category);
    } else {
      data.append("subject", "AUTRE");
    }

    if (!user) {
      data.append("contactName", form.contactName.trim());
      data.append("contactPhone", form.contactPhone.trim());
      if (form.contactEmail.trim()) {
        data.append("contactEmail", form.contactEmail.trim());
      }
    }

    setLoading(true);
    try {
      const res = await depositBook(data);
      toast.success(res.message || "Annonce publiée");
      setForm((f) => ({
        ...f,
        title: "",
        offerType: "EXCHANGE",
        expectedPrice: "",
        libraryMode: false,
        anonymous: !user,
        contactName: "",
        contactPhone: "",
        contactEmail: "",
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

  return (
    <Layout>
      <PageHeader
        title="Déposer une annonce"
        subtitle={
          user
            ? "Livres, intérieur déco ou articles divers. Vous pouvez masquer votre nom."
            : "Publiez sans créer de compte : laissez un numéro pour être contacté directement."
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
            <div>
              <label className="block text-sm font-medium text-slate-700">Catégorie</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className={inputClass}
              >
                {form.listingCategory === "BOOKS"
                  ? LEVEL_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))
                  : DECOR_SUBJECTS.map((k) => (
                      <option key={k} value={k}>{SUBJECT_LABELS[k]}</option>
                    ))}
              </select>
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
          {!(form.libraryMode && form.listingCategory === "BOOKS") && (
            <div>
              <p className="text-sm font-medium text-slate-700">Vous proposez *</p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {(
                  [
                    ["EXCHANGE", "Échange"],
                    ["DONATION", "Don"],
                    ["SALE", "Vente"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm({ ...form, offerType: value, expectedPrice: value === "SALE" ? form.expectedPrice : "" })}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                      form.offerType === value
                        ? "border-emerald-700 bg-emerald-50 text-emerald-800"
                        : "border-slate-200 text-slate-600"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {form.offerType === "SALE" && form.listingCategory !== "BOOKS" && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-slate-700">Prix attendu (indicatif)</label>
                  <input
                    required
                    inputMode="numeric"
                    value={form.expectedPrice}
                    onChange={(e) => setForm({ ...form, expectedPrice: e.target.value })}
                    className={inputClass}
                    placeholder="Ex. 5000"
                  />
                  <p className="mt-1.5 text-xs text-slate-400">
                    Ce montant n’apparaît pas sur l’annonce. Seule l’équipe le voit, pour vous aider à conclure.
                  </p>
                </div>
              )}
              {form.offerType === "SALE" && form.listingCategory === "BOOKS" && (
                <p className="mt-2 text-xs text-slate-400">
                  Les manuels n’ont pas de prix : l’échange se fait par tampons ou directement entre vous.
                </p>
              )}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700">Quartier</label>
            <input
              required
              value={form.quartier}
              onChange={(e) => setForm({ ...form, quartier: e.target.value })}
              className={inputClass}
              placeholder="Ex. Cissin, Ouaga 2000, Tampouy…"
            />
          </div>
          {!user && (
            <div className="space-y-4 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
              <p className="text-sm font-medium text-emerald-900">
                Pour vous contacter directement (sans passer par l’équipe)
              </p>
              <div>
                <label className="block text-sm font-medium text-slate-700">Votre nom *</label>
                <input
                  required
                  value={form.contactName}
                  onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                  className={inputClass}
                  placeholder="Prénom ou nom"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Téléphone *</label>
                <input
                  required
                  type="tel"
                  value={form.contactPhone}
                  onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                  className={inputClass}
                  placeholder="Ex. 70 00 00 00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Email (optionnel)</label>
                <input
                  type="email"
                  value={form.contactEmail}
                  onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                  className={inputClass}
                  placeholder="pour recevoir un message"
                />
              </div>
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
          {user && (
            <label className="flex items-start gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={form.anonymous}
                onChange={(e) => setForm({ ...form, anonymous: e.target.checked })}
                className="mt-0.5 rounded border-slate-300 text-emerald-600"
              />
              Publier en utilisateur anonyme (votre nom n’apparaît pas)
            </label>
          )}
          {!user && (
            <p className="text-xs text-slate-400">
              Sans compte, votre nom d’utilisateur n’apparaît pas, mais votre téléphone reste visible pour les
              échanges.{" "}
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
