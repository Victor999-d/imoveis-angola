import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number | string,
  options?: { currency?: string; locale?: string }
): string {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (Number.isNaN(value)) return '0 Kz';
  const formatted = new Intl.NumberFormat('pt-AO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
  return `${formatted} Kz`;
}

export function formatDate(
  date: Date | string | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-AO', {
    timeZone: 'Africa/Luanda',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...options,
  }).format(d);
}

export function formatDateTime(date: Date | string | null | undefined): string {
  return formatDate(date, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function absoluteUrl(path: string = ''): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length).trim() + '…';
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export const propertyTypeLabels: Record<string, string> = {
  APARTMENT: 'Apartamento',
  HOUSE: 'Casa',
  VILLA: 'Vivenda',
  STUDIO: 'Estúdio',
  ROOM: 'Quarto',
  COMMERCIAL: 'Comercial',
  LAND: 'Terreno',
};

export const propertyStatusLabels: Record<string, string> = {
  DRAFT: 'Rascunho',
  PENDING_VERIFICATION: 'Pendente',
  PUBLISHED: 'Publicado',
  RENTED: 'Arrendado',
  REJECTED: 'Rejeitado',
  ARCHIVED: 'Arquivado',
};

export const visitStatusLabels: Record<string, string> = {
  PENDING: 'Pendente',
  CONFIRMED: 'Confirmada',
  REJECTED: 'Rejeitada',
  COMPLETED: 'Realizada',
  CANCELLED: 'Cancelada',
};
