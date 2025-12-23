/**
 * Calculates the average of an array of numbers.
 * @example
 * ```typescript
 * const numbers = [1, 2, 3, 4, 5];
 * const average = service.calculateNumericAverage(numbers);
 * // Returns 3
 * ```
 * Returns the average as a number, or null if no valid numbers are provided.
 *
 * @param numbers - Array of numbers to average
 * @returns Average number, or null if no valid numbers
 */

export const calculateNumericAverage = (numbers: (number | null)[]): number | null => {
  const validNumbers = numbers.filter((num): num is number => num !== null && num !== undefined && !isNaN(num));
  if (validNumbers.length === 0) return null;
  const sum = validNumbers.reduce((sum, val) => sum + val, 0);
  const average = sum / validNumbers.length;
  return isNaN(average) ? null : average;
};
