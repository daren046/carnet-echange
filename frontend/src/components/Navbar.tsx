import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BookOpen,
  ChevronDown,
  History,
  Home,
  Library,
  LogOut,
  Package,
  PlusCircle,
  ShoppingBag,
  Ticket,
  Truck,
  Wallet,
} from "lucide-react";
import { AuthenticatedImage } from "./AuthenticatedImage";
import { useAuth } from "../context/AuthContext";
import { isDelivererOnly } from "../utils/roles";

const primaryNav = [
  { to: "/", label: "Accueil", icon: Home },
  { to: "/catalog", label: "Catalogue", icon: BookOpen },
  { to: "/deposit", label: "Déposer", icon: PlusCircle },
  { to: "/library", label: "Bibliothèque", icon: Library },
];

const accountNav = [
  { to: "/my-deposits", label: "Mes dépôts", icon: Package },
  { to: "/my-orders", label: "Commandes", icon: ShoppingBag },
  { to: "/wallet", label: "Mobile Money", icon: Wallet },
  { to: "/history", label: "Historique", icon: History },
];

const delivererNavItems = [
  { to: "/deliverer", label: "Tableau de bord", icon: Home },
  { to: "/deliveries", label: "Livraisons", icon: Truck },
];

function navLinkClass(active: boolean, deliverer: boolean) {
  if (active) {
    return deliverer
      ? "bg-orange-50 text-orange-800"
      : "bg-emerald-50 text-emerald-800";
  }
  return "text-slate-500 hover:bg-slate-50 hover:text-slate-800";
}

export function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const delivererMode = isDelivererOnly(user);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  const accountActive = accountNav.some((item) => location.pathname === item.to);

  useEffect(() => {
    setAccountOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const initials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : "";

  return (
    <header
      className={`sticky top-0 z-50 border-b bg-white/95 backdrop-blur-md ${
        delivererMode ? "border-orange-100" : "border-slate-200/80"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">
        <Link
          to={delivererMode ? "/deliverer" : "/"}
          className="flex shrink-0 items-center gap-2.5"
        >
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-xl ${
              delivererMode ? "bg-orange-600" : "bg-emerald-700"
            }`}
          >
            {delivererMode ? (
              <Truck className="h-5 w-5 text-white" />
            ) : (
              <BookOpen className="h-5 w-5 text-white" />
            )}
          </span>
          <span className="leading-tight">
            <span className="block text-[15px] font-semibold tracking-tight text-slate-900">
              {delivererMode ? "Carnet Livraison" : "Carnet d'Échange"}
            </span>
            <span className="hidden text-[11px] font-medium tracking-wide text-slate-400 sm:block">
              {delivererMode ? "Espace livreur" : "Manuels scolaires"}
            </span>
          </span>
        </Link>

        {user && (
          <nav className="hidden items-center gap-0.5 lg:flex">
            {(delivererMode ? delivererNavItems : primaryNav).map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium transition ${navLinkClass(
                  location.pathname === to,
                  delivererMode
                )}`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}

            {!delivererMode && (
              <div className="relative" ref={accountRef}>
                <button
                  type="button"
                  onClick={() => setAccountOpen((open) => !open)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-medium transition ${navLinkClass(
                    accountActive,
                    false
                  )}`}
                >
                  Mon espace
                  <ChevronDown className={`h-3.5 w-3.5 transition ${accountOpen ? "rotate-180" : ""}`} />
                </button>
                {accountOpen && (
                  <div className="absolute left-0 top-full z-50 mt-1 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                    {accountNav.map(({ to, label, icon: Icon }) => (
                      <Link
                        key={to}
                        to={to}
                        className={`flex items-center gap-2.5 px-3 py-2.5 text-[13px] ${
                          location.pathname === to
                            ? "bg-emerald-50 font-medium text-emerald-800"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </nav>
        )}

        <div className="flex items-center gap-3">
          {user ? (
            <>
              {!delivererMode && (
                <div className="hidden items-center gap-2 md:flex">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800">
                    <Ticket className="h-3.5 w-3.5" />
                    {user.stampBalance}
                  </span>
                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold tabular-nums text-slate-700">
                    {user.walletBalance.toLocaleString("fr-FR")} F
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white ${
                    delivererMode ? "bg-orange-600" : "bg-emerald-700"
                  }`}
                >
                  {initials}
                </div>
                <div className="hidden leading-tight sm:block">
                  <p className="text-[13px] font-medium text-slate-800">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {delivererMode ? user.zoneName ?? "Livreur" : user.zoneName ?? "Compte"}
                  </p>
                </div>
                <button
                  onClick={logout}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  title="Déconnexion"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="rounded-lg px-3 py-2 text-[13px] font-medium text-slate-600 hover:bg-slate-50"
              >
                Connexion
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-emerald-700 px-4 py-2 text-[13px] font-medium text-white shadow-sm hover:bg-emerald-800"
              >
                Inscription
              </Link>
            </div>
          )}
        </div>
      </div>

      {user && (
        <nav
          className={`flex gap-1 overflow-x-auto border-t px-2 py-1.5 lg:hidden ${
            delivererMode ? "border-orange-50" : "border-slate-100"
          }`}
        >
          {(delivererMode ? delivererNavItems : [...primaryNav, ...accountNav]).map(
            ({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium ${navLinkClass(
                  location.pathname === to,
                  delivererMode
                )}`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </Link>
            )
          )}
        </nav>
      )}
    </header>
  );
}

export function BookCard({
  book,
  action,
  size = "default",
}: {
  book: {
    id: number;
    title: string;
    photoUrl: string;
    subject: string;
    level: string;
    condition: string;
    zoneName: string;
    libraryMode?: boolean;
  };
  action?: React.ReactNode;
  size?: "default" | "gallery";
}) {
  const gallery = size === "gallery";
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className={`overflow-hidden bg-slate-100 ${gallery ? "aspect-[16/10]" : "aspect-[4/3]"}`}>
        <AuthenticatedImage src={book.photoUrl} alt={book.title} className="h-full w-full object-cover" />
      </div>
      <div className={gallery ? "p-5" : "p-4"}>
        <h3 className="font-semibold text-slate-900 line-clamp-2">{book.title}</h3>
        <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700">{book.level}</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">{book.subject}</span>
          <span className="rounded-full bg-slate-50 px-2 py-0.5 text-slate-500">{book.condition}</span>
          {book.libraryMode && (
            <span className="rounded-full bg-violet-50 px-2 py-0.5 text-violet-700">
              <Package className="inline h-3 w-3" /> Bibliothèque
            </span>
          )}
        </div>
        <p className="mt-2 text-xs text-slate-400">Zone {book.zoneName}</p>
        {action && <div className="mt-3">{action}</div>}
      </div>
    </div>
  );
}
