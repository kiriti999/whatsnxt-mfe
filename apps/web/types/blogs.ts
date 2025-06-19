import { Category } from './form';

export interface BlogFormProps {
  categories: Category[];
  edit?: {
    id: string;
    title: string;
    description: string;
    categoryName: string;
    subCategory?: string;
    nestedSubCategory?: string;
    blogImagePreview?: string;
    contentFormat?: string;
    imageUrl?: string;
    cloudinaryAssets?: {
      publicId: string;
      resource_type: string;
      url: string;
      secureUrl: string;
      format: string;
    }[] | null
  };
}