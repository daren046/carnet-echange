import { FormEvent, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  BookOpen,
  ChevronDown,
  CircleUser,
  HelpCircle,
  History,
  Home,
  Library,
  LogOut,
  Package,
  PlusCircle,
  Search,
  ShoppingBag,
  Store,
  Ticket,
  Truck,
  Wallet,
} from "lucide-react";
import { toast } from "react-toastify";
import { AuthenticatedImage } from "./AuthenticatedImage";
import { NotificationBell } from "./NotificationBell";
import { useAuth } from "../context/AuthContext";
import { homePathFor, isDelivererOnly, isSellerOnly } from "../utils/roles";

const primaryNav = [
  { to: "/", label: "Accueil", icon: Home },
  { to: "/annonces", label: "Catalogue", icon: BookOpen },
  { to: "/deposit", label: "Déposer", icon: PlusCircle },
  { to: "/library", label: "Bibliothèque", icon: Library },
];

const publicBarNav = [
  { to: "/", label: "Accueil" },
  { to: "/livres", label: "Livres" },
  { to: "/deco", label: "Intérieur Déco" },
  { to: "/deposit", label: "Déposer une annonce" },
  { to: "/annonces", label: "Voir toutes les annonces" },
];

const accountNav = [
  { to: "/profile", label: "Mon compte", icon: CircleUser },
  { to: "/seller", label: "Espace vendeur", icon: Store },
  { to: "/my-orders", label: "Commandes", icon: ShoppingBag },
  { to: "/wallet", label: "Mobile Money", icon: Wallet },
  { to: "/history", label: "Historique", icon: History },
  { to: "/a-propos", label: "Impact & FAQ", icon: HelpCircle },
];

const sellerNavItems = [
  { to: "/", label: "Accueil", icon: Home },
  { to: "/seller", label: "Mes ventes", icon: Store },
  { to: "/deposit", label: "Déposer", icon: PlusCircle },
  { to: "/profile", label: "Mon compte", icon: CircleUser },
];

const delivererNavItems = [
  { to: "/deliverer", label: "Tableau de bord", icon: Home },
  { to: "/deliveries", label: "Livraisons", icon: Truck },
  { to: "/profile", label: "Mon compte", icon: CircleUser },
];

function navLinkClass(active: boolean, mode: "deliverer" | "seller" | "default") {
  if (active) {
    if (mode === "deliverer") return "bg-orange-50 text-orange-800";
    if (mode === "seller") return "bg-teal-50 text-teal-800";
    return "bg-white/15 text-white";
  }
  return "text-white/80 hover:bg-white/10 hover:text-white";
}

const headerInputClass =
  "h-7 w-[9.5rem] rounded-sm border-0 bg-white px-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400";

export function Navbar() {
  const { user, logout, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const delivererMode = isDelivererOnly(user);
  const sellerMode = isSellerOnly(user);
  const navMode = delivererMode ? "deliverer" : sellerMode ? "seller" : "default";
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const accountActive = accountNav.some((item) => location.pathname === item.to);
  const mobileNav = delivererMode
    ? delivererNavItems
    : sellerMode
      ? sellerNavItems
      : [...primaryNav, ...accountNav];

  useEffect(() => {
    setAccountOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

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

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/annonces?q=${encodeURIComponent(q)}` : "/annonces");
  };

  const handleHeaderLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const logged = await login(email, password);
      toast.success("Connexion réussie");
      setEmail("");
      setPassword("");
      navigate(homePathFor(logged));
    } catch {
      toast.error("Identifiant ou mot de passe incorrect");
    } finally {
      setLoginLoading(false);
    }
  };

  if (delivererMode) {
    return (
      <header className="sticky top-0 z-50 border-b border-orange-100 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">
          <Link to="/deliverer" className="flex shrink-0 items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-600">
              <Truck className="h-5 w-5 text-white" />
            </span>
            <span className="leading-tight">
              <span className="block text-[15px] font-semibold tracking-tight text-slate-900">Perso</span>
              <span className="hidden text-[11px] font-medium tracking-wide text-slate-400 sm:block">
                Espace livreur
              </span>
            </span>
          </Link>
          <nav className="hidden items-center gap-0.5 lg:flex">
            {delivererNavItems.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium ${
                  location.pathname === to ? "bg-orange-50 text-orange-800" : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <span className="text-[13px] font-medium text-slate-800">
              {user?.firstName} {user?.lastName}
            </span>
            <button onClick={logout} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" title="Déconnexion">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-slate-900 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-3 py-2 sm:px-4">
          <Link to="/" className="flex shrink-0 items-center gap-2 pr-1">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-teal-600">
              <Store className="h-4 w-4 text-white" />
            </span>
            <span className="leading-tight">
              <span className="block text-lg font-bold tracking-tight">Perso</span>
              <span className="block text-[10px] leading-tight text-white/60">Entre toi et moi</span>
            </span>
          </Link>

          <form onSubmit={handleSearch} className="order-3 flex min-w-[200px] flex-1 basis-full sm:order-none sm:basis-auto">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un article"
              className="h-10 min-w-0 flex-1 rounded-l-md border-0 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button
              type="submit"
              className="inline-flex h-10 w-11 items-center justify-center rounded-r-md bg-amber-400 text-slate-900 hover:bg-amber-300"
              aria-label="Rechercher"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>

          <div className="ml-auto flex items-center gap-2">
            {user ? (
              <>
                <div className="hidden items-center gap-2 md:flex">
                  <span className="inline-flex items-center gap-1 rounded-sm bg-white/10 px-2 py-1 text-[11px] font-medium">
                    <Ticket className="h-3 w-3" />
                    {user.stampBalance}
                  </span>
                  <span className="text-[11px] font-semibold tabular-nums">{user.walletBalance.toLocaleString("fr-FR")} F</span>
                </div>
                <NotificationBell onDark />
                {!sellerMode && (
                  <div className="relative hidden lg:block" ref={accountRef}>
                    <button
                      type="button"
                      onClick={() => setAccountOpen((open) => !open)}
                      className={`flex items-center gap-1 rounded px-2.5 py-1.5 text-[13px] font-medium ${
                        accountActive ? "bg-white/15 text-white" : "text-white/80 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      Mon espace
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform ${accountOpen ? "rotate-180" : ""}`} />
                    </button>
                    {accountOpen && (
                      <div className="absolute right-0 top-full z-50 mt-1 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 text-slate-700 shadow-lg">
                        {accountNav.map(({ to, label, icon: Icon }) => (
                          <Link
                            key={to}
                            to={to}
                            className={`flex items-center gap-2.5 px-3 py-2.5 text-[13px] ${
                              location.pathname === to
                                ? "bg-emerald-50 font-medium text-emerald-800"
                                : "hover:bg-slate-50"
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
                <div className="flex items-center gap-2 border-l border-white/15 pl-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-600 text-[10px] font-semibold">
                    {initials}
                  </div>
                  <div className="hidden leading-tight sm:block">
                    <p className="text-[12px] font-medium">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-[10px] text-white/50">{user.zoneName ?? (sellerMode ? "Vendeur" : "Compte")}</p>
                  </div>
                  <button onClick={logout} className="rounded p-1.5 text-white/70 hover:bg-white/10" title="Déconnexion">
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={handleHeaderLogin} className="flex flex-wrap items-end justify-end gap-1.5">
                <label className="block">
                  <span className="mb-0.5 block text-[10px] text-white/60">Identifiant</span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={headerInputClass}
                    placeholder="email"
                    autoComplete="username"
                  />
                </label>
                <label className="block">
                  <span className="mb-0.5 block text-[10px] text-white/60">Mot de passe</span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={headerInputClass}
                    placeholder="••••••"
                    autoComplete="current-password"
                  />
                </label>
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="h-7 rounded-sm bg-amber-400 px-2.5 text-[11px] font-semibold text-slate-900 hover:bg-amber-300 disabled:opacity-60"
                >
                  {loginLoading ? "…" : "OK"}
                </button>
                <Link to="/register" className="pb-1 text-[10px] text-amber-300 hover:underline">
                  Nouveau ?
                </Link>
              </form>
            )}
          </div>
        </div>
      </div>

      <nav className="bg-teal-800 text-white">
        <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto overflow-y-hidden px-2 py-1.5 sm:px-4">
          {publicBarNav.map(({ to, label }) => {
            const active =
              to === "/"
                ? location.pathname === "/"
                : location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`shrink-0 rounded px-3 py-1.5 text-[13px] font-medium ${
                  active ? "bg-white/15" : "hover:bg-white/10"
                }`}
              >
                {label}
              </Link>
            );
          })}
          {sellerMode && (
            <Link
              to="/seller"
              className={`ml-auto shrink-0 rounded px-3 py-1.5 text-[13px] font-medium ${
                location.pathname === "/seller" ? "bg-white/15" : "hover:bg-white/10"
              }`}
            >
              Espace vendeur
            </Link>
          )}
        </div>
        {user && !sellerMode && (
          <div className="flex gap-1 overflow-x-auto overflow-y-hidden border-t border-white/10 px-2 py-1 lg:hidden">
            {mobileNav.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex shrink-0 items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium ${navLinkClass(
                  location.pathname === to,
                  navMode
                )}`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </Link>
            ))}
          </div>
        )}
      </nav>
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
    level?: string | null;
    condition: string;
    zoneName: string;
    libraryMode?: boolean;
    depositorName?: string;
    anonymous?: boolean;
    listingCategory?: string;
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
          {book.level && (
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700">{book.level}</span>
          )}
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">{book.subject}</span>
          <span className="rounded-full bg-slate-50 px-2 py-0.5 text-slate-500">{book.condition}</span>
          {book.libraryMode && (
            <span className="rounded-full bg-violet-50 px-2 py-0.5 text-violet-700">
              <Package className="inline h-3 w-3" /> Bibliothèque
            </span>
          )}
          {book.anonymous && (
            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-white">Anonyme</span>
          )}
        </div>
        <p className="mt-2 text-xs text-slate-400">
          {book.depositorName ? `${book.depositorName} · ` : ""}Zone {book.zoneName}
        </p>
        {action && <div className="mt-3">{action}</div>}
      </div>
    </div>
  );
}
