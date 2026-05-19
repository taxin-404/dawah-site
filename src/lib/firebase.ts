// src/lib/firebase.ts
//
// ⚠️  Cloudflare Workers runtime notes:
//   - firebase/auth uses browser APIs (localStorage, document) → CRASHES Workers → removed here
//   - firebase/firestore needs experimentalForceLongPolling in Workers (no WebSocket support)
//   - Auth is only used client-side (admin panel uses Firebase JS CDN directly)

import { initializeApp, getApps } from "firebase/app";
import {
  initializeFirestore,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey:            import.meta.env.PUBLIC_FIREBASE_API_KEY,
  authDomain:        import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.PUBLIC_FIREBASE_APP_ID,
};

// Prevent re-initialisation across hot-reloads / SSR requests
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// experimentalForceLongPolling is REQUIRED in Cloudflare Workers
// Workers have no WebSocket support — Firestore's default gRPC-Web transport fails without this
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

// ─── Types ────────────────────────────────────────────────────────────────

export interface Article {
  id:          string;
  slug:        string;
  title:       { en: string; bn: string; ar: string };
  excerpt:     { en: string; bn: string; ar: string };
  content:     { en: string; bn: string; ar: string };
  imageUrl:    string;
  author:      string;
  tags:        string[];
  publishedAt: any;
  featured:    boolean;
  published:   boolean;
}

// ─── Firestore helpers ────────────────────────────────────────────────────

/** Fetch published articles, newest first */
export async function getArticles(count = 12): Promise<Article[]> {
  try {
    const q = query(
      collection(db, "articles"),
      where("published", "==", true),
      orderBy("publishedAt", "desc"),
      limit(count)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Article));
  } catch (e) {
    console.error("[firebase] getArticles failed:", e);
    return [];
  }
}

/** Fetch a single article by slug */
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const q = query(
      collection(db, "articles"),
      where("slug", "==", slug),
      limit(1)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...d.data() } as Article;
  } catch (e) {
    console.error("[firebase] getArticleBySlug failed:", e);
    return null;
  }
}

/** Fetch featured articles */
export async function getFeaturedArticles(count = 3): Promise<Article[]> {
  try {
    const q = query(
      collection(db, "articles"),
      where("published", "==", true),
      where("featured", "==", true),
      orderBy("publishedAt", "desc"),
      limit(count)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Article));
  } catch (e) {
    console.error("[firebase] getFeaturedArticles failed:", e);
    return [];
  }
}

/** Save a new article — called from admin panel browser-side only */
export async function saveArticle(data: Omit<Article, "id">) {
  return addDoc(collection(db, "articles"), {
    ...data,
    publishedAt: serverTimestamp(),
    published:   true,
  });
}
