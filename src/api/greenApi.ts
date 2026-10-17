import type { Credentials } from '../types';

/** Ошибка HTTP-запроса к GREEN-API */
export class GreenApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'GreenApiError';
    this.status = status;
  }
}

/** Хост API по умолчанию: первые 4 цифры idInstance, например 3100 → https://3100.api.green-api.com */
export function defaultApiUrl(idInstance: string): string {
  const prefix = idInstance.trim().slice(0, 4);
  return /^\d{4}$/.test(prefix) ? `https://${prefix}.api.green-api.com` : 'https://api.green-api.com';
}

function buildUrl(creds: Credentials, method: string, suffix = ''): string {
  const base = creds.apiUrl.trim().replace(/\/+$/, '');
  return `${base}/waInstance${creds.idInstance.trim()}/${method}/${creds.apiTokenInstance.trim()}${suffix}`;
}

async function request<T>(url: string, init: RequestInit = {}): Promise<T | null> {
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: init.body ? { 'Content-Type': 'application/json' } : undefined,
    });
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw e;
    throw new GreenApiError('Нет связи с GREEN-API. Проверьте apiUrl и подключение к сети.');
  }

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    const hint =
      response.status === 401 || response.status === 403
        ? 'неверный idInstance или apiTokenInstance'
        : text || response.statusText;
    throw new GreenApiError(`Ошибка ${response.status}: ${hint}`, response.status);
  }

  // receiveNotification при пустой очереди возвращает пустое тело или null
  const text = await response.text();
  if (!text || text === 'null') return null;
  return JSON.parse(text) as T;
}

export interface StateInstanceResponse {
  stateInstance: string;
}

/** Проверка учётных данных и состояния инстанса */
export function getStateInstance(creds: Credentials, signal?: AbortSignal) {
  return request<StateInstanceResponse>(buildUrl(creds, 'getStateInstance'), { signal });
}

export interface SendMessageResponse {
  idMessage: string;
}

/** https://green-api.com/v3/docs/api/sending/SendMessage/ */
export async function sendMessage(creds: Credentials, chatId: string, message: string) {
  const res = await request<SendMessageResponse>(buildUrl(creds, 'sendMessage'), {
    method: 'POST',
    body: JSON.stringify({ chatId, message }),
  });
  if (!res?.idMessage) throw new GreenApiError('GREEN-API не вернул idMessage');
  return res;
}

export interface CheckAccountResponse {
  exist: boolean;
  chatId?: string;
}

/** Есть ли аккаунт MAX на номере; возвращает chatId пользователя */
export function checkAccount(creds: Credentials, phoneNumber: string) {
  return request<CheckAccountResponse>(buildUrl(creds, 'checkAccount'), {
    method: 'POST',
    body: JSON.stringify({ phoneNumber: Number(phoneNumber) }),
  });
}

// ---------- Получение уведомлений (технология HTTP API) ----------

export interface NotificationBody {
  typeWebhook: string;
  timestamp: number;
  idMessage?: string;
  senderData?: {
    chatId: string;
    chatName?: string;
    sender?: string;
    senderName?: string;
    senderContactName?: string;
    senderPhoneNumber?: number;
  };
  messageData?: {
    typeMessage: string;
    textMessageData?: { textMessage: string };
    extendedTextMessageData?: { text: string };
  };
}

export interface ReceivedNotification {
  receiptId: number;
  body: NotificationBody;
}

/** https://green-api.com/v3/docs/api/receiving/technology-http-api/ReceiveNotification/ */
export function receiveNotification(creds: Credentials, receiveTimeout = 5, signal?: AbortSignal) {
  return request<ReceivedNotification>(
    buildUrl(creds, 'receiveNotification', `?receiveTimeout=${receiveTimeout}`),
    { signal },
  );
}

/** https://green-api.com/v3/docs/api/receiving/technology-http-api/DeleteNotification/ */
export function deleteNotification(creds: Credentials, receiptId: number, signal?: AbortSignal) {
  return request<{ result: boolean }>(buildUrl(creds, 'deleteNotification', `/${receiptId}`), {
    method: 'DELETE',
    signal,
  });
}

/** Текст сообщения из уведомления; null — если сообщение не текстовое */
export function extractText(body: NotificationBody): string | null {
  const data = body.messageData;
  if (!data) return null;
  switch (data.typeMessage) {
    case 'textMessage':
      return data.textMessageData?.textMessage ?? null;
    case 'extendedTextMessage':
    case 'quotedMessage':
      return data.extendedTextMessageData?.text ?? data.textMessageData?.textMessage ?? null;
    default:
      return null;
  }
}
