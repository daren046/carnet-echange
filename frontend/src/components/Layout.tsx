import { Link } from "react-router-dom";
import { Navbar } from "./Navbar";

export function Layout({
  children,
  wide = false,
}: {
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      {wide ? (
        <main className="flex-1">{children}</main>
      ) : (
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">{children}</main>
      )}
      <footer className="mt-auto border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>Perso — livres, déco et articles divers, à Ouagadougou</p>
          <Link to="/a-propos" className="text-emerald-700 hover:underline">Impact & FAQ</Link>
        </div>
      </footer>
    </div>
  );
}
