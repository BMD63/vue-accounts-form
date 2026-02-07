import type { Label } from '../types/account';

export function parseLabels(input: string): Label[] {
  return input
    .split(';')
    .map(s => s.trim())
    .filter(Boolean)
    .map(s => ({ text: s.slice(0, 50) }));
}

export function labelsToString(labels: Label[]): string {
  return labels.map(l => l.text).join('; ');
}
