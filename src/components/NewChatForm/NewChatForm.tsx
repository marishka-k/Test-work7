import { useState, type FormEvent } from 'react';
import { isValidPhone, normalizePhone } from '../../utils/phone';
import { Button } from '../Button/Button';
import { TextField } from '../TextField/TextField';
import s from './NewChatForm.module.css';

interface Props {
  onCreate: (phone: string) => Promise<void>;
  onCancel: () => void;
}

export function NewChatForm({ onCreate, onCancel }: Props) {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const phone = normalizePhone(value);
    if (!isValidPhone(phone)) {
      setError('Введите номер в международном формате, например +7 999 123-45-67');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onCreate(phone);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className={s['new-chat']} onSubmit={handleSubmit}>
      <TextField
        label="Номер телефона получателя"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="+7 999 123-45-67"
        inputMode="tel"
        invalid={Boolean(error)}
        autoFocus
      />
      {error && <div className={s['new-chat__error']}>{error}</div>}
      <div className={s['new-chat__actions']}>
        <Button variant="ghost" onClick={onCancel} disabled={loading}>
          Отмена
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Поиск…' : 'Создать чат'}
        </Button>
      </div>
    </form>
  );
}
