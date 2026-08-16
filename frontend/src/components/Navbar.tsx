import { Link, useLocation } from "react-router-dom";
import { BookOpen, History, Home, Library, LogOut, Package, PlusCircle, ShoppingBag, Truck, Wallet } from "lucide-react";
import { AuthenticatedImage } from "./AuthenticatedImage";
import { useAuth } from "../context/AuthContext";
import { isDelivererOnly } from "../utils/roles";

const studentNavItems = [
  { to: "/", label: "Accueil", icon: Home },
  { to: "/catalog", label: "Catalogue", icon: BookOpen },
  { to: "/deposit", label: "Déposer", icon: PlusCircle },
  { to: "/my-deposits", label: "Mes dépôts", icon: Package },
  { to: "/my-orders", label: "Commandes", icon: ShoppingBag },
  { to: "/wallet", label: "Mobile Money", icon: Wallet },
  { to: "/history", label: "Historique", icon: History },
  { to: "/library", label: "Bibliothèque", icon: Library },
];

const delivererNavItems = [
  { to: "/deliverer", label: "Tableau de bord", icon: Home },
  { to: "/deliveries", label: "Livraisons", icon: Truck },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const delivererMode = isDelivererOnly(user);
  const navItems = delivererMode ? delivererNavItems : studentNavItems;

  return (
    <header className={`sticky top-0 z-50 border-b bg-white/90 backdrop-blur-md ${
      delivererMode ? "border-orange-100" : "border-emerald-100"
    }`}>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link
          to={delivererMode ? "/deliverer" : "/"}
          className={`flex items-center gap-2 font-bold ${delivererMode ? "text-orange-800" : "text-emerald-800"}`}
        >
          {delivererMode ? (
            <Truck className="h-6 w-6 text-orange-600" />
          ) : (
            <BookOpen className="h-6 w-6 text-emerald-600" />
          )}
          <span>{delivererMode ? "Carnet Livraison" : "Carnet d'Échange"}</span>
        </Link>

        {user && (
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  location.pathname === to
                    ? delivererMode
                      ? "bg-orange-100 text-orange-800"
                      : "bg-emerald-100 text-emerald-800"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden text-right text-sm sm:block">
                <p className="font-medium text-gray-800">
                  {user.firstName} {user.lastName}
                </p>
                {delivererMode ? (
                  <p className="text-orange-700">Livreur · {user.zoneName ?? "—"}</p>
                ) : (
                  <p className="text-emerald-700">
                    {user.stampBalance} tampon{user.stampBalance !== 1 ? "s" : ""} · {user.walletBalance.toLocaleString()} F
                  </p>
                )}
              </div>
              <button
                onClick={logout}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                title="Déconnexion"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </>
          ) : (
            <div className="flex gap-2">
              <Link to="/login" className="rounded-lg px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50">
                Connexion
              </Link>
              <Link to="/register" className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800">
                Inscription
              </Link>
            </div>
          )}
        </div>
      </div>

      {user && (
        <nav className={`flex gap-1 overflow-x-auto border-t px-2 py-2 md:hidden ${
          delivererMode ? "border-orange-50" : "border-emerald-50"
        }`}>
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex shrink-0 items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium ${
                location.pathname === to
                  ? delivererMode
                    ? "bg-orange-100 text-orange-800"
                    : "bg-emerald-100 text-emerald-800"
                  : "text-gray-600"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

export function BookCard({
  book,
  action,
}: {
  book: { id: number; title: string; photoUrl: string; subject: string; level: string; condition: string; zoneName: string; libraryMode?: boolean };
  action?: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md">
      <div className="aspect-[4/3] overflow-hidden bg-gray-100">
        <AuthenticatedImage src={book.photoUrl} alt={book.title} className="h-full w-full object-cover" />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-2">{book.title}</h3>
        <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">{book.level}</span>
          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-blue-700">{book.subject}</span>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-600">{book.condition}</span>
          {book.libraryMode && (
            <span className="rounded-full bg-purple-50 px-2 py-0.5 text-purple-700">
              <Package className="inline h-3 w-3" /> Bibliothèque
            </span>
          )}
        </div>
        <p className="mt-2 text-xs text-gray-500">Zone : {book.zoneName}</p>
        {action && <div className="mt-3">{action}</div>}
      </div>
    </div>
  );
}
