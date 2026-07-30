import type { BookMeta } from '../../data/books';
import { defaultShelfBookSeeds } from '../../data/books';
import { pdfToImages } from '../../utils/pdf';

const DB_NAME = 'children-picturebook';
const DB_VERSION = 1;
const STORE_NAME = 'books';

let dbInstance: IDBDatabase | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'bookId' });
      }
    };
    req.onsuccess = () => {
      dbInstance = req.result;
      resolve(dbInstance);
    };
    req.onerror = () => reject(req.error);
  });
}

async function loadAllBooks(): Promise<BookMeta[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () => {
      resolve(req.result as BookMeta[]);
    };
    req.onerror = () => reject(req.error);
  });
}

function normalizeDefaultBook(seed: (typeof defaultShelfBookSeeds)[number], book: BookMeta): BookMeta {
  const title = book.title || seed.title;
  const pages = book.pages.map((page, index) => ({
    ...page,
    id: index + 1,
  }));

  return {
    ...book,
    bookId: seed.bookId,
    title,
    cover: book.cover || pages[0]?.image || '',
    description: `${title} · ${pages.length}页`,
    emoji: book.emoji || seed.emoji,
    pages,
    isUploaded: false,
  };
}

async function createDefaultBook(seed: (typeof defaultShelfBookSeeds)[number]): Promise<BookMeta> {
  const response = await fetch(seed.pdfUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch default book PDF: ${seed.pdfUrl}`);
  }

  const pages = await pdfToImages(new Uint8Array(await response.arrayBuffer()));
  if (pages.length === 0) {
    throw new Error(`Default book PDF has no pages: ${seed.pdfUrl}`);
  }

  return {
    bookId: seed.bookId,
    title: seed.title,
    cover: pages[0],
    description: `${seed.title} · ${pages.length}页`,
    emoji: seed.emoji,
    pages: pages.map((image, index) => ({
      id: index + 1,
      image,
      originalText: '',
      expandedText: '',
      characters: [],
    })),
    isUploaded: false,
    createdAt: Date.now(),
  };
}

async function ensureDefaultBooks(): Promise<void> {
  const books = await loadAllBooks();

  for (const seed of defaultShelfBookSeeds) {
    const matches = books.filter((book) => book.bookId === seed.bookId || book.title === seed.title);
    const canonical = matches.find((book) => book.bookId === seed.bookId);

    if (canonical) {
      await saveBook(normalizeDefaultBook(seed, canonical));
      for (const match of matches) {
        if (match.bookId !== seed.bookId) {
          await deleteBook(match.bookId);
        }
      }
      continue;
    }

    if (matches.length > 0) {
      const migrated = normalizeDefaultBook(seed, matches[0]);
      await saveBook(migrated);
      for (const match of matches) {
        await deleteBook(match.bookId);
      }
      continue;
    }

    await saveBook(await createDefaultBook(seed));
  }
}

function sortBooks(books: BookMeta[]): BookMeta[] {
  const defaultBookOrder = new Map(defaultShelfBookSeeds.map((book, index) => [book.bookId, index]));

  return [...books].sort((a, b) => {
    const aOrder = defaultBookOrder.get(a.bookId);
    const bOrder = defaultBookOrder.get(b.bookId);

    if (aOrder !== undefined || bOrder !== undefined) {
      if (aOrder === undefined) return 1;
      if (bOrder === undefined) return -1;
      return aOrder - bOrder;
    }

    return b.createdAt - a.createdAt;
  });
}

export async function loadUploadedBooks(): Promise<BookMeta[]> {
  await ensureDefaultBooks();
  return sortBooks(await loadAllBooks());
}

export async function saveBook(book: BookMeta): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(book);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function deleteBook(bookId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(bookId);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function updateBookMeta(bookId: string, partial: Partial<BookMeta>): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const getReq = store.get(bookId);
    getReq.onsuccess = () => {
      const existing = getReq.result;
      if (!existing) {
        resolve();
        return;
      }
      const updated = { ...existing, ...partial };
      const putReq = store.put(updated);
      putReq.onsuccess = () => resolve();
      putReq.onerror = () => reject(putReq.error);
    };
    getReq.onerror = () => reject(getReq.error);
  });
}
