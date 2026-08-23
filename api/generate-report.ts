import { generateForensicReport } from '../server/reportEngine';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const { building, inspection, defects, telemetry } = req.body || {};

  if (!building || !inspection) {
    return res.status(400).json({
      error: 'Missing required report parameters: building and inspection must be provided.',
    });
  }

  try {
    const report = await generateForensicReport({
      building,
      inspection,
      defects: Array.isArray(defects) ? defects : (inspection.defects || []),
      telemetry: Array.isArray(telemetry) ? telemetry : [],
    });

    return res.status(200).json(report);
  } catch (error: any) {
    console.error('Report Generation Error (/api/generate-report):', error);
    return res.status(500).json({
      error: 'Failed to generate forensic audit report.',
      details: error?.message,
    });
  }
}
