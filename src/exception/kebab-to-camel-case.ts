export const kebabToCamelCase = (str: string): string => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()); // eslint-disable-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
};
