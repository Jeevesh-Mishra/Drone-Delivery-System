"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.linearSearch = linearSearch;
exports.binarySearch = binarySearch;
/**
 * Linear Search
 * Time Complexity: O(n)
 * Traverses the array linearly to find an item matching the criteria.
 */
function linearSearch(array, matchFn) {
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
function binarySearch(sortedArray, targetValue, keyExtractor) {
    let low = 0;
    let high = sortedArray.length - 1;
    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const midVal = keyExtractor(sortedArray[mid]);
        if (midVal === targetValue) {
            return sortedArray[mid];
        }
        else if (midVal < targetValue) {
            low = mid + 1;
        }
        else {
            high = mid - 1;
        }
    }
    return null;
}
