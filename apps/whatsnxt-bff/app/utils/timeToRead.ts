export function calculateTimeToRead(
  wordCount: number,
  readingSpeed: number = 200,
): string {
  if (!wordCount || wordCount <= 0) return "0 min read";
  const time = Math.ceil(wordCount / readingSpeed);
  return `${time} min read`;
}

export default calculateTimeToRead;
