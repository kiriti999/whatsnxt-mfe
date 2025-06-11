import type { Category } from '../types/form';

async function replaceAsync(
  str: string,
  regex: RegExp,
  asyncFn: (match: string, ...args: any[]) => Promise<string>,
): Promise<string> {
  const promises: Promise<string>[] = [];
  str.replace(regex, (match: string, ...args: any[]) => {
    const promise = asyncFn(match, ...args);
    promises.push(promise);
    return '';
  });
  const data = await Promise.allSettled(promises);
  return str.replace(regex, () => {
    const result = data.shift();
    if (result?.status === 'fulfilled') {
      return result.value;
    }
    return '';
  });
}

export function getCategoryId(
  categories: Category[],
  categoryName: string,
): string {
  const category = categories.find(
    (item: Category) => item.categoryName === categoryName,
  );
  return category?._id ?? '';
}
