import OpenAI from 'openai';
import { NextApiRequest, NextApiResponse } from 'next';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const response = await openai.images.generate({
      prompt: "Abstract food background with subtle culinary elements, soft pastel colors, very light and airy, perfect for website background, minimalistic design",
      n: 1,
      size: "1024x1024",
    });

    res.status(200).json({ imageUrl: response.data[0].url });
  } catch (error) {
    console.error('Error generating background:', error);
    res.status(500).json({ message: 'Error generating background image' });
  }
} 