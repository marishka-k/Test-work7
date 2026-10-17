import { useEffect, useRef, useState } from 'react';
import { deleteNotification, receiveNotification, type NotificationBody } from '../api/greenApi';
import type { Credentials } from '../types';

export type PollingStatus = 'connecting' | 'online' | 'error';

const RETRY_DELAY_MS = 3000;

const sleep = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve) => {
    const t = setTimeout(resolve, ms);
    signal.addEventListener('abort', () => {
      clearTimeout(t);
      resolve();
    });
  });

/**
 * Получение входящих уведомлений методами ReceiveNotification / DeleteNotification.
 * Уведомления забираются из очереди по одному, после обработки удаляются.
 */
export function useNotifications(creds: Credentials | null, onNotification: (body: NotificationBody) => void) {
  const [status, setStatus] = useState<PollingStatus>('connecting');
  const [error, setError] = useState<string | null>(null);

  // актуальный обработчик без перезапуска цикла
  const handlerRef = useRef(onNotification);
  handlerRef.current = onNotification;

  useEffect(() => {
    if (!creds) return;
    const controller = new AbortController();
    const { signal } = controller;
    setStatus('connecting');

    (async () => {
      while (!signal.aborted) {
        try {
          const notification = await receiveNotification(creds, 5, signal);
          setStatus('online');
          setError(null);
          if (!notification) continue;

          try {
            handlerRef.current(notification.body);
          } finally {
            // удаляем даже при ошибке обработки, иначе очередь «застрянет»
            await deleteNotification(creds, notification.receiptId, signal);
          }
        } catch (e) {
          if (signal.aborted) break;
          setStatus('error');
          setError((e as Error).message);
          await sleep(RETRY_DELAY_MS, signal);
        }
      }
    })();

    return () => controller.abort();
  }, [creds]);

  return { status, error };
}
