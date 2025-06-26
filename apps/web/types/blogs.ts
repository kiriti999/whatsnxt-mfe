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
      public_id: string;
      resource_type: string;
      url: string;
      secure_url: string;
      format: string;
    }[] | null
  };
}