const WEEKEND = new Set([0, 6]);

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export function addUtcDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

export function nextBusinessDay(from: Date): Date {
  let d = startOfDay(from);
  d = addUtcDays(d, 1);
  while (WEEKEND.has(d.getUTCDay())) {
    d = addUtcDays(d, 1);
  }
  return d;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function toInputDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().slice(0, 10);
}

export function fromInputDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

export function isPast(date: Date, now = new Date()): boolean {
  return startOfDay(date).getTime() < startOfDay(now).getTime();
}
