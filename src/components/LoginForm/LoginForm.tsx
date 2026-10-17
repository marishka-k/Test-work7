import { useState, type FormEvent } from 'react';
import { defaultApiUrl, getStateInstance } from '../../api/greenApi';
import type { Credentials } from '../../types';
import { Button } from '../Button/Button';
import { Logo } from '../Logo/Logo';
import { TextField } from '../TextField/TextField';
import s from './LoginForm.module.css';

interface Props {
  onLogin: (creds: Credentials) => void;
}

const STATE_LABELS: Record<string, string> = {
  notAuthorized: 'инстанс не авторизован — привяжите аккаунт MAX в личном кабинете GREEN-API',
  blocked: 'аккаунт заблокирован',
  starting: 'инстанс запускается, попробуйте через минуту',
  yellowCard: 'отправка сообщений временно ограничена',
};

export function LoginForm({ onLogin }: Props) {
  const [idInstance, setIdInstance] = useState('');
  const [apiTokenInstance, setApiToken] = useState('');
  const [apiUrl, setApiUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // пока пользователь не правил apiUrl, подставляем его по idInstance
  const effectiveApiUrl = apiUrl ?? defaultApiUrl(idInstance);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const creds: Credentials = {
      idInstance: idInstance.trim(),
      apiTokenInstance: apiTokenInstance.trim(),
      apiUrl: effectiveApiUrl.trim(),
    };
    if (!creds.idInstance || !creds.apiTokenInstance || !creds.apiUrl) {
      setError('Заполните все поля');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const state = (await getStateInstance(creds))?.stateInstance;
      if (state !== 'authorized') {
        setError(`Не удалось войти: ${STATE_LABELS[state ?? ''] ?? `состояние инстанса «${state ?? 'неизвестно'}»`}`);
        return;
      }
      onLogin(creds);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={s.login}>
      <form className={s.login__card} onSubmit={handleSubmit}>
        <Logo size={56} />
        <h1 className={s.login__title}>Вход в MAX</h1>
        <p className={s.login__subtitle}>Введите учётные данные инстанса GREEN-API</p>

        <div className={s.login__fields}>
          <TextField
            label="idInstance"
            value={idInstance}
            onChange={(e) => setIdInstance(e.target.value)}
            placeholder="3100123456"
            inputMode="numeric"
            autoFocus
          />
          <TextField
            label="apiTokenInstance"
            value={apiTokenInstance}
            onChange={(e) => setApiToken(e.target.value)}
            type="password"
            autoComplete="off"
          />
          <TextField
            label="apiUrl"
            value={effectiveApiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            placeholder="https://api.green-api.com"
            hint="Указан в личном кабинете GREEN-API, подставляется по idInstance"
          />
        </div>

        {error && <div className={s.login__error}>{error}</div>}

        <Button type="submit" block disabled={loading}>
          {loading ? 'Проверяем…' : 'Войти'}
        </Button>
      </form>
    </div>
  );
}
