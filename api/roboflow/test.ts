export default async function handler(req: any, res: any) {
  // Do NOT fall back to a hardcoded API key here — we want to be able to detect missing env vars in production
  const apiKey = process.env.ROBOFLOW_API_KEY;
  const workflowUrl =
    process.env.ROBOFLOW_WORKFLOW_URL ||
    'https://serverless.roboflow.com/kumar-ritovash/workflows/building-infrastructure-defects-logic';

  const configured = Boolean(apiKey);

  if (!apiKey) {
    return res.status(500).json({
      status: 'error',
      message: 'ROBOFLOW_API_KEY is missing from server environment variables. Please add it in your Vercel Project > Settings > Environment Variables (Environment: "Production/Preview/Development", Target: "Server").',
      configured,
    });
  }

  try {
    const startTime = Date.now();

    // 1x1 test pixel base64 for health ping
    const testPixel = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    // Use an AbortController to avoid hanging requests in serverless environment
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeoutMs = 10000; // 10s timeout
    let timeoutId: NodeJS.Timeout | null = null;
    if (controller) {
      timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    }

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
      signal: controller ? controller.signal : undefined,
    });

    if (timeoutId) clearTimeout(timeoutId);

    const latencyMs = Date.now() - startTime;

    // Read response body safely (some endpoints return HTML on error)
    let bodyText = '';
    try {
      bodyText = await response.text();
    } catch (e) {
      bodyText = '';
    }

    // Consider 200 and 400 successful for health check (400 may indicate payload validation but endpoint is reachable)
    if (response.ok || response.status === 200 || response.status === 400) {
      let parsed: any = null;
      try {
        parsed = JSON.parse(bodyText || '{}');
      } catch {
        parsed = { raw: bodyText };
      }

      return res.status(200).json({
        status: 'online',
        configured,
        workflowId: 'building-infrastructure-defects-logic',
        workflowUrl,
        latencyMs,
        httpStatus: response.status,
        responseBody: parsed,
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(200).json({
      status: 'reachable',
      configured,
      workflowId: 'building-infrastructure-defects-logic',
      latencyMs,
      httpStatus: response.status,
      responseBody: bodyText,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    // Distinguish between abort (timeout) and other network errors
    const isAbort = err && (err.name === 'AbortError' || err.code === 'ABORT_ERR');
    return res.status(502).json({
      status: isAbort ? 'timeout' : 'offline',
      configured: Boolean(process.env.ROBOFLOW_API_KEY),
      error: err?.message || 'Failed to reach Roboflow serverless endpoint.',
      timestamp: new Date().toISOString(),
    });
  }
}
