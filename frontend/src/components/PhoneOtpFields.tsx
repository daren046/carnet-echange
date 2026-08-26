import { FormEvent, useState } from "react";
import { toast } from "react-toastify";
import { confirmPhoneCode, sendPhoneCode } from "../api/client";
import { PrimaryButton, inputClass } from "./ui";

export function PhoneOtpFields({
  phone,
  onPhoneChange,
  token,
  onVerified,
  required = true,
}: {
  phone: string;
  onPhoneChange: (value: string) => void;
  token: string;
  onVerified: (token: string) => void;
  required?: boolean;
}) {
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [sent, setSent] = useState(false);

  const handlePhoneChange = (value: string) => {
    onPhoneChange(value);
    if (token) onVerified("");
    setSent(false);
    setCode("");
  };

  const handleSend = async (e?: FormEvent) => {
    e?.preventDefault();
    setSending(true);
    try {
      const res = await sendPhoneCode(phone);
      setSent(true);
      toast.success(res.message || "Code envoyé");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Impossible d’envoyer le code");
    } finally {
      setSending(false);
    }
  };

  const handleConfirm = async (e?: FormEvent) => {
    e?.preventDefault();
    setConfirming(true);
    try {
      const res = await confirmPhoneCode(phone, code);
      onVerified(res.data.verificationToken);
      toast.success("Numéro confirmé");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Code incorrect");
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-slate-700">Téléphone *</label>
        <div className="mt-1 flex flex-col gap-2 sm:flex-row">
          <input
            required={required}
            type="tel"
            value={phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            className={`${inputClass} mt-0`}
            placeholder="Ex. 70 00 00 00"
          />
          <PrimaryButton type="button" onClick={handleSend} disabled={sending} className="shrink-0 px-4">
            {sending ? "Envoi..." : sent ? "Renvoyer le code" : "Envoyer le code"}
          </PrimaryButton>
        </div>
        <p className="mt-1.5 text-xs text-slate-400">
          Un code à 6 chiffres confirme que ce numéro est bien le vôtre.
        </p>
      </div>
      {(sent || token) && !token && (
        <div>
          <label className="block text-sm font-medium text-slate-700">Code de confirmation *</label>
          <div className="mt-1 flex flex-col gap-2 sm:flex-row">
            <input
              required={required}
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className={`${inputClass} mt-0 tracking-[0.35em]`}
              placeholder="••••••"
            />
            <PrimaryButton type="button" onClick={handleConfirm} disabled={confirming} className="shrink-0 px-4">
              {confirming ? "Vérification..." : "Valider"}
            </PrimaryButton>
          </div>
        </div>
      )}
      {token && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Numéro confirmé.
        </p>
      )}
    </div>
  );
}
