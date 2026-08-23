import { executeRoboflowWorkflow } from '../server/analysisEngine';

export default async function handler(req: any, res: any) {
  // Support both Express and Vercel serverless request/response
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

  const { image, imageUrl, element, buildingCode, locationDetails } = body || {};
  const targetImage = image || imageUrl;

  if (!targetImage) {
    return res.status(400).json({
      error: 'No image provided. Please upload a valid structural photograph or provide an image URL.',
    });
  }

  try {
    const analysis = await executeRoboflowWorkflow(
      targetImage,
      element || (buildingCode ? `${buildingCode} Component` : 'Primary Structural Member')
    );
    return res.status(200).json(analysis);
  } catch (error: any) {
    console.error('Roboflow Workflow Execution Error (/api/analyze):', error);
    return res.status(502).json({
      error: error?.message || 'Roboflow serverless workflow returned an unexpected response. Please retry.',
      details: error?.message,
    });
  }
}
