/**
 * Quick Sort
 * Time Complexity: O(n log n) average, O(n^2) worst case
 * Recursively partitions and sorts a copy of the input array.
 * Accepts a custom key extractor function and supports ascending/descending order.
 */
export function quickSort<T>(
  array: T[],
  keyExtractor: (item: T) => number | string,
  ascending = true
): T[] {
  if (array.length <= 1) return array;

  const arrCopy = [...array];

  const sortHelper = (left: number, right: number) => {
    if (left >= right) return;

    const pivotIndex = Math.floor((left + right) / 2);
    const pivotVal = keyExtractor(arrCopy[pivotIndex]);

    let i = left;
    let j = right;

    while (i <= j) {
      if (ascending) {
        while (keyExtractor(arrCopy[i]) < pivotVal) i++;
        while (keyExtractor(arrCopy[j]) > pivotVal) j--;
      } else {
        while (keyExtractor(arrCopy[i]) > pivotVal) i++;
        while (keyExtractor(arrCopy[j]) < pivotVal) j--;
      }

      if (i <= j) {
        const temp = arrCopy[i];
        arrCopy[i] = arrCopy[j];
        arrCopy[j] = temp;
        i++;
        j--;
      }
    }

    sortHelper(left, j);
    sortHelper(i, right);
  };

  sortHelper(0, arrCopy.length - 1);
  return arrCopy;
}
