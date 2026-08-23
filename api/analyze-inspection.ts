import { executeRoboflowWorkflow } from '../server/analysisEngine';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const { image, imageUrl, element, buildingCode, locationDetails } = req.body || {};
  const targetImage = image || imageUrl;

  if (!targetImage) {
    return res.status(400).json({
      error: 'Unable to analyze image. Please retry.',
      message: 'No image data provided for inspection analysis.',
    });
  }

  try {
    const analysis = await executeRoboflowWorkflow(
      targetImage,
      element || (buildingCode ? `${buildingCode} Component` : 'Primary Structural Member')
    );
    return res.status(200).json(analysis);
  } catch (error: any) {
    console.error('Roboflow Workflow Execution Error (/api/analyze-inspection):', error);
    return res.status(502).json({
      error: 'Unable to analyze image. Please retry.',
      message: error?.message || 'Roboflow serverless workflow returned an unexpected response.',
    });
  }
}
