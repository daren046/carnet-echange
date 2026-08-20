import type { UserMe } from "../types";

/** Livreur uniquement — pas admin */
export function isDelivererOnly(user: UserMe | null): boolean {
  return user?.role === "DELIVERER";
}

/** Vendeur uniquement — pas admin */
export function isSellerOnly(user: UserMe | null): boolean {
  return user?.role === "SELLER";
}

export function canAccessSellerSpace(user: UserMe | null): boolean {
  return user != null && user.role !== "DELIVERER";
}

/** Élève, parent, bibliothécaire */
export function isStudentAreaUser(user: UserMe | null): boolean {
  return user != null && user.role !== "DELIVERER" && user.role !== "SELLER";
}

export function isAdmin(user: UserMe | null): boolean {
  return user?.role === "ADMIN";
}

export function homePathFor(user: UserMe | null): string {
  if (isDelivererOnly(user)) return "/deliverer";
  if (isSellerOnly(user)) return "/seller";
  return "/";
}
