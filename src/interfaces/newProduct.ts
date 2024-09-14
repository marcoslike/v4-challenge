// INewProduct.ts
export interface INewProduct {
  code: string;
  name: string;
  brands?: string;
  categories?: string[];
  labels?: string[];
  quantity?: string;
  ingredients_text?: string;
  nutriments: {
    energy_kj_100g: number;
    fat_100g: number;
    sugars_100g: number;
    proteins_100g: number;
    salt_100g: number;
    saturated_fat_100g: number;
    energy_kcal_100g: number;
    carbohydrates_100g: number;
    sodium_100g: number;
    fiber_100g: number;
  };
  countries: string[];
  image_url: string;
  status: 'draft' | 'published';
  imported_t: Date;
}
