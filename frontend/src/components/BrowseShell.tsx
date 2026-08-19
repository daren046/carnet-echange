import { Star } from "lucide-react";
import type { ReactNode } from "react";
import {
  BOOK_SUBJECTS,
  DECOR_SUBJECTS,
  SUBJECT_LABELS,
  type ListingCategory,
  type SchoolLevel,
  type Subject,
} from "../types";

export const PRIMARY_LEVELS: SchoolLevel[] = ["CP", "CE1", "CE2", "CM1", "CM2"];
export const COLLEGE_LEVELS: SchoolLevel[] = ["SIXIEME", "CINQUIEME", "QUATRIEME", "TROISIEME"];
export const LYCEE_LEVELS: SchoolLevel[] = ["SECONDE", "PREMIERE", "TERMINALE"];

export type CategoryId = "all" | "primaire" | "college" | "lycee" | Subject;

export function browseCategoriesFor(rayon: ListingCategory): { id: CategoryId; label: string }[] {
  if (rayon === "DECOR") {
    return [
      { id: "all", label: "Tout voir" },
      ...DECOR_SUBJECTS.map((id) => ({ id, label: SUBJECT_LABELS[id] })),
    ];
  }
  return [
    { id: "all", label: "Tout voir" },
    { id: "primaire", label: "Primaire" },
    { id: "college", label: "Collège" },
    { id: "lycee", label: "Lycée" },
    ...BOOK_SUBJECTS.map((id) => ({ id, label: SUBJECT_LABELS[id] })),
  ];
}

export function categoryGalleryTitle(id: CategoryId, rayon: ListingCategory = "BOOKS"): string {
  if (id === "all") return rayon === "DECOR" ? "Intérieur Déco" : "Livres";
  return browseCategoriesFor(rayon).find((c) => c.id === id)?.label ?? "Annonces";
}

export function bookMatchesCategory(
  level: SchoolLevel | null,
  subject: Subject,
  category: CategoryId
): boolean {
  if (category === "all") return true;
  if (category === "primaire") return level != null && PRIMARY_LEVELS.includes(level);
  if (category === "college") return level != null && COLLEGE_LEVELS.includes(level);
  if (category === "lycee") return level != null && LYCEE_LEVELS.includes(level);
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
  rayon = "BOOKS",
  children,
}: {
  banner?: ReactNode;
  hero?: ReactNode;
  activeCategory: CategoryId;
  onCategoryChange: (id: CategoryId) => void;
  extraFilter?: ReactNode;
  galleryTitle: string;
  rayon?: ListingCategory;
  children: ReactNode;
}) {
  const categories = browseCategoriesFor(rayon);
  return (
    <>
      {banner}
      {hero && <div className="mx-auto max-w-3xl px-4 py-8 md:py-10">{hero}</div>}
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 lg:flex-row lg:gap-12">
        <aside className="lg:w-52 lg:shrink-0">
          <nav className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            {categories.map((cat) => {
              const active = cat.id === activeCategory;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onCategoryChange(cat.id)}
                  className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] font-medium transition ${
                    active ? "bg-emerald-50 text-emerald-800" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  {cat.id === "all" && <Star className="h-4 w-4 fill-current" />}
                  {cat.label}
                </button>
              );
            })}
          </nav>
          {extraFilter && (
            <div className="mt-4 border-t border-slate-200 pt-4">{extraFilter}</div>
          )}
        </aside>
        <section className="min-w-0 flex-1 pb-16">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">
            {galleryTitle}
          </h2>
          <div className="mt-8">{children}</div>
        </section>
      </div>
    </>
  );
}
