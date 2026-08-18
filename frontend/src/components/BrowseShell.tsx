import { Star } from "lucide-react";
import type { ReactNode } from "react";
import { SUBJECT_LABELS, type SchoolLevel, type Subject } from "../types";

export const PRIMARY_LEVELS: SchoolLevel[] = ["CP", "CE1", "CE2", "CM1", "CM2"];
export const COLLEGE_LEVELS: SchoolLevel[] = ["SIXIEME", "CINQUIEME", "QUATRIEME", "TROISIEME"];
export const LYCEE_LEVELS: SchoolLevel[] = ["SECONDE", "PREMIERE", "TERMINALE"];

export type CategoryId = "all" | "primaire" | "college" | "lycee" | Subject;

export const BROWSE_CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: "all", label: "Tout voir" },
  { id: "primaire", label: "Primaire" },
  { id: "college", label: "Collège" },
  { id: "lycee", label: "Lycée" },
  ...(Object.entries(SUBJECT_LABELS) as [Subject, string][]).map(([id, label]) => ({ id, label })),
];

export function categoryGalleryTitle(id: CategoryId): string {
  if (id === "all") return "Tous les manuels";
  return BROWSE_CATEGORIES.find((c) => c.id === id)?.label ?? "Manuels";
}

export function bookMatchesCategory(level: SchoolLevel, subject: Subject, category: CategoryId): boolean {
  if (category === "all") return true;
  if (category === "primaire") return PRIMARY_LEVELS.includes(level);
  if (category === "college") return COLLEGE_LEVELS.includes(level);
  if (category === "lycee") return LYCEE_LEVELS.includes(level);
  return subject === category;
}

export function isSubjectCategory(id: CategoryId): id is Subject {
  return id !== "all" && id !== "primaire" && id !== "college" && id !== "lycee";
}

export function BrowseShell({
  banner,
  hero,
  activeCategory,
  onCategoryChange,
  extraFilter,
  galleryTitle,
  children,
}: {
  banner?: ReactNode;
  hero?: ReactNode;
  activeCategory: CategoryId;
  onCategoryChange: (id: CategoryId) => void;
  extraFilter?: ReactNode;
  galleryTitle: string;
  children: ReactNode;
}) {
  return (
    <>
      {banner}
      {hero && <div className="mx-auto max-w-3xl px-4 py-10 md:py-14">{hero}</div>}
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 lg:flex-row lg:gap-12">
        <aside className="lg:w-52 lg:shrink-0">
          <nav className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            {BROWSE_CATEGORIES.map((cat) => {
              const active = cat.id === activeCategory;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onCategoryChange(cat.id)}
                  className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
                    active ? "bg-emerald-100 text-emerald-800" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {cat.id === "all" && <Star className="h-4 w-4 fill-current" />}
                  {cat.label}
                </button>
              );
            })}
          </nav>
          {extraFilter && (
            <div className="mt-4 border-t border-gray-200 pt-4">{extraFilter}</div>
          )}
        </aside>
        <section className="min-w-0 flex-1 pb-16">
          <h2 className="text-center text-sm font-bold tracking-[0.22em] text-gray-800 uppercase">
            {galleryTitle}
          </h2>
          <div className="mt-8">{children}</div>
        </section>
      </div>
    </>
  );
}
