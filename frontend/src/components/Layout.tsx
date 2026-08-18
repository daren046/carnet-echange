import { Navbar } from "./Navbar";

export function Layout({
  children,
  wide = false,
}: {
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="min-h-screen">
      <Navbar />
      {wide ? (
        <main>{children}</main>
      ) : (
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      )}
    </div>
  );
}
