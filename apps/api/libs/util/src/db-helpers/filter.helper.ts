type Query = Record<string, unknown>;
/**
 * Filters and transforms query parameters into a database-friendly filter object.
 *
 * This helper function processes query parameters by:
 * - Removing null, undefined, or empty string values
 * - Parsing comparison operators in bracket notation (e.g., `createdAt[gte]`, `price[lte]`)
 * - Automatically converting valid date strings to Date objects
 *
 * @param query - A record of query parameters to filter and transform
 * @returns A filtered object with processed values, ready for database queries
 *
 * @example
 * ```typescript
 * // Basic filtering
 * filter_helper({ name: 'John', age: null, status: '' })
 * // Returns: { name: 'John' }
 *
 * // Comparison operators
 * filter_helper({ 'createdAt[gte]': '2024-01-01', 'price[lte]': 100 })
 * // Returns: { createdAt: { gte: Date('2024-01-01') }, price: { lte: 100 } }
 * ```
 */
export function filter_helper(query: Query): Query {
  const filters: Query = {};

  for (const key in query) {
    const value = query[key];

    if (value === null || value === undefined || value === '') {
      continue;
    }

    const match = key.match(/^(\w+)\[(gte|lte|gt|lt)\]$/);
    if (match) {
      const [_omit, field, operator] = match;

      if (!filters[field]) filters[field] = {};
      const parsedValue = isNaN(Date.parse(value as string)) ? value : new Date(value as string);
      (filters[field] as Query)[operator] = parsedValue;
      continue;
    }

    filters[key] = value;
  }

  return filters;
}
