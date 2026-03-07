import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * * shadcn tailwind 클래스네임 조합 함수
 * @param {ClassValue[]} inputs - 클래스네임 배열
 * @returns {string} 조합된 클래스네임
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}