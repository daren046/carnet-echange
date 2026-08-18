import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Layout } from "../components/Layout";
import { Card, PageHeader, PrimaryButton, inputClass } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { homePathFor } from "../utils/roles";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success("Connexion réussie");
      navigate(homePathFor(user));
    } catch {
      toast.error("Email ou mot de passe incorrect");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-md pt-6">
        <PageHeader title="Connexion" subtitle="Accédez à votre carnet d'échange" />
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Mot de passe</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
            </div>
            <PrimaryButton type="submit" disabled={loading} className="w-full py-3">
              {loading ? "Connexion..." : "Se connecter"}
            </PrimaryButton>
          </form>
        </Card>
        <p className="mt-5 text-center text-sm text-slate-500">
          Pas encore de compte ?{" "}
          <Link to="/register" className="font-medium text-emerald-700 hover:underline">
            S&apos;inscrire
          </Link>
        </p>
      </div>
    </Layout>
  );
}
