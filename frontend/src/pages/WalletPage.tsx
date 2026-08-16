import { FormEvent, useState } from "react";
import { Smartphone, Wallet } from "lucide-react";
import { toast } from "react-toastify";
import { topUpWallet } from "../api/client";
import { Layout } from "../components/Layout";
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

  const inputClass =
    "mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500";

  return (
    <Layout>
      <div className="flex items-center gap-3">
        <Wallet className="h-8 w-8 text-emerald-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mobile Money</h1>
          <p className="text-gray-500">Rechargez votre portefeuille pour la livraison et la bibliothèque</p>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-emerald-100 bg-emerald-50 p-6">
        <p className="text-sm text-emerald-700">Solde actuel</p>
        <p className="text-4xl font-bold text-emerald-800">
          {(user?.walletBalance ?? 0).toLocaleString()} F
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 max-w-lg space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Smartphone className="h-4 w-4" />
          <span>Simulation Mobile Money — Orange Money, MTN, Moov</span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Opérateur</label>
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
          <label className="block text-sm font-medium text-gray-700">Numéro de téléphone</label>
          <input
            required
            type="tel"
            placeholder="Ex: 0700000000"
            value={form.phoneNumber}
            onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Montant (F CFA)</label>
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
                className={`rounded-lg px-3 py-1 text-sm ${
                  form.amount === a
                    ? "bg-emerald-700 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {a.toLocaleString()} F
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-emerald-700 py-3 font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
        >
          {loading ? "Recharge en cours..." : "Recharger"}
        </button>
      </form>
    </Layout>
  );
}
