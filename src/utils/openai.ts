import { FilterOptions, Recipe } from '../types/types';

export async function generateRecipes(filters: FilterOptions): Promise<Recipe[]> {
  const response = await fetch('/api/generate-recipes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(filters),
  });

  if (!response.ok) {
    throw new Error('Failed to generate recipes');
  }

  return response.json();
} 