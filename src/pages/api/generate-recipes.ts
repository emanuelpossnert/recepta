import OpenAI from 'openai';
import { NextApiRequest, NextApiResponse } from 'next';
import { FilterOptions, Recipe, MealPlanType } from '../../types/types';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY saknas i miljövariablerna');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const VALID_MEAL_PLAN_TYPES = ["En dag", "Helg", "Vecka med lyxig helgmeny"] as const;

const getNumberOfRecipes = (mealPlanType: MealPlanType): number => {
  switch (mealPlanType) {
    case "Helg":
      return 2;
    case "Vecka med lyxig helgmeny":
      return 7;
    case "En dag":
      return 1;
    default:
      return 1;
  }
};

const getMealContext = (index: number, mealPlanType: MealPlanType): string => {
  if (mealPlanType === "Helg") {
    const day = index === 0 ? "lördag" : "söndag";
    return `\nDetta är en middag för ${day}.`;
  } else if (mealPlanType === "Vecka med lyxig helgmeny") {
    const weekdays = ["måndag", "tisdag", "onsdag", "torsdag", "fredag", "lördag", "söndag"] as const;
    const isWeekend = index >= 5;
    const day = weekdays[index];
    return `\nDetta är en ${isWeekend ? 'lyxig ' : ''}middag för ${day}.`;
  }
  return "";
};

async function generateRecipe(basePrompt: string, mealContext: string, index: number): Promise<Recipe> {
  try {
    const prompt = `${basePrompt}${mealContext}
    
    Skapa ett unikt recept som inte liknar tidigare recept.
    Returnera svaret i följande format (endast JSON, inga andra förklaringar):

    {
      "name": "Rättens namn",
      "cookingTime": "Tillagningstid",
      "difficulty": numeriskt värde mellan 1 och 5,
      "ingredients": ["ingrediens 1", "ingrediens 2"],
      "instructions": ["steg 1", "steg 2"],
      "cuisine": "typ av kök",
      "diets": ["kosthållning1", "kosthållning2"],
      "isEcoFriendly": true/false,
      "occasion": "tillfälle",
      "cookingMethod": "tillagningsmetod"
    }`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Du är en professionell kock som skapar unika recept. Varje recept ska vara distinkt och annorlunda från andra recept. Svara endast med JSON-data enligt det specificerade formatet."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.9,
      max_tokens: 1000
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('Inget innehåll returnerades från API:et');
    }
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Kunde inte hitta JSON i svaret');
    }

    const recipeData = JSON.parse(jsonMatch[0]);
    
    // Validera att alla nödvändiga fält finns
    const requiredFields = ['name', 'cookingTime', 'difficulty', 'ingredients', 'instructions', 'cuisine'];
    for (const field of requiredFields) {
      if (!(field in recipeData)) {
        throw new Error(`Saknat fält i receptdata: ${field}`);
      }
    }

    return {
      ...recipeData,
      difficulty: Number(recipeData.difficulty)
    };
  } catch (error) {
    console.error(`Fel vid generering av recept ${index}:`, error);
    throw new Error(`Kunde inte generera recept ${index}: ${error instanceof Error ? error.message : 'Okänt fel'}`);
  }
}

async function generateImagesInBatches(recipes: Recipe[], batchSize: number = 5): Promise<string[]> {
  const imageUrls: string[] = [];
  const maxRetries = 3;
  
  for (let i = 0; i < recipes.length; i += batchSize) {
    const batch = recipes.slice(i, i + batchSize);
    
    const imagePromises = batch.map(async (recipe) => {
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const response = await openai.images.generate({
            prompt: `A professional food photo of ${recipe.name}, ${recipe.cuisine} cuisine style, on a white plate with garnish, professional lighting, high quality, 4k`,
            n: 1,
            size: "1024x1024",
            quality: "standard",
          });

          const url = response.data[0].url;
          if (!url) {
            throw new Error('Ingen URL returnerades');
          }
          return url;
        } catch (error) {
          if (attempt === maxRetries - 1) {
            console.error(`Kunde inte generera bild för ${recipe.name} efter ${maxRetries} försök`);
            return null;
          }
          // Vänta innan nästa försök
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
      return null;
    });

    const batchUrls = await Promise.all(imagePromises);
    imageUrls.push(...batchUrls.filter((url): url is string => url !== null));

    if (i + batchSize < recipes.length) {
      await new Promise(resolve => setTimeout(resolve, 61000));
    }
  }

  return imageUrls;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { mealPlanType } = req.body as { 
      mealPlanType: MealPlanType 
    };

    if (!VALID_MEAL_PLAN_TYPES.includes(mealPlanType as typeof VALID_MEAL_PLAN_TYPES[number])) {
      return res.status(400).json({ error: 'Ogiltig måltidsplantyp' });
    }

    const numberOfRecipes = getNumberOfRecipes(mealPlanType);
    const recipes: Recipe[] = [];

    // Generera recept för varje måltid
    for (let i = 0; i < numberOfRecipes; i++) {
      const mealContext = getMealContext(i, mealPlanType);
      const basePrompt = `Skapa ett recept som passar för ${mealContext || 'en middag'}`;
      
      const recipe = await generateRecipe(basePrompt, mealContext, i);
      recipes.push(recipe);
    }

    // Generera bilder för recepten
    const imageUrls = await generateImagesInBatches(recipes);

    // Kombinera recept med bilder
    const recipesWithImages = recipes.map((recipe, index) => ({
      ...recipe,
      imageUrl: imageUrls[index] || null
    }));

    res.status(200).json({ recipes: recipesWithImages });
  } catch (error) {
    console.error('Error generating recipes:', error);
    res.status(500).json({ error: 'Failed to generate recipes' });
  }
} 