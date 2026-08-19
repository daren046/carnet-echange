export type UserRole = "STUDENT" | "PARENT" | "SELLER" | "DELIVERER" | "LIBRARIAN" | "ADMIN";

export type SchoolLevel =
  | "CP" | "CE1" | "CE2" | "CM1" | "CM2"
  | "SIXIEME" | "CINQUIEME" | "QUATRIEME" | "TROISIEME"
  | "SECONDE" | "PREMIERE" | "TERMINALE"
  | "UNIVERSITE";

export type Subject =
  | "MATHEMATIQUES" | "FRANCAIS" | "HISTOIRE_GEO" | "ANGLAIS"
  | "ESPAGNOL" | "ALLEMAND" | "SVT" | "PHYSIQUE_CHIMIE"
  | "TECHNOLOGIE" | "ARTS" | "MUSIQUE" | "EPS" | "AUTRE"
  | "MEUBLES" | "LUMINAIRES" | "TEXTILE" | "VAISSELLE" | "DECORATION";

export type ListingCategory = "BOOKS" | "DECOR" | "MISC";
export type OfferType = "EXCHANGE" | "DONATION" | "SALE";

export type BookCondition = "NEUF" | "BON" | "MOYEN" | "ABIME";
export type CopyStatus = "AVAILABLE" | "RESERVED" | "IN_DELIVERY" | "DELIVERED" | "LIBRARY_BORROWED";
export type DeliveryStatus = "PENDING" | "IN_PROGRESS" | "DELIVERED";
export type TransactionType =
  | "WELCOME_BONUS" | "DEPOSIT" | "PICKUP" | "PICKUP_REFUND"
  | "DELIVERY_PAYMENT" | "DELIVERY_REFUND" | "WALLET_TOPUP"
  | "LIBRARY_DEPOSIT" | "LIBRARY_REFUND";

export type MobileMoneyProvider = "ORANGE_MONEY" | "MTN_MONEY" | "MOOV_MONEY";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface UserMe {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  schoolLevel: SchoolLevel | null;
  zoneId: number | null;
  zoneName: string | null;
  zoneCode: string | null;
  stampBalance: number;
  depositBalance: number;
  walletBalance: number;
}

export type NotificationType =
  | "WELCOME"
  | "BOOK_RESERVED"
  | "BOOK_AVAILABLE"
  | "DELIVERY_STARTED"
  | "DELIVERED";

export interface AppNotification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

export interface ImpactStats {
  booksDeposited: number;
  booksAvailable: number;
  booksDelivered: number;
  members: number;
  estimatedSavedCfa: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface Zone {
  id: number;
  code: string;
  name: string;
}

export interface BookCopy {
  id: number;
  title: string;
  subject: Subject;
  level: SchoolLevel | null;
  condition: BookCondition;
  photoUrl: string;
  depositorName: string;
  zoneName: string;
  status: CopyStatus;
  libraryMode: boolean;
  reservedByName: string | null;
  createdAt: string;
  listingCategory: ListingCategory;
  anonymous: boolean;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  offerType: OfferType;
  expectedPrice: number | null;
}

export interface Transaction {
  id: number;
  type: TransactionType;
  stampDelta: number;
  amount: number;
  bookTitle: string | null;
  description: string;
  createdAt: string;
}

export interface Delivery {
  id: number;
  zoneName: string;
  delivererName: string | null;
  status: DeliveryStatus;
  deliveryFee: number;
  reservationCount: number;
  bookTitles: string[];
  createdAt: string;
}

export interface LibraryLoan {
  id: number;
  bookCopyId: number;
  bookTitle: string;
  photoUrl: string;
  depositAmount: number;
  active: boolean;
  borrowedAt: string;
  returnedAt: string | null;
}

export interface Order {
  reservationId: number;
  bookCopyId: number;
  bookTitle: string;
  photoUrl: string;
  bookStatus: CopyStatus;
  deliveryId: number | null;
  deliveryStatus: DeliveryStatus | null;
  deliveryFeePaid: number;
  zoneName: string;
  cancellable: boolean;
  createdAt: string;
}

export const LEVEL_LABELS: Record<SchoolLevel, string> = {
  CP: "CP", CE1: "CE1", CE2: "CE2", CM1: "CM1", CM2: "CM2",
  SIXIEME: "6ème", CINQUIEME: "5ème", QUATRIEME: "4ème", TROISIEME: "3ème",
  SECONDE: "Seconde", PREMIERE: "Première", TERMINALE: "Terminale",
  UNIVERSITE: "Université",
};

export const LEVEL_OPTGROUPS: { label: string; levels: SchoolLevel[] }[] = [
  { label: "Primaire", levels: ["CP", "CE1", "CE2", "CM1", "CM2"] },
  { label: "Secondaire", levels: ["SIXIEME", "CINQUIEME", "QUATRIEME", "TROISIEME"] },
  { label: "Lycée", levels: ["SECONDE", "PREMIERE", "TERMINALE"] },
  { label: "Université", levels: ["UNIVERSITE"] },
];

export const SUBJECT_LABELS: Record<Subject, string> = {
  MATHEMATIQUES: "Mathématiques",
  FRANCAIS: "Français",
  HISTOIRE_GEO: "Histoire-Géo",
  ANGLAIS: "Anglais",
  ESPAGNOL: "Espagnol",
  ALLEMAND: "Allemand",
  SVT: "SVT",
  PHYSIQUE_CHIMIE: "Physique-Chimie",
  TECHNOLOGIE: "Technologie",
  ARTS: "Arts",
  MUSIQUE: "Musique",
  EPS: "EPS",
  AUTRE: "Autre",
  MEUBLES: "Meubles",
  LUMINAIRES: "Luminaires",
  TEXTILE: "Textile",
  VAISSELLE: "Vaisselle",
  DECORATION: "Décoration",
};

export const BOOK_SUBJECTS: Subject[] = [
  "MATHEMATIQUES", "FRANCAIS", "HISTOIRE_GEO", "ANGLAIS",
  "ESPAGNOL", "ALLEMAND", "SVT", "PHYSIQUE_CHIMIE",
  "TECHNOLOGIE", "ARTS", "MUSIQUE", "EPS",
];

export const DECOR_SUBJECTS: Subject[] = [
  "MEUBLES", "LUMINAIRES", "TEXTILE", "VAISSELLE", "DECORATION",
];

export const CONDITION_LABELS: Record<BookCondition, string> = {
  NEUF: "Neuf",
  BON: "Bon état",
  MOYEN: "État moyen",
  ABIME: "Abîmé",
};

export const OFFER_TYPE_LABELS: Record<OfferType, string> = {
  EXCHANGE: "Échange",
  DONATION: "Don",
  SALE: "Vente",
};

export function formatCfa(amount: number) {
  return `${amount.toLocaleString("fr-FR")} F`;
}

export const PROVIDER_LABELS: Record<MobileMoneyProvider, string> = {
  ORANGE_MONEY: "Orange Money",
  MTN_MONEY: "MTN Mobile Money",
  MOOV_MONEY: "Moov Money",
};

export const COPY_STATUS_LABELS: Record<CopyStatus, string> = {
  AVAILABLE: "Disponible",
  RESERVED: "Réservé",
  IN_DELIVERY: "En livraison",
  DELIVERED: "Livré",
  LIBRARY_BORROWED: "Emprunté (biblio.)",
};

export const ROLE_LABELS: Record<UserRole, string> = {
  STUDENT: "Élève",
  PARENT: "Parent",
  SELLER: "Vendeur",
  DELIVERER: "Livreur",
  LIBRARIAN: "Bibliothécaire",
  ADMIN: "Admin",
};
