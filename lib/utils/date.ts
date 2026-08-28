// lib/date.ts

// Date only
export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

// Date + Time separated format
export function formatEventDateTime(
  startDate: string | Date,
  endDate: string | Date,
) {
  const dateFormatter = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const timeFormatter = new Intl.DateTimeFormat("en-GB", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const start = new Date(startDate);
  const end = new Date(endDate);

  return {
    date: `${dateFormatter.format(start)} – ${dateFormatter.format(end)}`,
    time: `${timeFormatter.format(start)} - ${timeFormatter.format(end)}`,
  };
}

// Date Range
export function formatDateRange(
  startDate: string | Date,
  endDate: string | Date,
) {
  return `${formatDate(startDate)} – ${formatDate(endDate)}`;
}

// Date Time Range
export function formatDateTimeRange(
  startDate: string | Date,
  endDate: string | Date,
) {
  return `${formatEventDateTime(startDate, endDate).date} ${formatEventDateTime(startDate, endDate).time}`;
}
