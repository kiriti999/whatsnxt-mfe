/**
 * String Similarity Utility
 *
 * Provides functions to calculate similarity between two strings
 * using the Levenshtein distance algorithm.
 */

/**
 * Calculate Levenshtein distance between two strings
 * @param str1 - First string
 * @param str2 - Second string
 * @returns The number of edits needed to transform str1 into str2
 */
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;

  // Create a 2D array for dynamic programming
  const dp: number[][] = Array(len1 + 1)
    .fill(null)
    .map(() => Array(len2 + 1).fill(0));

  // Initialize base cases
  for (let i = 0; i <= len1; i++) {
    dp[i][0] = i;
  }
  for (let j = 0; j <= len2; j++) {
    dp[0][j] = j;
  }

  // Fill the dp table
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1, // deletion
          dp[i][j - 1] + 1, // insertion
          dp[i - 1][j - 1] + 1, // substitution
        );
      }
    }
  }

  return dp[len1][len2];
}

/**
 * Calculate similarity percentage between two strings
 * @param str1 - First string
 * @param str2 - Second string
 * @returns Similarity percentage (0-100)
 */
export function calculateSimilarity(str1: string, str2: string): number {
  // Normalize strings: trim, lowercase, remove extra spaces
  const normalized1 = str1.trim().toLowerCase().replace(/\s+/g, " ");
  const normalized2 = str2.trim().toLowerCase().replace(/\s+/g, " ");

  // Handle edge cases
  if (normalized1 === normalized2) return 100;
  if (normalized1.length === 0 || normalized2.length === 0) return 0;

  // Calculate Levenshtein distance
  const distance = levenshteinDistance(normalized1, normalized2);

  // Calculate similarity as percentage
  const maxLength = Math.max(normalized1.length, normalized2.length);
  const similarity = ((maxLength - distance) / maxLength) * 100;

  return Math.round(similarity * 100) / 100; // Round to 2 decimal places
}

/**
 * Check if two strings are similar based on a threshold
 * @param str1 - First string
 * @param str2 - Second string
 * @param threshold - Similarity threshold (0-100), default 85
 * @returns True if similarity is >= threshold
 */
export function isSimilar(
  str1: string,
  str2: string,
  threshold: number = 85,
): boolean {
  const similarity = calculateSimilarity(str1, str2);
  return similarity >= threshold;
}

/**
 * Find similar strings from an array
 * @param target - Target string to compare
 * @param strings - Array of strings to compare against
 * @param threshold - Similarity threshold (0-100), default 85
 * @returns Array of objects with string and similarity percentage
 */
export function findSimilarStrings(
  target: string,
  strings: string[],
  threshold: number = 85,
): Array<{ text: string; similarity: number }> {
  const results: Array<{ text: string; similarity: number }> = [];

  for (const str of strings) {
    const similarity = calculateSimilarity(target, str);
    if (similarity >= threshold) {
      results.push({ text: str, similarity });
    }
  }

  // Sort by similarity descending
  return results.sort((a, b) => b.similarity - a.similarity);
}
