import { FormEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getZones, updateProfile } from "../api/client";
import { Layout } from "../components/Layout";
import { Card, PageHeader, PrimaryButton, inputClass } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { LEVEL_LABELS, ROLE_LABELS, type SchoolLevel, type Zone } from "../types";
import { isDelivererOnly } from "../utils/roles";

export function Profile() {
  const { user, refreshUser } = useAuth();
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    schoolLevel: (user?.schoolLevel ?? "SIXIEME") as SchoolLevel,
    zoneCode: user?.zoneCode ?? "",
    currentPassword: "",
    newPassword: "",
  });

  useEffect(() => {
    getZones().then((res) => {
      setZones(res.data);
      if (!form.zoneCode && res.data[0]) {
        setForm((f) => ({ ...f, zoneCode: user?.zoneCode ?? res.data[0].code }));
      }
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    setForm((f) => ({
      ...f,
      firstName: user.firstName,
      lastName: user.lastName,
      schoolLevel: user.schoolLevel ?? f.schoolLevel,
      zoneCode: user.zoneCode ?? f.zoneCode,
    }));
  }, [user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile({
        firstName: form.firstName,
        lastName: form.lastName,
        schoolLevel: form.schoolLevel,
        zoneCode: form.zoneCode,
        currentPassword: form.currentPassword || undefined,
        newPassword: form.newPassword || undefined,
      });
      toast.success("Profil mis à jour");
      setForm((f) => ({ ...f, currentPassword: "", newPassword: "" }));
      await refreshUser();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Impossible d'enregistrer le profil");
    } finally {
      setLoading(false);
    }
  };

  const student = user && !isDelivererOnly(user);

  return (
    <Layout>
      <PageHeader
        title="Mon compte"
        subtitle="Mettez à jour vos informations, votre zone et votre mot de passe."
        accent={isDelivererOnly(user) ? "orange" : "emerald"}
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <Card className="max-w-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">Prénom</label>
                <input required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Nom</label>
                <input required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className={inputClass} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Email</label>
              <input disabled value={user?.email ?? ""} className={`${inputClass} bg-slate-50 text-slate-500`} />
            </div>
            {student && (
              <div>
                <label className="block text-sm font-medium text-slate-700">Niveau scolaire</label>
                <select value={form.schoolLevel} onChange={(e) => setForm({ ...form, schoolLevel: e.target.value as SchoolLevel })} className={inputClass}>
                  {Object.entries(LEVEL_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700">Zone</label>
              <select required value={form.zoneCode} onChange={(e) => setForm({ ...form, zoneCode: e.target.value })} className={inputClass}>
                {zones.map((z) => (
                  <option key={z.code} value={z.code}>{z.name}</option>
                ))}
              </select>
            </div>
            <div className="border-t border-slate-100 pt-4">
              <p className="mb-3 text-sm font-medium text-slate-800">Changer le mot de passe</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Mot de passe actuel</label>
                  <input type="password" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Nouveau mot de passe</label>
                  <input type="password" minLength={6} value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} className={inputClass} />
                </div>
              </div>
            </div>
            <PrimaryButton type="submit" disabled={loading} variant={isDelivererOnly(user) ? "orange" : "emerald"} className="w-full py-3">
              {loading ? "Enregistrement..." : "Enregistrer"}
            </PrimaryButton>
          </form>
        </Card>
        <Card className="h-fit">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Compte</p>
          <p className="mt-2 font-medium text-slate-900">{user ? ROLE_LABELS[user.role] : "—"}</p>
          {!isDelivererOnly(user) && (
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Tampons</dt>
                <dd className="font-semibold text-emerald-800">{user?.stampBalance ?? 0}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Portefeuille</dt>
                <dd className="font-semibold tabular-nums">{(user?.walletBalance ?? 0).toLocaleString("fr-FR")} F</dd>
              </div>
            </dl>
          )}
        </Card>
      </div>
    </Layout>
  );
}
