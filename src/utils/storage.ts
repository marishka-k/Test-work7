import type { Chat, Credentials } from '../types';

const CREDS_KEY = 'max-chat:credentials';
const chatsKey = (idInstance: string) => `max-chat:chats:${idInstance}`;

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* хранилище недоступно — работаем без сохранения */
  }
}

export const loadCredentials = () => read<Credentials>(CREDS_KEY);
export const saveCredentials = (c: Credentials | null) => write(CREDS_KEY, c);

export const loadChats = (idInstance: string) => read<Record<string, Chat>>(chatsKey(idInstance)) ?? {};
export const saveChats = (idInstance: string, chats: Record<string, Chat>) => write(chatsKey(idInstance), chats);
