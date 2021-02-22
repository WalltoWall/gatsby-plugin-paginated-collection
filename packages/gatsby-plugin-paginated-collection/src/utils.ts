/**
 * Formats a message suitable to display to a user.
 *
 * @param msg Message to format.
 *
 * @returns Formatted message.
 */
export const fmtMsg = (msg: string) =>
  `gatsby-plugin-paginated-collection - ${msg}`

/**
 * Creates an array of elements split into groups of the provided size.
 *
 * @param size - Length of each chunk.
 * @param array - The array to split.
 *
 * @returns An array containing chunked arrays. If array cannot be split evenly, the final chunk will be the remaining elements.
 */
export const chunk = <T>(size: number, arr: T[]): T[][] =>
  arr.reduce(
    (array, item, i) =>
      i % size === 0
        ? [...array, [item]]
        : [...array.slice(0, -1), [...array.slice(-1)[0], item]],
    [] as T[][],
  )
