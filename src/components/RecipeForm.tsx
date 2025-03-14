// RecipeForm.tsx - Uppdaterad version utan ingredients i FilterOptions
// Hanterar formuläret för receptgenerering med alla filter och inställningar
import { useState } from 'react';
import { FilterOptions, MealPlanType, Difficulty } from '../types/types';

const cuisines = [
  "Italienskt", "Svenskt", "Indiskt", "Japanskt", "Kinesiskt", 
  "Thailändskt", "Mexikanskt", "Franskt", "Spanskt", "Grekiskt",
  "Libanesiskt", "Turkiskt", "Vietnamesiskt", "Koreanskt", "Marockanskt",
  "Brasilianskt", "Peruanskt", "Ethiopiskt", "Amerikanskt", "Tyskt",
  "Ryskt", "Polskt", "Malaysiskt", "Indonesiskt", "Singaporianskt",
  "Israeliskt", "Irländskt", "Ungerskt", "Argentinskt", "Karibiskt"
];

const diets = [
  "Allätare", 
  "Vegetariskt", 
  "Veganskt", 
  "Glutenfritt",
  "Laktosfritt",
  "LCHF",
  "Paleo",
  "Pescetariansk",
  "Ketogen"
];

const occasions = [
  "Vardag",
  "Fest",
  "Romantisk middag",
  "Buffé",
  "Picknick",
  "Brunch"
];

const MEAL_PLAN_TYPES: MealPlanType[] = ["En dag", "Helg", "Vecka med lyxig helgmeny"];

const cookingMethods = [
  "Blandad",
  "Ugn",
  "Spis",
  "Grilla",
  "Långkok",
  "Sous vide",
  "Luftfritös",
  "Ångkokning"
];

const cookingTimes = [
  "15-30 min",
  "30-45 min",
  "45-60 min",
  "60-90 min",
  "90+ min"
];

const initialFilterOptions: FilterOptions = {
  cuisine: '',
  diets: [],
  isEcoFriendly: false,
  occasion: '',
  mealPlanType: "En dag" as MealPlanType,
  cookingMethod: '',
  difficulty: 1 as Difficulty,
  cookingTime: ''
};

export default function RecipeForm({ onSubmit }: { onSubmit: (filters: FilterOptions) => void }) {
  const [filters, setFilters] = useState<FilterOptions>(initialFilterOptions);

  const handleDietChange = (diet: string) => {
    setFilters(prev => ({
      ...prev,
      diets: prev.diets.includes(diet)
        ? prev.diets.filter(d => d !== diet)
        : [...prev.diets, diet]
    }));
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          console.log('Form submitted with filters:', filters);
          onSubmit(filters);
        }} 
        className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8 space-y-8"
      >
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">
          Skapa ditt perfekta recept
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Kök */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Välj kök
            </label>
            <select 
              value={filters.cuisine}
              onChange={(e) => setFilters({...filters, cuisine: e.target.value})}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Välj kök...</option>
              {cuisines.map(cuisine => (
                <option key={cuisine} value={cuisine}>{cuisine}</option>
              ))}
            </select>
          </div>

          {/* Kosthållning */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Kosthållning (välj flera)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {diets.map(diet => (
                <label
                  key={diet}
                  className={`flex items-center p-3 rounded-lg border ${
                    filters.diets.includes(diet)
                      ? 'bg-green-50 border-green-500 text-green-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  } cursor-pointer transition-colors duration-200`}
                >
                  <input
                    type="checkbox"
                    checked={filters.diets.includes(diet)}
                    onChange={() => handleDietChange(diet)}
                    className="sr-only"
                  />
                  <span className="text-sm">{diet}</span>
                  {filters.diets.includes(diet) && (
                    <svg 
                      className="ml-auto h-5 w-5 text-green-500" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M5 13l4 4L19 7" 
                      />
                    </svg>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Tillfälle */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Tillfälle
            </label>
            <select 
              value={filters.occasion}
              onChange={(e) => setFilters({...filters, occasion: e.target.value})}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Välj tillfälle...</option>
              {occasions.map(occasion => (
                <option key={occasion} value={occasion}>{occasion}</option>
              ))}
            </select>
          </div>

          {/* Måltidsplan */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Måltidsplan
            </label>
            <select 
              value={filters.mealPlanType}
              onChange={(e) => setFilters({...filters, mealPlanType: e.target.value as MealPlanType})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            >
              {MEAL_PLAN_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Tillagningsmetod */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Tillagningsmetod
            </label>
            <select 
              value={filters.cookingMethod}
              onChange={(e) => setFilters({...filters, cookingMethod: e.target.value})}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Välj metod...</option>
              {cookingMethods.map(method => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </div>

          {/* Tillagningstid */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Tillagningstid
            </label>
            <select 
              value={filters.cookingTime}
              onChange={(e) => setFilters({...filters, cookingTime: e.target.value})}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Välj tid...</option>
              {cookingTimes.map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Svårighetsgrad */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Svårighetsgrad: {filters.difficulty}
          </label>
          <input
            type="range"
            min="1"
            max="5"
            value={filters.difficulty}
            onChange={(e) => setFilters({...filters, difficulty: parseInt(e.target.value) as Difficulty})}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Nybörjare</span>
            <span>Erfaren</span>
          </div>
        </div>

        {/* Miljövänligt */}
        <div className="flex items-center space-x-3 bg-green-50 p-4 rounded-lg">
          <input
            type="checkbox"
            id="eco-friendly"
            checked={filters.isEcoFriendly}
            onChange={(e) => setFilters({...filters, isEcoFriendly: e.target.checked})}
            className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
          />
          <label htmlFor="eco-friendly" className="text-sm font-medium text-gray-700">
            Miljövänligt alternativ
          </label>
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-lg 
                   font-medium shadow-lg hover:from-blue-600 hover:to-blue-700 
                   transform transition duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 
                   focus:ring-blue-500 focus:ring-offset-2"
        >
          Generera recept
        </button>
      </form>
    </div>
  );
} 