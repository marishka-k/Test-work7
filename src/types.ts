export interface Credentials {
  idInstance: string;
  apiTokenInstance: string;
  apiUrl: string;
}

export type MessageDirection = 'in' | 'out';
export type MessageStatus = 'pending' | 'sent' | 'error';

export interface ChatMessage {
  /** idMessage из GREEN-API либо временный локальный id */
  id: string;
  text: string;
  /** unix-время в секундах */
  timestamp: number;
  direction: MessageDirection;
  status?: MessageStatus;
  error?: string;
}

export interface Chat {
  /** chatId в формате GREEN-API: числовой id пользователя MAX или 79991234567@c.us */
  chatId: string;
  title: string;
  phone?: string;
  messages: ChatMessage[];
  unread: number;
}
