export function formatDate(isoDateString: string): string {
  const date = new Date(isoDateString);

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour12: true, // Use 12-hour format
    timeZone: "UTC", // Specify the time zone
  };

  return new Intl.DateTimeFormat("en-US", options).format(date);
}
