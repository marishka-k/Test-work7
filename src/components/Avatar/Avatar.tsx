import { cn } from '../../utils/cn';
import s from './Avatar.module.css';

const PALETTE = ['#3f8cff', '#8a3ffc', '#ff7a45', '#2fb36b', '#e5484d', '#14b8c4', '#d9480f', '#5f3dc4'];

function colorFor(key: string): string {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) | 0;
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

function initials(title: string): string {
  const letters = title.replace(/[^\p{L}\p{N}\s]/gu, '').trim().split(/\s+/).map((w) => w[0]);
  return (letters.slice(0, 2).join('') || '#').toUpperCase();
}

interface Props {
  title: string;
  seed: string;
  size?: 'm' | 'l';
}

export function Avatar({ title, seed, size = 'm' }: Props) {
  return (
    <div className={cn(s.avatar, s[`avatar--${size}`])} style={{ background: colorFor(seed) }} aria-hidden="true">
      {initials(title)}
    </div>
  );
}
