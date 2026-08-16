import type { UserMe } from "../types";

/** Livreur uniquement — pas admin */
export function isDelivererOnly(user: UserMe | null): boolean {
  return user?.role === "DELIVERER";
}

/** Élève, parent, bibliothécaire */
export function isStudentAreaUser(user: UserMe | null): boolean {
  return user != null && user.role !== "DELIVERER";
}

export function homePathFor(user: UserMe | null): string {
  return isDelivererOnly(user) ? "/deliverer" : "/";
}
