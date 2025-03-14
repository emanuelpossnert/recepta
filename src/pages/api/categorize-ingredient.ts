import OpenAI from 'openai';
import { NextApiRequest, NextApiResponse } from 'next';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { ingredient } = req.body;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Du är en expert på att kategorisera matvaror. Kategorisera ingredienser i exakt en av följande kategorier:
            - kött
            - fisk
            - mejeri
            - grönsaker
            - frukt
            - kryddor
            - torrvaror
            - bröd
            - konserver
            - såser
            - dryck
            - övrigt
            
            Svara endast med kategorin i lowercase, inga andra ord eller förklaringar.`
        },
        {
          role: "user",
          content: ingredient
        }
      ],
      temperature: 0,
      max_tokens: 10
    });

    const category = completion.choices[0].message.content?.toLowerCase().trim();
    res.status(200).json({ category });
  } catch (error) {
    console.error('Error categorizing ingredient:', error);
    res.status(500).json({ message: 'Error categorizing ingredient' });
  }
} 