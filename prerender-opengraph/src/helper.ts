/**
 * Helper function to check if an array contains an exact match for an element or not.
 */
export const isOneOfThem = (array: string[], element: string): boolean => {
  return array.some((e) => e === element);
};

/**
 * Helper function to check if an array contains an element or not.
 */
export const containsOneOfThem = (
  array: string[],
  element: string
): boolean => {
  return array.some((e) => element.indexOf(e) !== -1);
};
