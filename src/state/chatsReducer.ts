import type { Chat, ChatMessage } from '../types';

export type ChatsState = Record<string, Chat>;

export type ChatsAction =
  | { type: 'reset'; chats: ChatsState }
  | { type: 'addChat'; chatId: string; title: string; phone?: string }
  | {
      type: 'addMessage';
      chatId: string;
      message: ChatMessage;
      /** Данные для создания чата, если его ещё нет */
      title?: string;
      phone?: string;
      markUnread?: boolean;
    }
  | { type: 'updateMessage'; chatId: string; id: string; patch: Partial<ChatMessage> }
  | { type: 'readChat'; chatId: string }
  | { type: 'deleteChat'; chatId: string };

/** Ищет чат, созданный по номеру телефона, но ещё не знающий числовой chatId MAX */
function findByPhone(state: ChatsState, phone?: string): Chat | undefined {
  if (!phone) return undefined;
  return Object.values(state).find((c) => c.phone === phone);
}

export function chatsReducer(state: ChatsState, action: ChatsAction): ChatsState {
  switch (action.type) {
    case 'reset':
      return action.chats;

    case 'addChat': {
      if (state[action.chatId]) return state;
      return {
        ...state,
        [action.chatId]: { chatId: action.chatId, title: action.title, phone: action.phone, messages: [], unread: 0 },
      };
    }

    case 'addMessage': {
      let next = state;
      let chat = state[action.chatId];

      if (!chat) {
        const byPhone = findByPhone(state, action.phone);
        if (byPhone) {
          // Ответ пришёл с числовым chatId — переносим переписку на него
          const { [byPhone.chatId]: _old, ...rest } = state;
          void _old;
          chat = { ...byPhone, chatId: action.chatId };
          next = rest;
        } else {
          chat = {
            chatId: action.chatId,
            title: action.title || action.phone || action.chatId,
            phone: action.phone,
            messages: [],
            unread: 0,
          };
        }
      }

      if (chat.messages.some((m) => m.id === action.message.id)) return state;

      const messages = [...chat.messages, action.message].sort((a, b) => a.timestamp - b.timestamp);
      return {
        ...next,
        [action.chatId]: { ...chat, messages, unread: chat.unread + (action.markUnread ? 1 : 0) },
      };
    }

    case 'updateMessage': {
      const chat = state[action.chatId];
      if (!chat) return state;
      return {
        ...state,
        [action.chatId]: {
          ...chat,
          messages: chat.messages.map((m) => (m.id === action.id ? { ...m, ...action.patch } : m)),
        },
      };
    }

    case 'readChat': {
      const chat = state[action.chatId];
      if (!chat || chat.unread === 0) return state;
      return { ...state, [action.chatId]: { ...chat, unread: 0 } };
    }

    case 'deleteChat': {
      const { [action.chatId]: _removed, ...rest } = state;
      void _removed;
      return rest;
    }

    default:
      return state;
  }
}
