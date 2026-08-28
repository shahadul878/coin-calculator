export function toStartOfDay(date: string): string {
  return `${date}T00:00:00.000Z`;
}

export function toEndOfDay(date: string): string {
  return `${date}T23:59:59.999Z`;
}

export function formatDateRangeLabel(dateFrom?: string, dateTo?: string): string | null {
  if (!dateFrom && !dateTo) return null;

  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  if (dateFrom && dateTo) {
    return `${formatter.format(new Date(dateFrom))} – ${formatter.format(new Date(dateTo))}`;
  }

  if (dateFrom) {
    return `From ${formatter.format(new Date(dateFrom))}`;
  }

  return `Until ${formatter.format(new Date(dateTo!))}`;
}
