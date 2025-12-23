/**
 * Calculates the average time from an array of Date objects.
 * Returns the average time as a Date object with the same date as the first valid date.
 *
 * @param dates - Array of Date objects to average
 * @returns Average time as Date object, or null if no valid dates
 */
export const calculateAverageTime = (dates: Date[]): Date | null => {
  if (dates.length === 0) return null;

  // Calculate total milliseconds since midnight for each date
  const timesInMs = dates.map((date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const milliseconds = date.getMilliseconds();
    return hours * 3600000 + minutes * 60000 + seconds * 1000 + milliseconds;
  });

  // Calculate average milliseconds
  const averageMs = timesInMs.reduce((sum, time) => sum + time, 0) / timesInMs.length;

  // Convert back to hours, minutes, seconds, milliseconds
  const avgHours = Math.floor(averageMs / 3600000);
  const avgMinutes = Math.floor((averageMs % 3600000) / 60000);
  const avgSeconds = Math.floor((averageMs % 60000) / 1000);
  const avgMilliseconds = Math.floor(averageMs % 1000);

  // Create new date with average time, using the date from the first valid date
  const baseDate = new Date(dates[0]);
  baseDate.setHours(avgHours, avgMinutes, avgSeconds, avgMilliseconds);

  return baseDate;
};
