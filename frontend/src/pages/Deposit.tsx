import { FormEvent, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Camera } from "lucide-react";
import { toast } from "react-toastify";
import { depositBook } from "../api/client";
import { Layout } from "../components/Layout";
import { PhoneOtpFields } from "../components/PhoneOtpFields";
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
  formatCauris,
  proposedCaurisFor,
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
  const [wanted, setWanted] = useState(searchParams.get("intention") === "recherche");

  const setIntention = (isWanted: boolean) => {
    setWanted(isWanted);
    const next = new URLSearchParams(searchParams);
    if (isWanted) next.set("intention", "recherche");
    else next.delete("intention");
    const qs = next.toString();
    navigate(qs ? `/deposit?${qs}` : "/deposit", { replace: true });
  };

  useEffect(() => {
    setWanted(searchParams.get("intention") === "recherche");
  }, [searchParams]);
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [phoneToken, setPhoneToken] = useState("");
  const initialRayon: ListingCategory =
    searchParams.get("rayon") === "deco" ? "DECOR" : searchParams.get("rayon") === "divers" ? "MISC" : "BOOKS";

  const [form, setForm] = useState({
    title: "",
    listingCategory: initialRayon,
    category: defaultCategory(initialRayon),
    condition: "BON" as BookCondition,
    offerType: "EXCHANGE" as OfferType,
    expectedPrice: "",
    extraCaurisRequested: false,
    extraCaurisNote: "",
    description: "",
    libraryMode: false,
    anonymous: !user,
    quartier: user?.zoneName ?? "",
    contactName: "",
    contactPhone: user?.phone ?? "",
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
    if (!wanted && !file) {
      toast.error("La photo est obligatoire");
      return;
    }
    if (!form.quartier.trim()) {
      toast.error("Indiquez votre quartier");
      return;
    }
    if (wanted && form.description.trim().length < 10) {
      toast.error("Décrivez un peu l’article que vous cherchez");
      return;
    }
    const phoneOk = !!form.contactPhone.replace(/[^0-9+]/g, "").match(/^\+?[0-9]{8,15}$/);
    const accountPhone = user?.phone?.replace(/[^0-9+]/g, "") ?? "";
    const sameAccountPhone = Boolean(accountPhone && form.contactPhone.replace(/[^0-9+]/g, "") === accountPhone);
    const needsPhoneOtp = !user || (wanted && !sameAccountPhone);
    if (!user) {
      if (!form.contactEmail.trim().includes("@")) {
        toast.error("Indiquez votre email");
        return;
      }
      if (!phoneOk) {
        toast.error("Indiquez un numéro de téléphone valide");
        return;
      }
      if (!phoneToken) {
        toast.error("Confirmez votre numéro avec le code reçu");
        return;
      }
    }
    if (wanted && !phoneOk) {
      toast.error("Indiquez un numéro pour que l’on puisse vous proposer l’article");
      return;
    }
    if (wanted && user && needsPhoneOtp && !phoneToken) {
      toast.error("Confirmez votre numéro avec le code reçu");
      return;
    }
    const library = form.libraryMode && form.listingCategory === "BOOKS";
    const pricedSale = !library && form.listingCategory !== "BOOKS" && form.offerType === "SALE";
    const price = Number(form.expectedPrice.replace(/[^0-9]/g, ""));
    if (pricedSale && (!Number.isInteger(price) || price < 1)) {
      toast.error("Indiquez le prix attendu pour une vente");
      return;
    }
    if (user && !wanted && !library && form.extraCaurisRequested && form.extraCaurisNote.trim().length < 8) {
      toast.error("Précisez pourquoi cet article justifie des cauris supplémentaires");
      return;
    }

    const data = new FormData();
    data.append("title", form.title);
    data.append("listingCategory", form.listingCategory);
    data.append("condition", form.condition);
    data.append("libraryMode", String(library && !wanted));
    data.append("anonymous", String(form.anonymous));
    data.append("quartier", form.quartier.trim());
    data.append("listingKind", wanted ? "WANTED" : "OFFER");
    if (form.description.trim()) {
      data.append("description", form.description.trim());
    }
    if (file) {
      data.append("photo", file);
    }
    if (!library && !wanted) {
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

    if (user && !wanted && !library && form.extraCaurisRequested) {
      data.append("extraCaurisRequested", "true");
      data.append("extraCaurisNote", form.extraCaurisNote.trim());
    }

    if (!user || wanted) {
      if (form.contactName.trim()) {
        data.append("contactName", form.contactName.trim());
      }
      if (form.contactPhone.trim()) {
        data.append("contactPhone", form.contactPhone.trim());
      }
      if (form.contactEmail.trim()) {
        data.append("contactEmail", form.contactEmail.trim());
      }
      if (phoneToken) {
        data.append("phoneVerificationToken", phoneToken);
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
        extraCaurisRequested: false,
        extraCaurisNote: "",
        description: "",
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
        navigate("/a-propos");
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
          wanted
            ? user
              ? "Dites ce que vous cherchez : un membre qui l’a pourra vous contacter."
              : "Sans compte, la recherche est relue par l’équipe. Laissez un numéro pour qu’on vous propose l’article."
            : user
              ? "Livres, intérieur déco ou articles divers. Don, vente ou échange : des cauris sont proposés automatiquement, puis validés selon l’état."
              : "Sans compte, l’annonce est relue par l’équipe. Vous pouvez publier, mais vous perdez les avantages liés aux cauris — inscrivez-vous dès que possible."
        }
        accent={seller ? "teal" : "emerald"}
      />
      <div className="mb-4 flex max-w-lg gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
        <button
          type="button"
          onClick={() => setIntention(false)}
          className={`flex-1 rounded-lg px-3 py-2 text-center text-sm font-medium ${
            !wanted ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          J’ai un article
        </button>
        <button
          type="button"
          onClick={() => setIntention(true)}
          className={`flex-1 rounded-lg px-3 py-2 text-center text-sm font-medium ${
            wanted ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Je cherche un article
        </button>
      </div>
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
            <label className="block text-sm font-medium text-slate-700">
              {wanted ? "Photo (optionnelle)" : "Photo *"}
            </label>
            <div
              onClick={() => fileRef.current?.click()}
              className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 py-10 hover:border-emerald-400"
            >
              {preview ? (
                <img src={preview} alt="Aperçu" className="max-h-48 rounded-lg object-contain" />
              ) : (
                <>
                  <Camera className="h-10 w-10 text-slate-300" />
                  <p className="mt-2 text-sm text-slate-400">
                    {wanted ? "Une image d’exemple, si vous en avez une" : "Cliquez pour ajouter une photo"}
                  </p>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handlePhoto(e.target.files?.[0])} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">{wanted ? "Vous cherchez" : "Titre"}</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={inputClass}
              placeholder={
                form.listingCategory === "DECOR"
                  ? wanted ? "Ex. Canapé 3 places en tissu" : "Ex. Canapé 3 places"
                  : form.listingCategory === "MISC"
                    ? wanted ? "Ex. Cartable CE2" : "Ex. Cartable, vélo enfant"
                    : wanted ? "Ex. Transmath 6ème — édition récente" : "Ex. Transmath 6ème"
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
            <label className="block text-sm font-medium text-slate-700">{wanted ? "Précisions *" : "Description"}</label>
            <textarea
              required={wanted}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={inputClass}
              rows={wanted ? 4 : 3}
              placeholder={
                wanted
                  ? "Niveau, édition, état souhaité, ce dont vous avez besoin…"
                  : "Quelques mots pour décrire l’article (optionnel)"
              }
            />
          </div>
          {!wanted && (
            <>
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
            {user && !form.libraryMode && (
              <p className="mt-1 text-xs text-amber-800">
                Proposition automatique : {formatCauris(proposedCaurisFor(form.condition))} selon l’état.
                L’équipe validera ensuite avant crédit.
              </p>
            )}
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
                  Les manuels n’ont pas de prix : l’échange se fait par cauris ou directement entre vous.
                </p>
              )}
            </div>
          )}
            </>
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
                Contact — comme sur Amazon : email et téléphone confirmé par code
              </p>
              <div>
                <label className="block text-sm font-medium text-slate-700">Email *</label>
                <input
                  required
                  type="email"
                  value={form.contactEmail}
                  onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                  className={inputClass}
                  placeholder="pour vous écrire"
                />
              </div>
              <PhoneOtpFields
                phone={form.contactPhone}
                onPhoneChange={(contactPhone) => setForm({ ...form, contactPhone })}
                token={phoneToken}
                onVerified={setPhoneToken}
              />
              {form.anonymous && (
                <p className="text-xs text-slate-500">
                  Votre identité n’apparaît pas sur l’annonce. Le téléphone et l’email restent pour l’équipe.
                </p>
              )}
            </div>
          )}
          {wanted && user && (
            <div className="space-y-3">
              {user.phone && form.contactPhone.replace(/[^0-9+]/g, "") === user.phone.replace(/[^0-9+]/g, "") ? (
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
                  <p className="mt-1.5 text-xs text-slate-400">
                    Numéro déjà confirmé sur votre compte. Visible sur la recherche.
                  </p>
                </div>
              ) : (
                <PhoneOtpFields
                  phone={form.contactPhone}
                  onPhoneChange={(contactPhone) => setForm({ ...form, contactPhone })}
                  token={phoneToken}
                  onVerified={setPhoneToken}
                />
              )}
            </div>
          )}
          {user && !wanted && form.listingCategory === "BOOKS" && !seller && (
            <label className="flex items-start gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={form.libraryMode}
                onChange={(e) => setForm({ ...form, libraryMode: e.target.checked })}
                className="mt-0.5 rounded border-slate-300 text-emerald-600"
              />
              Déposer en mode bibliothèque (emprunt avec caution, pas de cauris)
            </label>
          )}
          {user && !wanted && !form.libraryMode && (
            <div className="space-y-2 rounded-xl border border-amber-100 bg-amber-50/60 p-4">
              <p className="text-xs text-slate-600">
                Vous pouvez aussi demander des cauris supplémentaires : nos équipes vous feront un retour sous 48 h.
              </p>
              <label className="flex items-start gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.extraCaurisRequested}
                  onChange={(e) => setForm({ ...form, extraCaurisRequested: e.target.checked })}
                  className="mt-0.5 rounded border-slate-300 text-amber-600"
                />
                Demander des cauris supplémentaires pour cet article
              </label>
              {form.extraCaurisRequested && (
                <>
                  <textarea
                    required
                    value={form.extraCaurisNote}
                    onChange={(e) => setForm({ ...form, extraCaurisNote: e.target.value })}
                    className={inputClass}
                    rows={3}
                    placeholder="Précisez la catégorie ou l’intérêt particulier de l’article…"
                  />
                  <p className="text-xs text-slate-500">
                    Nos équipes vous feront un retour sous 48 h, après validation de l’état.
                  </p>
                </>
              )}
            </div>
          )}
          <label className="flex items-start gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={form.anonymous}
              onChange={(e) => setForm({ ...form, anonymous: e.target.checked })}
              className="mt-0.5 rounded border-slate-300 text-emerald-600"
            />
            Publier en anonyme (votre nom n’apparaît pas)
          </label>
          {!user && (
            <p className="text-xs text-slate-400">
              Sans compte, {wanted ? "la recherche" : "l’offre"} est soumise à validation.{" "}
              {form.anonymous
                ? "Elle restera anonyme. "
                : "Votre téléphone confirmé pourra être visible une fois publiée. "}
              <Link to="/register" className="text-emerald-700 hover:underline">Créer un compte</Link>
              {wanted ? " pour publier immédiatement." : " : vous perdez les avantages liés aux cauris. Inscrivez-vous dès que possible."}
            </p>
          )}
          <PrimaryButton type="submit" disabled={loading} className="w-full py-3">
            {loading
              ? "Envoi..."
              : user
                ? wanted
                  ? "Publier la recherche"
                  : "Publier l’offre"
                : "Soumettre pour validation"}
          </PrimaryButton>
        </form>
      </Card>
    </Layout>
  );
}
