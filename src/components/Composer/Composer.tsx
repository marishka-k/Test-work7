import { useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import s from './Composer.module.css';

interface Props {
  onSend: (text: string) => void;
}

const MAX_LENGTH = 4000; // ограничение SendMessage

export function Composer({ onSend }: Props) {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const canSend = text.trim().length > 0;

  function submit(e?: FormEvent) {
    e?.preventDefault();
    if (!canSend) return;
    onSend(text.trim());
    setText('');
    inputRef.current?.focus();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    // Enter — отправить, Shift+Enter — перенос строки
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <form className={s.composer} onSubmit={submit}>
      <textarea
        ref={inputRef}
        className={s.composer__input}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Сообщение"
        rows={1}
        maxLength={MAX_LENGTH}
        autoFocus
      />
      <button className={s.composer__send} type="submit" disabled={!canSend} aria-label="Отправить">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3.4 20.4l17.45-7.48a1 1 0 0 0 0-1.84L3.4 3.6a.99.99 0 0 0-1.39.91L2 9.12c0 .5.37.93.87.99L17 12 2.87 13.88c-.5.07-.87.5-.87 1l.01 4.61c0 .71.73 1.2 1.39.91z" />
        </svg>
      </button>
    </form>
  );
}
