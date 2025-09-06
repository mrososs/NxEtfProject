export interface Category {
  id: number;
  category: string | null;
  categoryId: number;
  course: string | null;
  courseId: number;
}

export interface CategoryResponse {
  categories: Category[];
}
