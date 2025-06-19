import type { Category } from '../types/form';

export function getCategoryId(
  categories: Category[],
  categoryName: string,
): string {
  const category = categories.find(
    (item: Category) => item.categoryName === categoryName,
  );
  return category?._id ?? '';
}
