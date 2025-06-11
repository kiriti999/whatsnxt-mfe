export interface IMemoStore {
    categories: ICategory[];
    loading: boolean;
    error: string;
}

interface ICategory {
    categoryId: string;
    categoryName: string;
    count: number;
}