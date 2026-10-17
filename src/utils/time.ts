export const nowSec = () => Math.floor(Date.now() / 1000);

export function formatTime(ts: number): string {
  return new Date(ts * 1000).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

/** Время для списка чатов: сегодня — часы:минуты, иначе дата */
export function formatChatDate(ts: number): string {
  const d = new Date(ts * 1000);
  if (d.toDateString() === new Date().toDateString()) return formatTime(ts);
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
}

export function formatDayLabel(ts: number): string {
  const d = new Date(ts * 1000);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Сегодня';
  if (d.toDateString() === yesterday.toDateString()) return 'Вчера';
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
}
