export default async function handler(req: any, res: any) {
  const apiKey = process.env.ROBOFLOW_API_KEY || 'hFTl5s6IVgFqAXKmxfyj';
  const workflowUrl =
    process.env.ROBOFLOW_WORKFLOW_URL ||
    'https://serverless.roboflow.com/kumar-ritovash/workflows/building-infrastructure-defects-logic';

  if (!apiKey) {
    return res.status(500).json({
      status: 'error',
      message: 'ROBOFLOW_API_KEY is missing from server environment variables.',
      configured: false,
    });
  }

  try {
    const startTime = Date.now();
    // 1x1 test pixel base64 for health ping
    const testPixel = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    const response = await fetch(workflowUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        api_key: apiKey,
        inputs: {
          image: { type: 'base64', value: testPixel },
        },
      }),
    });

    const latencyMs = Date.now() - startTime;

    if (response.ok || response.status === 200 || response.status === 400) {
      return res.status(200).json({
        status: 'online',
        configured: true,
        workflowId: 'building-infrastructure-defects-logic',
        workflowUrl,
        latencyMs,
        httpStatus: response.status,
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(200).json({
      status: 'reachable',
      configured: true,
      workflowId: 'building-infrastructure-defects-logic',
      latencyMs,
      httpStatus: response.status,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(502).json({
      status: 'offline',
      configured: true,
      error: err?.message || 'Failed to reach Roboflow serverless endpoint.',
      timestamp: new Date().toISOString(),
    });
  }
}
