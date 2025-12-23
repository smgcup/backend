export default function formatDateToDateOnly(date: Date): string {
  return date.toISOString().split('T')[0];
}
