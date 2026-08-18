import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getZones, register } from "../api/client";
import { Layout } from "../components/Layout";
import { Card, PageHeader, PrimaryButton, inputClass } from "../components/ui";
import { LEVEL_LABELS, ROLE_LABELS, type SchoolLevel, type UserRole, type Zone } from "../types";

const REGISTER_ROLES: UserRole[] = ["STUDENT", "PARENT"];

export function Register() {
  const navigate = useNavigate();
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "STUDENT" as UserRole,
    schoolLevel: "SIXIEME" as SchoolLevel,
    zoneCode: "",
  });

  useEffect(() => {
    getZones().then((res) => {
      setZones(res.data);
      if (res.data.length > 0) {
        setForm((f) => ({ ...f, zoneCode: res.data[0].code }));
      }
    });
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success("Inscription réussie — 1 tampon de bienvenue offert !");
      navigate("/login");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-lg pt-2">
        <PageHeader title="Inscription" subtitle="Créez votre compte et recevez 1 tampon de bienvenue" />
        <Card>
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
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Mot de passe (min. 6 car.)</label>
              <input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Profil</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })} className={inputClass}>
                {REGISTER_ROLES.map((role) => (
                  <option key={role} value={role}>{ROLE_LABELS[role]}</option>
                ))}
              </select>
            </div>
            {(form.role === "STUDENT" || form.role === "PARENT") && (
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
              <label className="block text-sm font-medium text-slate-700">Zone de livraison</label>
              <select required value={form.zoneCode} onChange={(e) => setForm({ ...form, zoneCode: e.target.value })} className={inputClass}>
                {zones.map((z) => (
                  <option key={z.code} value={z.code}>{z.name}</option>
                ))}
              </select>
            </div>
            <PrimaryButton type="submit" disabled={loading} className="w-full py-3">
              {loading ? "Inscription..." : "Créer mon compte"}
            </PrimaryButton>
          </form>
        </Card>
        <p className="mt-5 text-center text-sm text-slate-500">
          Déjà inscrit ?{" "}
          <Link to="/login" className="font-medium text-emerald-700 hover:underline">Se connecter</Link>
        </p>
      </div>
    </Layout>
  );
}
