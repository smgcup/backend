const extractTimezoneOffsetFromTimestamp = (timestamp: string) => {
  // Extract timezone offset in format +HH:MM or -HH:MM from the timestamp string
  const timezoneMatch = timestamp.match(/[+-]\d{2}:\d{2}$/);
  if (timezoneMatch) {
    return timezoneMatch[0];
  }

  // Fallback: calculate from Date object if timezone not in string
  const date = new Date(timestamp);
  const offsetMinutes = date.getTimezoneOffset();
  const sign = offsetMinutes <= 0 ? '+' : '-';
  const absOffsetMinutes = Math.abs(offsetMinutes);
  const hours = Math.floor(absOffsetMinutes / 60);
  const minutes = absOffsetMinutes % 60;
  return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

export default extractTimezoneOffsetFromTimestamp;
