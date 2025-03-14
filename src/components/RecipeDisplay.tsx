import { Recipe } from '../types/types';
import { useState, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import { sv } from 'date-fns/locale';

// Definiera kategorier för ingredienser med mer omfattande nyckelord
const ingredientCategories = {
  kött: [
    'kött', 'fläsk', 'kyckling', 'nöt', 'lamm', 'korv', 'bacon', 'skinka', 'köttfärs',
    'biff', 'entrecôte', 'oxfilé', 'kalv', 'färs', 'kotlett', 'karré', 'revben',
    'rostbiff', 'kassler', 'pulled', 'salami', 'chorizo', 'prosciutto'
  ],
  fisk: [
    'lax', 'torsk', 'räkor', 'fisk', 'skaldjur', 'tonfisk', 'sej', 'makrill',
    'krabba', 'hummer', 'musslor', 'rödspätta', 'sill', 'kaviar', 'kräftor',
    'havskatt', 'kolja', 'sardiner', 'ansjovis'
  ],
  mejeri: [
    'mjölk', 'grädde', 'ost', 'smör', 'yoghurt', 'crème fraiche', 'kvarg',
    'filmjölk', 'keso', 'färskost', 'mozzarella', 'parmesan', 'cheddar',
    'cream cheese', 'mascarpone', 'ricotta', 'ägg', 'halloumi', 'fetaost'
  ],
  grönsaker: [
    'tomat', 'sallad', 'gurka', 'morot', 'lök', 'vitlök', 'paprika', 'broccoli',
    'spenat', 'zucchini', 'aubergine', 'squash', 'pumpa', 'kål', 'blomkål',
    'rödkål', 'vitkål', 'grönkål', 'rödlök', 'gul lök', 'purjolök', 'salladslök',
    'sparris', 'kronärtskocka', 'rödbetor', 'palsternacka', 'selleri', 'fänkål',
    'champinjoner', 'svamp', 'potatis', 'sötpotatis', 'morötter', 'ärtor',
    'majs', 'avokado', 'ruccola', 'mangold', 'sockerärtor', 'haricots verts'
  ],
  frukt: [
    'äpple', 'citron', 'lime', 'apelsin', 'banan', 'bär', 'päron', 'plommon',
    'persika', 'nektarin', 'mango', 'ananas', 'vindruvor', 'granatäpple',
    'fikon', 'dadlar', 'hallon', 'blåbär', 'jordgubbar', 'björnbär', 'lingon',
    'tranbär', 'passionsfrukt', 'kiwi', 'clementin', 'mandarin'
  ],
  kryddor: [
    'salt', 'peppar', 'basilika', 'oregano', 'timjan', 'rosmarin', 'kanel',
    'kardemumma', 'ingefära', 'curry', 'spiskummin', 'paprikapulver',
    'cayenne', 'chili', 'muskotnöt', 'nejlika', 'saffran', 'vanilj',
    'lagerblad', 'persilja', 'dill', 'koriander', 'dragon', 'salvia',
    'gurkmeja', 'anis', 'fänkål', 'vitpeppar', 'svartpeppar'
  ],
  torrvaror: [
    'pasta', 'ris', 'mjöl', 'socker', 'nötter', 'linser', 'bönor', 'couscous',
    'quinoa', 'bulgur', 'havregryn', 'cornflakes', 'müsli', 'mandel',
    'valnötter', 'cashewnötter', 'pinjenötter', 'sesamfrön', 'chiafrön',
    'solrosfrön', 'pumpakärnor', 'kokos', 'russin', 'kikärtor', 'majsstärkelse',
    'potatismjöl', 'bakpulver', 'jäst', 'ströbröd'
  ],
  bröd: [
    'bröd', 'tortilla', 'wrap', 'hamburgerbröd', 'pitabröd', 'tunnbröd',
    'knäckebröd', 'baguette', 'ciabatta', 'focaccia', 'surdegsbröd',
    'rågbröd', 'toast', 'korvbröd', 'tekaka', 'scones'
  ],
  konserver: [
    'konserv', 'burk', 'krossade tomater', 'tomatpuré', 'kokosmjölk',
    'kokosgrädde', 'oliver', 'kapris', 'soltorkade tomater', 'inlagd',
    'syltad', 'marinerad', 'passerade tomater', 'tomatpasta'
  ],
  såser: [
    'sås', 'ketchup', 'majonnäs', 'senap', 'soja', 'vinäger', 'olja',
    'olivolja', 'rapsolja', 'sesamolja', 'balsamico', 'worcestershire',
    'tabasco', 'sriracha', 'sweet chilisås', 'pesto', 'aioli', 'dressing'
  ],
  dryck: [
    'vin', 'öl', 'juice', 'läsk', 'vatten', 'buljong', 'fond', 'mineralvatten',
    'cider', 'cognac', 'whisky', 'rom', 'likör', 'mjölk', 'grädde'
  ],
  övrigt: []
};

interface ParsedIngredient {
  amount: string;
  unit: string;
  item: string;
}

function parseIngredient(ingredient: string): ParsedIngredient {
  // Regex för att matcha mängd, enhet och vara
  const regex = /^(?:(\d+(?:[,.]\d+)?)\s*([a-zåäö]+)?\s+)?(.+)$/i;
  const match = ingredient.match(regex);

  if (match) {
    return {
      amount: match[1] || '',
      unit: match[2] || '',
      item: match[3].toLowerCase()
    };
  }

  return {
    amount: '',
    unit: '',
    item: ingredient.toLowerCase()
  };
}

async function getIngredientCategory(ingredient: string): Promise<string> {
  try {
    const response = await fetch('/api/categorize-ingredient', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ingredient }),
    });

    if (!response.ok) {
      throw new Error('Failed to categorize ingredient');
    }

    const data = await response.json();
    return data.category;
  } catch (error) {
    console.error('Error categorizing ingredient:', error);
    return 'övrigt';
  }
}

async function combineIngredients(ingredients: string[]): Promise<Record<string, ParsedIngredient[]>> {
  const categorizedIngredients: Record<string, ParsedIngredient[]> = {
    kött: [],
    fisk: [],
    mejeri: [],
    grönsaker: [],
    frukt: [],
    kryddor: [],
    torrvaror: [],
    bröd: [],
    konserver: [],
    såser: [],
    dryck: [],
    övrigt: []
  };

  const combinedIngredients = new Map<string, ParsedIngredient>();

  // Först kombinera lika ingredienser
  ingredients.forEach(ing => {
    const parsed = parseIngredient(ing);
    const existingIng = combinedIngredients.get(parsed.item);

    if (existingIng && existingIng.unit === parsed.unit) {
      const amount1 = parseFloat(existingIng.amount) || 0;
      const amount2 = parseFloat(parsed.amount) || 0;
      existingIng.amount = (amount1 + amount2).toString();
    } else {
      combinedIngredients.set(parsed.item, parsed);
    }
  });

  // Sedan kategorisera alla ingredienser med AI
  const categorizePromises = Array.from(combinedIngredients.entries()).map(
    async ([item, ingredient]) => {
      const category = await getIngredientCategory(item);
      return { item, ingredient, category };
    }
  );

  const categorizedItems = await Promise.all(categorizePromises);
  
  // Slutligen, lägg till i rätt kategori
  categorizedItems.forEach(({ ingredient, category }) => {
    categorizedIngredients[category].push(ingredient);
  });

  return categorizedIngredients;
}

interface CheckedIngredients {
  [category: string]: {
    [index: number]: boolean;
  };
}

interface ScheduledRecipe {
  recipeIndex: number;
  date: Date;
}

export default function RecipeDisplay({ recipes }: { recipes: Recipe[] }) {
  const [categorizedIngredients, setCategorizedIngredients] = useState<Record<string, ParsedIngredient[]>>({
    kött: [],
    fisk: [],
    mejeri: [],
    grönsaker: [],
    frukt: [],
    kryddor: [],
    torrvaror: [],
    bröd: [],
    konserver: [],
    såser: [],
    dryck: [],
    övrigt: []
  });

  const [checkedIngredients, setCheckedIngredients] = useState<CheckedIngredients>({});
  const [scheduledRecipes, setScheduledRecipes] = useState<ScheduledRecipe[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedRecipeIndex, setSelectedRecipeIndex] = useState<number | null>(null);

  useEffect(() => {
    const allIngredients = recipes.flatMap(r => r.ingredients);
    combineIngredients(allIngredients).then(setCategorizedIngredients);
  }, [recipes]);

  const handleCheckIngredient = (category: string, index: number) => {
    setCheckedIngredients(prev => ({
      ...prev,
      [category]: {
        ...(prev[category] || {}),
        [index]: !(prev[category]?.[index] || false)
      }
    }));
  };

  const getCheckedIngredients = () => {
    const checked: string[] = [];
    Object.entries(categorizedIngredients).forEach(([category, ingredients]) => {
      ingredients.forEach((ing, index) => {
        if (checkedIngredients[category]?.[index]) {
          checked.push(ing.amount && ing.unit 
            ? `${ing.amount} ${ing.unit} ${ing.item}`
            : ing.item
          );
        }
      });
    });
    return checked;
  };

  const shareList = (method: 'whatsapp' | 'messenger' | 'email') => {
    const checkedItems = getCheckedIngredients();
    if (checkedItems.length === 0) {
      alert('Välj först ingredienser att dela');
      return;
    }

    const text = `Inköpslista:\n\n${checkedItems.join('\n')}`;
    
    switch (method) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
        break;
      case 'messenger':
        window.open(`https://www.facebook.com/share/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(text)}`);
        break;
      case 'email':
        window.open(`mailto:?subject=Inköpslista&body=${encodeURIComponent(text)}`);
        break;
    }
  };

  const handleScheduleRecipe = (recipeIndex: number) => {
    setSelectedRecipeIndex(recipeIndex);
  };

  const confirmSchedule = (date: string) => {
    if (selectedRecipeIndex === null) return;

    const newSchedule: ScheduledRecipe = {
      recipeIndex: selectedRecipeIndex,
      date: new Date(date)
    };

    setScheduledRecipes(prev => [...prev, newSchedule]);
    createCalendarEvent(recipes[selectedRecipeIndex], new Date(date));
    setSelectedRecipeIndex(null);
    setSelectedDate('');
  };

  const createCalendarEvent = (recipe: Recipe, date: Date) => {
    // Sätt tiden till 17:00
    const eventDate = new Date(date);
    eventDate.setHours(17, 0, 0);

    // Skapa beskrivning med ingredienser och instruktioner
    const description = `
Recept: ${recipe.name}

Ingredienser:
${recipe.ingredients.join('\n')}

Instruktioner:
${recipe.instructions.map((step, i) => `${i + 1}. ${step}`).join('\n')}
    `.trim();

    // Skapa ICS-format för kalenderinbjudan
    const endDate = new Date(eventDate);
    endDate.setHours(18, 0, 0); // 1 timme längd

    const icsData = {
      title: `Laga mat: ${recipe.name}`,
      description,
      startTime: eventDate,
      endTime: endDate,
      location: 'Hemma'
    };

    // Generera Google Calendar länk
    const googleUrl = new URL('https://calendar.google.com/calendar/render');
    googleUrl.searchParams.append('action', 'TEMPLATE');
    googleUrl.searchParams.append('text', icsData.title);
    googleUrl.searchParams.append('details', icsData.description);
    googleUrl.searchParams.append('location', icsData.location);
    googleUrl.searchParams.append('dates', 
      `${format(eventDate, "yyyyMMdd'T'HHmmss")}/${format(endDate, "yyyyMMdd'T'HHmmss")}`
    );

    // Öppna kalenderlänken
    window.open(googleUrl.toString(), '_blank');
  };

  const shareShoppingListCalendar = (method: 'google' | 'outlook' | 'ical') => {
    const checkedItems = getCheckedIngredients();
    if (checkedItems.length === 0) {
      alert('Välj först ingredienser att dela');
      return;
    }

    // Sätt tiden till imorgon kl 10:00
    const eventDate = addDays(new Date(), 1);
    eventDate.setHours(10, 0, 0);
    const endDate = new Date(eventDate);
    endDate.setHours(11, 0, 0);

    const description = `Inköpslista:

${checkedItems.join('\n')}`;

    switch (method) {
      case 'google':
        const googleUrl = new URL('https://calendar.google.com/calendar/render');
        googleUrl.searchParams.append('action', 'TEMPLATE');
        googleUrl.searchParams.append('text', 'Handla mat');
        googleUrl.searchParams.append('details', description);
        googleUrl.searchParams.append('dates', 
          `${format(eventDate, "yyyyMMdd'T'HHmmss")}/${format(endDate, "yyyyMMdd'T'HHmmss")}`
        );
        window.open(googleUrl.toString(), '_blank');
        break;

      case 'outlook':
        const outlookUrl = new URL('https://outlook.live.com/calendar/0/deeplink/compose');
        outlookUrl.searchParams.append('subject', 'Handla mat');
        outlookUrl.searchParams.append('body', description);
        outlookUrl.searchParams.append('startdt', eventDate.toISOString());
        outlookUrl.searchParams.append('enddt', endDate.toISOString());
        window.open(outlookUrl.toString(), '_blank');
        break;

      case 'ical':
        const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${format(eventDate, "yyyyMMdd'T'HHmmss")}
DTEND:${format(endDate, "yyyyMMdd'T'HHmmss")}
SUMMARY:Handla mat
DESCRIPTION:${description.replace(/\n/g, '\\n')}
END:VEVENT
END:VCALENDAR`;

        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = 'inkopslista.ics';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        break;
    }
  };

  const shareRecipe = (recipe: Recipe, method: 'whatsapp' | 'messenger' | 'email') => {
    const text = `
${recipe.name}

Ingredienser:
${recipe.ingredients.join('\n')}

Instruktioner:
${recipe.instructions.map((step, i) => `${i + 1}. ${step}`).join('\n')}

Tillagningstid: ${recipe.cookingTime}
Svårighetsgrad: ${recipe.difficulty}/100
`.trim();

    switch (method) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
        break;
      case 'messenger':
        window.open(`https://www.facebook.com/share/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(text)}`);
        break;
      case 'email':
        window.open(`mailto:?subject=${encodeURIComponent(recipe.name)}&body=${encodeURIComponent(text)}`);
        break;
    }
  };

  const shareCalendarEvent = (recipe: Recipe, date: Date, method: 'google' | 'outlook' | 'ical') => {
    const eventDate = new Date(date);
    eventDate.setHours(17, 0, 0);
    const endDate = new Date(eventDate);
    endDate.setHours(18, 0, 0);

    const description = `
${recipe.name}

Ingredienser:
${recipe.ingredients.join('\n')}

Instruktioner:
${recipe.instructions.map((step, i) => `${i + 1}. ${step}`).join('\n')}

Tillagningstid: ${recipe.cookingTime}
Svårighetsgrad: ${recipe.difficulty}/100
    `.trim();

    switch (method) {
      case 'google':
        const googleUrl = new URL('https://calendar.google.com/calendar/render');
        googleUrl.searchParams.append('action', 'TEMPLATE');
        googleUrl.searchParams.append('text', `Laga mat: ${recipe.name}`);
        googleUrl.searchParams.append('details', description);
        googleUrl.searchParams.append('location', 'Hemma');
        googleUrl.searchParams.append('dates', 
          `${format(eventDate, "yyyyMMdd'T'HHmmss")}/${format(endDate, "yyyyMMdd'T'HHmmss")}`
        );
        window.open(googleUrl.toString(), '_blank');
        break;

      case 'outlook':
        const outlookUrl = new URL('https://outlook.live.com/calendar/0/deeplink/compose');
        outlookUrl.searchParams.append('subject', `Laga mat: ${recipe.name}`);
        outlookUrl.searchParams.append('body', description);
        outlookUrl.searchParams.append('location', 'Hemma');
        outlookUrl.searchParams.append('startdt', eventDate.toISOString());
        outlookUrl.searchParams.append('enddt', endDate.toISOString());
        window.open(outlookUrl.toString(), '_blank');
        break;

      case 'ical':
        const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${format(eventDate, "yyyyMMdd'T'HHmmss")}
DTEND:${format(endDate, "yyyyMMdd'T'HHmmss")}
SUMMARY:Laga mat: ${recipe.name}
DESCRIPTION:${description.replace(/\n/g, '\\n')}
LOCATION:Hemma
END:VEVENT
END:VCALENDAR`;

        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `${recipe.name.toLowerCase().replace(/\s+/g, '-')}.ics`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        break;
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {recipes.map((recipe, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {recipe.imageUrl && (
                <div className="relative h-64">
                  <img 
                    src={recipe.imageUrl} 
                    alt={recipe.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h2 className="text-2xl font-bold text-white mb-1">{recipe.name}</h2>
                    <div className="flex items-center space-x-4">
                      <span className="text-white/90 text-sm">
                        {recipe.cookingTime}
                      </span>
                      <span className="text-white/90 text-sm">
                        Svårighetsgrad: {recipe.difficulty}/100
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="p-6 grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Ingredienser
                  </h3>
                  <ul className="space-y-2">
                    {recipe.ingredients.map((ingredient, i) => (
                      <li key={i} className="flex items-center text-gray-600">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                        {ingredient}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                    Instruktioner
                  </h3>
                  <ol className="space-y-3">
                    {recipe.instructions.map((instruction, i) => (
                      <li key={i} className="flex text-gray-600">
                        <span className="font-bold mr-2">{i + 1}.</span>
                        {instruction}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              {/* Lägg till delnings- och schemaläggningsknappar */}
              <div className="p-4 border-t flex justify-between items-center">
                <div className="flex space-x-2">
                  <button
                    onClick={() => shareRecipe(recipe, 'whatsapp')}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Dela via WhatsApp"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                  </button>
                  
                  <button
                    onClick={() => shareRecipe(recipe, 'messenger')}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Dela via Messenger"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.3 2.246.464 3.443.464 6.627 0 12-4.975 12-11.111S18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.259L19.752 8l-6.561 6.963z"/>
                    </svg>
                  </button>
                  
                  <button
                    onClick={() => shareRecipe(recipe, 'email')}
                    className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                    title="Dela via Email"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                  </button>
                </div>

                {/* Schemaläggningsknappar (tidigare kod) */}
                {selectedRecipeIndex === index ? (
                  <div className="flex space-x-2">
                    <div className="flex items-center space-x-4">
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={format(new Date(), 'yyyy-MM-dd')}
                        className="rounded-lg border-gray-300 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    
                    {selectedDate && (
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => shareCalendarEvent(recipe, new Date(selectedDate), 'google')}
                          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0C5.383 0 0 5.383 0 12s5.383 12 12 12 12-5.383 12-12S18.617 0 12 0zm-1.2 16.8l-4.8-4.8 1.68-1.68 3.12 3.12 6.72-6.72 1.68 1.68-8.4 8.4z"/>
                          </svg>
                          <span>Google Kalender</span>
                        </button>
                        
                        <button
                          onClick={() => shareCalendarEvent(recipe, new Date(selectedDate), 'outlook')}
                          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M7.88 12.04q0 .45-.11.87-.31.98-.89 1.67-.58.69-1.33 1.33-.74.64-1.42 1.09-.68.45-1.33.88-.65.43-1.31.86-.66.43-1.31.86-.65.43-1.31.86L0 17.25V6.79q.03-.08.1-.19.07-.11.14-.19.07-.08.15-.15.08-.06.13-.11.05-.04.11-.09.06-.04.12-.09.06-.05.13-.11.07-.05.14-.1.07-.05.14-.1.07-.04.13-.07.06-.03.12-.04.06-.02.13-.02h9.5q.51 0 .99.06.48.07.91.23.43.16.79.43.36.27.64.65.28.38.45.88.17.5.17 1.16M23 12v7h-3q-.55 0-1.06-.14-.51-.15-.96-.42-.45-.28-.83-.64-.37-.36-.67-.78-.3-.42-.48-.89-.17-.47-.17-.95 0-.48.17-.95.18-.47.48-.89.3-.42.67-.78.38-.36.83-.64.45-.27.96-.42.51-.14 1.06-.14.16 0 .31.02.15.02.28.06.13.04.24.1.11.06.2.14.09.08.16.19.07.11.11.24h.03V12H23m-2.5 1.5q-.75 0-1.37.37-.63.37-1 1-.38.63-.38 1.38 0 .75.38 1.38.37.63 1 1 .62.37 1.37.37.75 0 1.38-.37.62-.37 1-1 .37-.63.37-1.38 0-.75-.37-1.38-.38-.63-1-1-.63-.37-1.38-.37M7.5 21h-7L0 19.25v-.04q.66-.43 1.31-.86.65-.43 1.31-.86.66-.43 1.31-.86.65-.43 1.33-.88.68-.45 1.42-1.09.74-.64 1.33-1.33.58-.69.89-1.67.11-.42.11-.87 0-.66-.17-1.16-.17-.5-.45-.88-.28-.38-.64-.65-.36-.27-.79-.43-.43-.16-.91-.23-.48-.06-.99-.06h-5v-2h14v2h-3.34q.29.35.53.8.24.45.4.97.16.52.23 1.09.07.57.07 1.19v.44q0 .22-.02.4-.02.18-.04.31-.02.13-.04.21h-.02v.24q0 .77-.03 1.43-.03.66-.1 1.23-.07.57-.19 1.07-.12.5-.29.93H7.5M2 4V2h14v2H2z"/>
                          </svg>
                          <span>Outlook</span>
                        </button>
                        
                        <button
                          onClick={() => shareCalendarEvent(recipe, new Date(selectedDate), 'ical')}
                          className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                          </svg>
                          <span>Ladda ner .ics</span>
                        </button>
                      </div>
                    )}
                    
                    <button
                      onClick={() => setSelectedRecipeIndex(null)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Avbryt
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleScheduleRecipe(index)}
                    className="flex items-center space-x-2 text-green-600 hover:text-green-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                      />
                    </svg>
                    <span>Schemalägg recept</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mt-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <svg className="w-6 h-6 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Inköpslista
            </h2>
            
            <div className="flex space-x-2">
              <button
                onClick={() => shareList('whatsapp')}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Dela via WhatsApp"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </button>
              
              <button
                onClick={() => shareList('messenger')}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Dela via Messenger"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.3 2.246.464 3.443.464 6.627 0 12-4.975 12-11.111S18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.259L19.752 8l-6.561 6.963z"/>
                </svg>
              </button>
              
              <button
                onClick={() => shareList('email')}
                className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                title="Dela via Email"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </button>

              {/* Lägg till kalenderdelningsknappar */}
              <button
                onClick={() => shareShoppingListCalendar('google')}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Lägg till i Google Calendar"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path fill="#4285F4" d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12c6.627 0 12-5.372 12-12S18.627 0 12 0zm.14 19.018c-3.868 0-7-3.132-7-7 0-3.868 3.132-7 7-7 1.89 0 3.47.697 4.7 1.829l-2.016 2.035C13.825 7.905 12.573 7.483 11.14 7.483c-2.503 0-4.535 2.032-4.535 4.535s2.032 4.535 4.535 4.535c2.012 0 3.725-1.217 4.344-2.868h-3.344v-2.636h7.018v1.318c0 3.868-3.132 7-7 7z"/>
                </svg>
              </button>

              <button
                onClick={() => shareShoppingListCalendar('outlook')}
                className="p-2 text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                title="Lägg till i Outlook"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#0078D4" d="M7.88 12.04q0 .45-.11.87-.31.98-.89 1.67-.58.69-1.33 1.33-.74.64-1.42 1.09-.68.45-1.33.88-.65.43-1.31.86-.66.43-1.31.86-.65.43-1.31.86L0 17.25V6.79q.03-.08.1-.19.07-.11.14-.19.07-.08.15-.15.08-.06.13-.11.05-.04.11-.09.06-.04.12-.09.06-.05.13-.11.07-.05.14-.1.07-.05.14-.1.07-.04.13-.07.06-.03.12-.04.06-.02.13-.02h9.5q.51 0 .99.06.48.07.91.23.43.16.79.43.36.27.64.65.28.38.45.88.17.5.17 1.16M23 12v7h-3q-.55 0-1.06-.14-.51-.15-.96-.42-.45-.28-.83-.64-.37-.36-.67-.78-.3-.42-.48-.89-.17-.47-.17-.95 0-.48.17-.95.18-.47.48-.89.3-.42.67-.78.38-.36.83-.64.45-.27.96-.42.51-.14 1.06-.14.16 0 .31.02.15.02.28.06.13.04.24.1.11.06.2.14.09.08.16.19.07.11.11.24h.03V12H23m-2.5 1.5q-.75 0-1.37.37-.63.37-1 1-.38.63-.38 1.38 0 .75.38 1.38.37.63 1 1 .62.37 1.37.37.75 0 1.38-.37.62-.37 1-1 .37-.63.37-1.38 0-.75-.37-1.38-.38-.63-1-1-.63-.37-1.38-.37M7.5 21h-7L0 19.25v-.04q.66-.43 1.31-.86.65-.43 1.31-.86.66-.43 1.31-.86.65-.43 1.33-.88.68-.45 1.42-1.09.74-.64 1.33-1.33.58-.69.89-1.67.11-.42.11-.87 0-.66-.17-1.16-.17-.5-.45-.88-.28-.38-.64-.65-.36-.27-.79-.43-.43-.16-.91-.23-.48-.06-.99-.06h-5v-2h14v2h-3.34q.29.35.53.8.24.45.4.97.16.52.23 1.09.07.57.07 1.19v.44q0 .22-.02.4-.02.18-.04.31-.02.13-.04.21h-.02v.24q0 .77-.03 1.43-.03.66-.1 1.23-.07.57-.19 1.07-.12.5-.29.93H7.5M2 4V2h14v2H2z"/>
                </svg>
              </button>

              <button
                onClick={() => shareShoppingListCalendar('ical')}
                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                title="Ladda ner .ics fil"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Object.entries(categorizedIngredients).map(([category, ingredients]) => (
              ingredients.length > 0 && (
                <div key={category} className="space-y-3">
                  <h3 className="font-semibold text-lg text-gray-700 capitalize border-b pb-2">
                    {category}
                  </h3>
                  <div className="space-y-2">
                    {ingredients.map((ing, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`ingredient-${category}-${i}`}
                          checked={checkedIngredients[category]?.[i] || false}
                          onChange={() => handleCheckIngredient(category, i)}
                          className="w-4 h-4 text-green-500 border-gray-300 rounded focus:ring-green-500"
                        />
                        <label htmlFor={`ingredient-${category}-${i}`} className="text-gray-600">
                          {ing.amount && ing.unit 
                            ? `${ing.amount} ${ing.unit} ${ing.item}`
                            : ing.item}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 