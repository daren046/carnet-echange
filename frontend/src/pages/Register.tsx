import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getZones, register } from "../api/client";
import { Layout } from "../components/Layout";
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

  const inputClass =
    "mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500";

  return (
    <Layout>
      <div className="mx-auto max-w-lg">
        <h1 className="text-2xl font-bold text-gray-900">Inscription</h1>
        <p className="mt-1 text-gray-500">Créez votre compte et recevez 1 tampon de bienvenue</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Prénom</label>
              <input required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom</label>
              <input required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mot de passe (min. 6 car.)</label>
            <input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Profil</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })} className={inputClass}>
              {REGISTER_ROLES.map((role) => (
                <option key={role} value={role}>{ROLE_LABELS[role]}</option>
              ))}
            </select>
          </div>
          {(form.role === "STUDENT" || form.role === "PARENT") && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Niveau scolaire</label>
              <select value={form.schoolLevel} onChange={(e) => setForm({ ...form, schoolLevel: e.target.value as SchoolLevel })} className={inputClass}>
                {Object.entries(LEVEL_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">Zone de livraison</label>
            <select required value={form.zoneCode} onChange={(e) => setForm({ ...form, zoneCode: e.target.value })} className={inputClass}>
              {zones.map((z) => (
                <option key={z.code} value={z.code}>{z.name}</option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={loading} className="w-full rounded-xl bg-emerald-700 py-3 font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">
            {loading ? "Inscription..." : "Créer mon compte"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          Déjà inscrit ?{" "}
          <Link to="/login" className="font-medium text-emerald-700 hover:underline">Se connecter</Link>
        </p>
      </div>
    </Layout>
  );
}
