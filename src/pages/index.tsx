import { useState, useEffect } from 'react';
import RecipeForm from '../components/RecipeForm';
import RecipeDisplay from '../components/RecipeDisplay';
import { Recipe, FilterOptions } from '../types/types';
import Logo from '../components/Logo';

export default function Home() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [progressPercent, setProgressPercent] = useState<number>(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (loading && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(time => time - 1);
        setProgressPercent(prev => prev + (100 / (estimatedTime)));
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [loading, timeLeft]);

  const estimatedTime = 20; // Uppskattad tid i sekunder

  const handleSubmit = async (filters: FilterOptions) => {
    try {
      setLoading(true);
      setError(null);
      setProgress('Genererar recept...');
      setTimeLeft(estimatedTime);
      setProgressPercent(0);

      console.log('Filters being sent:', filters);

      const recipesCount = filters.mealPlanType === "Helg" ? 2
        : filters.mealPlanType === "Vecka med lyxig helgmeny" ? 7 
        : 1;

      const generatedRecipes = await generateRecipes(filters);
      setRecipes(generatedRecipes);
    } catch (error) {
      console.error('Failed to generate recipes:', error);
      setError('Något gick fel vid generering av recept. Försök igen.');
      setRecipes([]);
    } finally {
      setLoading(false);
      setProgress('');
      setTimeLeft(0);
      setProgressPercent(0);
    }
  };

  const generateRecipes = async (filters: FilterOptions) => {
    try {
      // Lägg till en standardlista med ingredienser
      const defaultIngredients = [
        "kyckling", "nötkött", "lax", "pasta", "ris", 
        "potatis", "morötter", "lök", "vitlök", "tomater"
      ];

      const response = await fetch('/api/generate-recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...filters,
          ingredients: defaultIngredients
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate recipes');
      }

      const data = await response.json();
      return data.recipes;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto py-6 px-4">
            <div className="flex items-center justify-between">
              <Logo />
              <p className="text-sm text-gray-500 italic">
                AI-driven receptgenerering
              </p>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {!recipes.length ? (
            <div className="mt-8">
              <RecipeForm onSubmit={handleSubmit} />
            </div>
          ) : (
            <>
              <button
                onClick={() => {
                  setRecipes([]);
                  setProgress('');
                }}
                className="mb-6 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 
                          transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                Skapa ny måltidsplan
              </button>
              <RecipeDisplay recipes={recipes} />
            </>
          )}

          {loading && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-8 rounded-xl shadow-xl max-w-sm w-full mx-4">
                <div className="relative">
                  {/* Progress bar */}
                  <div className="w-full h-2 bg-gray-200 rounded-full mb-4">
                    <div 
                      className="h-full bg-green-500 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(progressPercent, 100)}%` }}
                    />
                  </div>
                  
                  {/* Spinning circle */}
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mx-auto" />
                  
                  {/* Progress text */}
                  <p className="mt-6 text-gray-700 text-center font-medium">
                    {progress}
                    {timeLeft > 0 && (
                      <span className="block text-sm text-gray-500 mt-1">
                        Beräknad tid kvar: {timeLeft} sekunder
                      </span>
                    )}
                  </p>

                  {/* Additional info */}
                  <p className="mt-2 text-sm text-gray-500 text-center">
                    {recipes.length > 5 && "Detta kan ta några minuter..."}
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>

        <footer className="py-4 text-center text-sm text-gray-500 bg-white shadow-sm mt-8">
          <p>© {new Date().getFullYear()} Recepta. Alla rättigheter förbehållna.</p>
        </footer>
      </div>
    </div>
  );
} 