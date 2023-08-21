function ensureArrayIndexInBounds<T>(arr: T[], index: number) {
  const isInBounds = index >= 0 && index < arr.length
  if (!isInBounds) {
    throw new Error(
      `Index ${index} is out of bounds for array of length ${arr.length}`
    );
  }
}

/**
 * Immutable update of an array element at a given array index.
 *
 * @param arr - the array to update
 * @param index - the index of the element to update
 * @param value - the new value of the element
 * @returns
 */
export function updateArrayElementAt<T>(arr: T[], index: number, value: T) {
  ensureArrayIndexInBounds(arr, index);
  return [...arr.slice(0, index), value, ...arr.slice(index + 1)];
}

/**
 * Immutable removal of an array element at a given array index.
 * @param arr - the array to update
 * @param index - the index of the element to remove
 * @returns
 * @throws if the index is out of bounds
 */
export function removeArrayElementAt<T>(arr: T[], index: number) {
  ensureArrayIndexInBounds(arr, index);
  return [...arr.slice(0, index), ...arr.slice(index + 1)];
}

/**
 * Adds a period to the end of a string if it doesn't already have one.
 * @param str - the string that should end with a period
 * @returns - the string with a period at the end if it didn't already have one
 */
export function addPeriodIfMissing(str: string) {
  return str.endsWith(".") ? str : str + ".";
}
