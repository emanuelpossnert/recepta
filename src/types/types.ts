export type MealPlanType = "Helg" | "Vecka med lyxig helgmeny" | "En dag";
export type Difficulty = 1 | 2 | 3 | 4 | 5;

export interface Recipe {
  name: string;
  cookingTime: string;
  difficulty: Difficulty;
  ingredients: string[];
  instructions: string[];
  cuisine: string;
  diets: string[];
  isEcoFriendly: boolean;
  occasion: string;
  cookingMethod: string;
  imageUrl?: string | null;
}

export interface FilterOptions {
  cuisine: string;
  diets: string[];
  isEcoFriendly: boolean;
  occasion: string;
  mealPlanType: MealPlanType;
  cookingMethod: string;
  difficulty: Difficulty;
  cookingTime: string;
}

export interface ApiResponse {
  recipes: (Recipe & { imageUrl: string | null })[];
}

export interface ApiError {
  error: string;
} 