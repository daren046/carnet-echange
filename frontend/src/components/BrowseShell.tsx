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
export const SECONDARY_LEVELS: SchoolLevel[] = ["SIXIEME", "CINQUIEME", "QUATRIEME", "TROISIEME"];
export const LYCEE_LEVELS: SchoolLevel[] = ["SECONDE", "PREMIERE", "TERMINALE"];
export const UNIVERSITY_LEVELS: SchoolLevel[] = ["UNIVERSITE"];

export type LevelCategoryId = "primaire" | "secondaire" | "lycee" | "universite";
export type RayonFilterId = "rayon-livres" | "rayon-deco";
export type CategoryId = "all" | LevelCategoryId | RayonFilterId | Subject;

export const LEVEL_CATEGORIES: { id: LevelCategoryId; label: string; desc: string }[] = [
  { id: "primaire", label: "Primaire", desc: "CP à CM2" },
  { id: "secondaire", label: "Secondaire", desc: "6e à 3e" },
  { id: "lycee", label: "Lycée", desc: "Seconde à Terminale" },
  { id: "universite", label: "Université", desc: "Licence et master" },
];

export function browseCategoriesFor(rayon: ListingCategory | "ALL"): { id: CategoryId; label: string }[] {
  if (rayon === "ALL") {
    return [
      { id: "all", label: "Tout voir" },
      { id: "rayon-livres", label: "Livres" },
      { id: "rayon-deco", label: "Intérieur Déco" },
    ];
  }
  if (rayon === "DECOR") {
    return [
      { id: "all", label: "Tout voir" },
      ...DECOR_SUBJECTS.map((id) => ({ id, label: SUBJECT_LABELS[id] })),
    ];
  }
  return [
    { id: "all", label: "Tout voir" },
    ...LEVEL_CATEGORIES.map(({ id, label }) => ({ id, label })),
    ...BOOK_SUBJECTS.map((id) => ({ id, label: SUBJECT_LABELS[id] })),
  ];
}

export function categoryGalleryTitle(id: CategoryId, rayon: ListingCategory | "ALL" = "BOOKS"): string {
  if (id === "all") {
    if (rayon === "DECOR") return "Intérieur Déco";
    if (rayon === "ALL") return "Toutes les annonces";
    return "Livres";
  }
  return browseCategoriesFor(rayon === "ALL" ? "BOOKS" : rayon).find((c) => c.id === id)?.label
    ?? browseCategoriesFor("ALL").find((c) => c.id === id)?.label
    ?? "Annonces";
}

export function bookMatchesCategory(
  level: SchoolLevel | null,
  subject: Subject,
  listingCategory: ListingCategory | undefined,
  category: CategoryId
): boolean {
  if (category === "all") return true;
  if (category === "rayon-livres") return listingCategory !== "DECOR";
  if (category === "rayon-deco") return listingCategory === "DECOR";
  if (category === "primaire") return level != null && PRIMARY_LEVELS.includes(level);
  if (category === "secondaire") return level != null && SECONDARY_LEVELS.includes(level);
  if (category === "lycee") return level != null && LYCEE_LEVELS.includes(level);
  if (category === "universite") return level != null && UNIVERSITY_LEVELS.includes(level);
  return subject === category;
}

const LEVEL_IDS: CategoryId[] = ["primaire", "secondaire", "lycee", "universite"];

export function isSubjectCategory(id: CategoryId): id is Subject {
  return id !== "all" && id !== "rayon-livres" && id !== "rayon-deco" && !LEVEL_IDS.includes(id);
}

function navButtonClass(active: boolean) {
  return `flex w-full shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] font-medium transition ${
    active ? "bg-emerald-50 text-emerald-800" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
  }`;
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
  rayon?: ListingCategory | "ALL";
  children: ReactNode;
}) {
  const subjectItems =
    rayon === "DECOR"
      ? DECOR_SUBJECTS.map((id) => ({ id, label: SUBJECT_LABELS[id] }))
      : BOOK_SUBJECTS.map((id) => ({ id, label: SUBJECT_LABELS[id] }));

  return (
    <>
      {banner}
      {hero && <div className="mx-auto max-w-3xl px-4 py-8 md:py-10">{hero}</div>}
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 lg:flex-row lg:gap-12">
        <aside className="lg:w-52 lg:shrink-0">
          <nav className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            <button
              type="button"
              onClick={() => onCategoryChange("all")}
              className={navButtonClass(activeCategory === "all")}
            >
              <Star className="h-4 w-4 fill-current" />
              Tout voir
            </button>

            {rayon === "ALL" && (
              <>
                <button type="button" onClick={() => onCategoryChange("rayon-livres")} className={navButtonClass(activeCategory === "rayon-livres")}>
                  Livres
                </button>
                <button type="button" onClick={() => onCategoryChange("rayon-deco")} className={navButtonClass(activeCategory === "rayon-deco")}>
                  Intérieur Déco
                </button>
              </>
            )}

            {rayon === "BOOKS" && (
              <>
                <p className="hidden px-3 pt-4 pb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400 lg:block">
                  Par niveau
                </p>
                {LEVEL_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => onCategoryChange(cat.id)}
                    className={navButtonClass(activeCategory === cat.id)}
                  >
                    {cat.label}
                  </button>
                ))}
                <p className="hidden px-3 pt-4 pb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400 lg:block">
                  Par matière
                </p>
                {subjectItems.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => onCategoryChange(cat.id)}
                    className={navButtonClass(activeCategory === cat.id)}
                  >
                    {cat.label}
                  </button>
                ))}
              </>
            )}

            {rayon === "DECOR" &&
              subjectItems.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onCategoryChange(cat.id)}
                  className={navButtonClass(activeCategory === cat.id)}
                >
                  {cat.label}
                </button>
              ))}
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
