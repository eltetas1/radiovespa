// src/lib/reviews.ts
import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore/lite";
import { db } from "./firebase";

export type Review = {
  vespaId: string;
  recommend: boolean;
  tags: string[];        // máx 3
  comment?: string;      // opcional
  source?: string;       // opcional ('web', 'app', etc.)
  createdAt: any;        // serverTimestamp()
};

export const TAG_OPTIONS = [
  "cuidadoso",
  "rápido",
  "amable",
  "puntual",
  "fuerte",
  "experimentado",
  "confiable",
] as const;

export async function submitReview(input: {
  vespaId: string;
  recommend: boolean;
  tags: string[];
  comment?: string;
  source?: string;
}) {
  const payload: Omit<Review, "createdAt"> & { createdAt: any } = {
    vespaId: input.vespaId,
    recommend: input.recommend,
    tags: (input.tags || []).slice(0, 3),
    comment: input.comment?.trim() || undefined,
    source: input.source || "web",
    createdAt: serverTimestamp(),
  };
  await addDoc(collection(db, "reviews"), payload);
}

export type ReviewStats = {
  total: number;
  recommends: number; // cuantos recomendaron (true)
  tagsCount: Record<string, number>;
  latestComment?: string;
};

export async function getReviewsByVespa(vespaId: string) {
  const q = query(
    collection(db, "reviews"),
    where("vespaId", "==", vespaId),
    orderBy("createdAt", "desc"),
    limit(30)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Review);
}

export async function getReviewStats(vespaId: string): Promise<ReviewStats> {
  const reviews = await getReviewsByVespa(vespaId);

  const total = reviews.length;
  const recommends = reviews.filter((r) => r.recommend).length;

  const tagsCount: Record<string, number> = {};
  for (const r of reviews) {
    for (const t of r.tags || []) {
      tagsCount[t] = (tagsCount[t] || 0) + 1;
    }
  }

  const latestComment = reviews.find((r) => r.comment && r.comment.trim())
    ?.comment;

  return { total, recommends, tagsCount, latestComment };
}
