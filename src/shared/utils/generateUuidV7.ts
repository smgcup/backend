import { v7 as uuidv7 } from 'uuid';
/**
 * Generates a v7 UUID using the uuid package.
 * @returns The generated UUID.
 */
export const generateUuidv7 = (): string => {
  return uuidv7();
};
