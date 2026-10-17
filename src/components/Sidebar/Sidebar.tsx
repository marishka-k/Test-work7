import { useMemo, useState } from 'react';
import type { PollingStatus } from '../../hooks/useNotifications';
import type { Chat } from '../../types';
import { cn } from '../../utils/cn';
import { formatChatDate } from '../../utils/time';
import { Avatar } from '../Avatar/Avatar';
import { NewChatForm } from '../NewChatForm/NewChatForm';
import s from './Sidebar.module.css';

interface Props {
  chats: Chat[];
  activeChatId: string | null;
  status: PollingStatus;
  statusError: string | null;
  idInstance: string;
  onSelect: (chatId: string) => void;
  onCreateChat: (phone: string) => Promise<void>;
  onLogout: () => void;
}

const STATUS_TEXT: Record<PollingStatus, string> = {
  connecting: 'Подключение…',
  online: 'В сети',
  error: 'Нет связи',
};

function lastActivity(chat: Chat): number {
  return chat.messages[chat.messages.length - 1]?.timestamp ?? 0;
}

export function Sidebar({ chats, activeChatId, status, statusError, idInstance, onSelect, onCreateChat, onLogout }: Props) {
  const [creating, setCreating] = useState(false);

  const sorted = useMemo(() => [...chats].sort((a, b) => lastActivity(b) - lastActivity(a)), [chats]);

  return (
    <aside className={s.sidebar}>
      <header className={s.sidebar__header}>
        <div>
          <h2 className={s.sidebar__title}>Чаты</h2>
          <div className={s.sidebar__status} title={statusError ?? undefined}>
            <span className={cn(s.sidebar__dot, s[`sidebar__dot--${status}`])} />
            {STATUS_TEXT[status]} · {idInstance}
          </div>
        </div>
        <div className={s.sidebar__actions}>
          <button
            className={s['sidebar__icon-button']}
            onClick={() => setCreating((v) => !v)}
            title="Новый чат"
            aria-label="Новый чат"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
          <button className={s['sidebar__icon-button']} onClick={onLogout} title="Выйти" aria-label="Выйти">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
          </button>
        </div>
      </header>

      {creating && (
        <NewChatForm
          onCreate={async (phone) => {
            await onCreateChat(phone);
            setCreating(false);
          }}
          onCancel={() => setCreating(false)}
        />
      )}

      <ul className={s.sidebar__list}>
        {sorted.length === 0 && !creating && (
          <li className={s.sidebar__empty}>
            Чатов пока нет.
            <br />
            Нажмите «+», чтобы начать новый.
          </li>
        )}
        {sorted.map((chat) => {
          const last = chat.messages[chat.messages.length - 1];
          return (
            <li key={chat.chatId}>
              <button
                className={cn(s.sidebar__item, chat.chatId === activeChatId && s['sidebar__item--active'])}
                onClick={() => onSelect(chat.chatId)}
              >
                <Avatar title={chat.title} seed={chat.chatId} />
                <div className={s.sidebar__info}>
                  <div className={s.sidebar__row}>
                    <span className={s.sidebar__name}>{chat.title}</span>
                    {last && <span className={s.sidebar__time}>{formatChatDate(last.timestamp)}</span>}
                  </div>
                  <div className={s.sidebar__row}>
                    <span className={s.sidebar__preview}>
                      {last ? `${last.direction === 'out' ? 'Вы: ' : ''}${last.text}` : 'Нет сообщений'}
                    </span>
                    {chat.unread > 0 && <span className={s.sidebar__badge}>{chat.unread}</span>}
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
