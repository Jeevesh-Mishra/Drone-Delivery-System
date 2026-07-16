/**
 * Linear Search
 * Time Complexity: O(n)
 * Traverses the array linearly to find an item matching the criteria.
 */
export function linearSearch<T>(array: T[], matchFn: (item: T) => boolean): T | null {
  for (let i = 0; i < array.length; i++) {
    if (matchFn(array[i])) {
      return array[i];
    }
  }
  return null;
}

/**
 * Binary Search
 * Time Complexity: O(log n)
 * Requires the input array to be sorted by the key extracted.
 */
export function binarySearch<T>(
  sortedArray: T[],
  targetValue: string | number,
  keyExtractor: (item: T) => string | number
): T | null {
  let low = 0;
  let high = sortedArray.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const midVal = keyExtractor(sortedArray[mid]);

    if (midVal === targetValue) {
      return sortedArray[mid];
    } else if (midVal < targetValue) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return null;
}
