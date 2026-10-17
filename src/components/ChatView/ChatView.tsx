import { Fragment, useEffect, useRef } from 'react';
import type { Chat } from '../../types';
import { formatPhone } from '../../utils/phone';
import { formatDayLabel } from '../../utils/time';
import { Avatar } from '../Avatar/Avatar';
import { Composer } from '../Composer/Composer';
import { MessageBubble } from '../MessageBubble/MessageBubble';
import s from './ChatView.module.css';

interface Props {
  chat: Chat;
  onSend: (text: string) => void;
  onRetry: (messageId: string) => void;
  onBack: () => void;
}

export function ChatView({ chat, onSend, onRetry, onBack }: Props) {
  const listRef = useRef<HTMLDivElement>(null);

  // прокрутка к последнему сообщению
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [chat.chatId, chat.messages.length]);

  return (
    <section className={s['chat-view']}>
      <header className={s['chat-view__header']}>
        <button className={s['chat-view__back']} onClick={onBack} aria-label="К списку чатов">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <Avatar title={chat.title} seed={chat.chatId} size="l" />
        <div className={s['chat-view__heading']}>
          <div className={s['chat-view__title']}>{chat.title}</div>
          <div className={s['chat-view__subtitle']}>{chat.phone ? formatPhone(chat.phone) : `ID ${chat.chatId}`}</div>
        </div>
      </header>

      <div className={s['chat-view__messages']} ref={listRef}>
        {chat.messages.length === 0 && (
          <div className={s['chat-view__placeholder']}>Напишите первое сообщение</div>
        )}
        {chat.messages.map((m, i) => {
          const prev = chat.messages[i - 1];
          const showDay = !prev || formatDayLabel(prev.timestamp) !== formatDayLabel(m.timestamp);
          return (
            <Fragment key={m.id}>
              {showDay && <div className={s['chat-view__day']}>{formatDayLabel(m.timestamp)}</div>}
              <MessageBubble message={m} onRetry={() => onRetry(m.id)} />
            </Fragment>
          );
        })}
      </div>

      <Composer key={chat.chatId} onSend={onSend} />
    </section>
  );
}
