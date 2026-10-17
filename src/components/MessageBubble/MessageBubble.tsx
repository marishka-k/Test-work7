import type { ChatMessage } from '../../types';
import { cn } from '../../utils/cn';
import { formatTime } from '../../utils/time';
import s from './MessageBubble.module.css';

interface Props {
  message: ChatMessage;
  onRetry: () => void;
}

const STATUS_ICON: Record<string, string> = {
  pending: '🕓',
  sent: '✓',
  error: '!',
};

export function MessageBubble({ message, onRetry }: Props) {
  const isOut = message.direction === 'out';
  const isError = message.status === 'error';

  return (
    <div className={cn(s.message, s[`message--${message.direction}`])}>
      <div className={cn(s.message__bubble, isError && s['message__bubble--error'])}>
        <span className={s.message__text}>{message.text}</span>
        <span className={s.message__meta}>
          {formatTime(message.timestamp)}
          {isOut && message.status && (
            <span className={cn(s.message__status, s[`message__status--${message.status}`])}>
              {STATUS_ICON[message.status]}
            </span>
          )}
        </span>
      </div>
      {isError && (
        <button className={s.message__retry} onClick={onRetry} title={message.error}>
          Не отправлено. Повторить
        </button>
      )}
    </div>
  );
}
