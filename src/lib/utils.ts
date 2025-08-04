import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatProcessName(processPath: string): string {
  const parts = processPath.split('\\');
  const filename = parts[parts.length - 1];
  return filename.replace('.exe', '');
}