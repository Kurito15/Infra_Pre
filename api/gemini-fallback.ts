import { executeGeminiVisualAnalysis } from '../server/geminiVisualAnalysis';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      // keep body
    }
  }

  const { image, imageUrl, element, roboflowError } = body || {};
  const targetImage = image || imageUrl;

  if (!targetImage) {
    return res.status(400).json({
      error: 'No image data provided for Gemini visual assessment.',
    });
  }

  try {
    const analysis = await executeGeminiVisualAnalysis(
      targetImage,
      element || 'Primary Structural Member',
      roboflowError
    );
    return res.status(200).json(analysis);
  } catch (error: any) {
    console.error('Gemini visual fallback handler error:', error);
    return res.status(500).json({
      error: 'Gemini visual assessment failed.',
      details: error?.message,
    });
  }
}
