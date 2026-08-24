// Server-side Roboflow proxy - no direct API key exposure to client
import { Defect, Inspection } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Clean and standardize defect class name
 */
export function formatDefectClassName(rawClass: string): string {
  if (!rawClass) return 'Structural Defect';
  const cleaned = rawClass.replace(/[-_]/g, ' ').trim();
  const lower = cleaned.toLowerCase();

  if (lower.includes('structural') && lower.includes('crack')) {
    return 'Structural Shear / Flexural Crack';
  }
  if (lower.includes('surface') && lower.includes('crack')) {
    return 'Surface Hairline & Shrinkage Crack';
  }
  if (lower.includes('shear') || (lower.includes('crack') && lower.includes('diag'))) {
    return 'Structural Shear Crack';
  }
  if (lower.includes('spall') || lower.includes('delaminat')) {
    return 'Concrete Spalling & Delamination';
  }
  if (lower.includes('rebar') || lower.includes('corrosion') || lower.includes('reinforce') || lower.includes('rust')) {
    return 'Reinforcement Rebar Corrosion & Spall';
  }
  if (lower.includes('honeycomb') || lower.includes('void')) {
    return 'Concrete Honeycombing & Voids';
  }
  if (lower.includes('efflorescence') || lower.includes('seep') || lower.includes('moisture') || lower.includes('water')) {
    return 'Efflorescence & Moisture Water Damage';
  }
  if (lower.includes('settlement') || lower.includes('step')) {
    return 'Differential Settlement Crack';
  }
  if (lower.includes('damage')) {
    return 'Structural Concrete Distress';
  }
  if (lower.includes('crack')) {
    return 'Concrete Structural Crack';
  }

  return cleaned
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * Upload an image File or Base64 data URL to Supabase Storage to get an accessible public HTTPS URL.
 */
export async function uploadImageToSupabaseStorage(
  imageSource: File | string,
  userId: string = 'user'
): Promise<string> {
  // If it's already a public HTTPS URL (not localhost or blob), return as is
  if (
    typeof imageSource === 'string' &&
    imageSource.startsWith('https://') &&
    !imageSource.includes('localhost') &&
    !imageSource.includes('127.0.0.1')
  ) {
    return imageSource;
  }

  if (isSupabaseConfigured && supabase) {
    try {
      let fileBlob: Blob;
      let fileExt = 'jpg';

      if (imageSource instanceof File) {
        fileBlob = imageSource;
        fileExt = imageSource.name.split('.').pop() || 'jpg';
      } else if (typeof imageSource === 'string' && imageSource.startsWith('data:')) {
        const mimeMatch = imageSource.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
        if (mimeMatch && mimeMatch[1]) {
          fileExt = mimeMatch[1].split('/')[1] || 'jpg';
        }
        const byteString = atob(imageSource.split(',')[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        fileBlob = new Blob([ab], { type: mimeMatch ? mimeMatch[1] : 'image/jpeg' });
      } else {
        throw new Error('Unsupported image input format');
      }

      const fileName = `${userId}/inspections/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from('structural-images')
        .upload(fileName, fileBlob, {
          cacheControl: '3600',
          upsert: true,
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from('structural-images')
          .getPublicUrl(fileName);

        if (publicUrlData?.publicUrl) {
          return publicUrlData.publicUrl;
        }
      }
    } catch (storageErr) {
      console.warn('Supabase storage upload returned warning:', storageErr);
    }
  }

  // If storage upload wasn't possible, return the string format if available
  if (typeof imageSource === 'string') {
    return imageSource;
  }

  // Convert File to data URL
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(imageSource);
  });
}

/**
 * Call server-side API proxy for Roboflow analysis
 * This routes through /api/roboflow/proxy which handles the actual Roboflow call server-side
 */
export async function executeServerSideRoboflowAnalysis(
  imageSource: File | string,
  elementName: string = 'Primary Structural Member',
  userId: string = 'user'
): Promise<any> {
  // Step 1: Resolve accessible image format
  let accessibleUrl: string | null = null;
  let base64Value: string | null = null;

  if (typeof imageSource === 'string') {
    if (imageSource.startsWith('https://') && !imageSource.includes('localhost')) {
      accessibleUrl = imageSource;
    } else if (imageSource.startsWith('data:')) {
      base64Value = imageSource.split('base64,')[1]?.trim() || imageSource;
    }
  }

  // If not yet an accessible HTTPS URL, upload to Supabase storage
  if (!accessibleUrl && !base64Value) {
    try {
      const uploadedUrl = await uploadImageToSupabaseStorage(imageSource, userId);
      if (uploadedUrl.startsWith('https://')) {
        accessibleUrl = uploadedUrl;
      } else if (uploadedUrl.startsWith('data:')) {
        base64Value = uploadedUrl.split('base64,')[1]?.trim() || uploadedUrl;
      }
    } catch (e) {
      console.warn('Storage upload fallback:', e);
      // Continue with base64 if available
      if (typeof imageSource === 'string' && imageSource.startsWith('data:')) {
        base64Value = imageSource.split('base64,')[1]?.trim();
      }
    }
  }

  // Prepare payload for server-side proxy
  const payload: any = {};
  if (accessibleUrl) {
    payload.imageUrl = accessibleUrl;
  } else if (base64Value) {
    payload.image = base64Value;
  } else if (typeof imageSource === 'string') {
    payload.image = imageSource;
  } else {
    throw new Error('Unable to construct a valid image payload for analysis.');
  }

  payload.element = elementName;

  // Step 2: Call server-side proxy endpoint
  const response = await fetch('/api/roboflow/proxy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let errorDetail = '';
    try {
      const errJson = await response.json();
      errorDetail = errJson.message || errJson.error || JSON.stringify(errJson);
    } catch {
      errorDetail = await response.text();
    }
    throw {
      stage: 'roboflow-proxy',
      status: response.status,
      statusText: response.statusText,
      message: `Roboflow Proxy HTTP ${response.status}: ${errorDetail || response.statusText}`,
      rawError: errorDetail,
    };
  }

  return await response.json();
}

/**
 * Fallback to Server-Side Gemini Visual Assessment if Roboflow workflow encounters an error
 */
export async function executeFallbackGeminiVisualAnalysis(
  imageSource: string,
  elementName: string,
  roboflowErrorMessage: string
): Promise<any> {
  const response = await fetch('/api/gemini-fallback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image: imageSource,
      element: elementName,
      roboflowError: roboflowErrorMessage,
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`Gemini fallback analysis failed (HTTP ${response.status}): ${errText}`);
  }

  const data = await response.json();
  return {
    ...data,
    provider: 'Gemini Visual Assessment — Roboflow unavailable',
    reportSource: 'Gemini Visual Assessment',
    isFallback: true,
  };
}

/**
 * Test Roboflow workflow connectivity via server-side proxy
 */
export async function testRoboflowConnectivity(): Promise<{
  status: string;
  configured: boolean;
  workflowId: string;
  latencyMs?: number;
  httpStatus?: number;
  message?: string;
}> {
  try {
    const response = await fetch('/api/roboflow/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      return {
        status: 'offline',
        configured: false,
        workflowId: 'building-infrastructure-defects-logic',
        httpStatus: response.status,
        message: `Health check returned HTTP ${response.status}`,
      };
    }

    return await response.json();
  } catch (err: any) {
    return {
      status: 'offline',
      configured: false,
      workflowId: 'building-infrastructure-defects-logic',
      message: err?.message || 'Unable to connect to health check endpoint',
    };
  }
}
