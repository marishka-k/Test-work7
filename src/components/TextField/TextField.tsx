import type { InputHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';
import s from './TextField.module.css';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  invalid?: boolean;
}

export function TextField({ label, hint, invalid, className, ...rest }: Props) {
  return (
    <label className={cn(s['text-field'], className)}>
      <span className={s['text-field__label']}>{label}</span>
      <input className={cn(s['text-field__input'], invalid && s['text-field__input--invalid'])} {...rest} />
      {hint && <span className={s['text-field__hint']}>{hint}</span>}
    </label>
  );
}
