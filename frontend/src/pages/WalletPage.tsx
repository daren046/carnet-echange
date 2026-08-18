import { FormEvent, useState } from "react";
import { toast } from "react-toastify";
import { topUpWallet } from "../api/client";
import { Layout } from "../components/Layout";
import { Card, PageHeader, PrimaryButton, inputClass } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { PROVIDER_LABELS, type MobileMoneyProvider } from "../types";

const QUICK_AMOUNTS = [1000, 2000, 5000, 10000];

export function WalletPage() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    provider: "ORANGE_MONEY" as MobileMoneyProvider,
    phoneNumber: "",
    amount: 5000,
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await topUpWallet(form);
      toast.success(res.message || "Recharge confirmée !");
      setForm((f) => ({ ...f, phoneNumber: "" }));
      await refreshUser();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Erreur lors de la recharge");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <PageHeader
        title="Mobile Money"
        subtitle="Rechargez votre portefeuille pour la livraison et la bibliothèque"
      />
      <div className="mb-6 rounded-2xl border border-emerald-100 bg-emerald-50 px-6 py-5">
        <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">Solde actuel</p>
        <p className="mt-1 text-3xl font-semibold tabular-nums text-emerald-900">
          {(user?.walletBalance ?? 0).toLocaleString("fr-FR")} F
        </p>
      </div>
      <Card className="max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-slate-500">Simulation Orange Money, MTN et Moov.</p>
          <div>
            <label className="block text-sm font-medium text-slate-700">Opérateur</label>
            <select
              value={form.provider}
              onChange={(e) => setForm({ ...form, provider: e.target.value as MobileMoneyProvider })}
              className={inputClass}
            >
              {Object.entries(PROVIDER_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Numéro de téléphone</label>
            <input
              required
              type="tel"
              placeholder="Ex. 0700000000"
              value={form.phoneNumber}
              onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Montant (F CFA)</label>
            <input
              required
              type="number"
              min={100}
              step={100}
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
              className={inputClass}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {QUICK_AMOUNTS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setForm({ ...form, amount: a })}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                    form.amount === a
                      ? "bg-emerald-700 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {a.toLocaleString("fr-FR")} F
                </button>
              ))}
            </div>
          </div>
          <PrimaryButton type="submit" disabled={loading} className="w-full py-3">
            {loading ? "Recharge en cours..." : "Recharger"}
          </PrimaryButton>
        </form>
      </Card>
    </Layout>
  );
}
