export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toISOString();
}

export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}
