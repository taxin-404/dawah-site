// src/lib/firebase.ts
import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  orderBy,
  limit,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID,
};

// Prevent re-init in SSR/dev
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// ─── Types ─────────────────────────────────────────────────────────────────

export interface Article {
  id: string;
  slug: string;
  title: { en: string; bn: string; ar: string };
  excerpt: { en: string; bn: string; ar: string };
  content: { en: string; bn: string; ar: string };
  imageUrl: string;
  author: string;
  tags: string[];
  publishedAt: Date;
  featured: boolean;
}

// ─── Firestore helpers ────────────────────────────────────────────────────

/** Fetch all published articles, newest first */
export async function getArticles(count = 12): Promise<Article[]> {
  const q = query(
    collection(db, "articles"),
    where("published", "==", true),
    orderBy("publishedAt", "desc"),
    limit(count)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Article));
}

/** Fetch a single article by slug */
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const q = query(collection(db, "articles"), where("slug", "==", slug), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as Article;
}

/** Fetch featured articles for hero */
export async function getFeaturedArticles(count = 3): Promise<Article[]> {
  const q = query(
    collection(db, "articles"),
    where("published", "==", true),
    where("featured", "==", true),
    orderBy("publishedAt", "desc"),
    limit(count)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Article));
}

/** Save a new article (admin) */
export async function saveArticle(data: Omit<Article, "id">) {
  return addDoc(collection(db, "articles"), {
    ...data,
    publishedAt: serverTimestamp(),
    published: true,
  });
}
