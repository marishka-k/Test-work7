import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';
import s from './Button.module.css';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost';
  block?: boolean;
}

export function Button({ variant = 'primary', block, className, type = 'button', ...rest }: Props) {
  return (
    <button
      type={type}
      className={cn(s.button, s[`button--${variant}`], block && s['button--block'], className)}
      {...rest}
    />
  );
}
