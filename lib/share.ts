// Shareable Links - Encode/decode results to URL-safe strings

export interface ShareableData {
  experimentSlug: string;
  experimentName: string;
  result: {
    success: boolean;
    data?: any;
    error?: string;
  };
  metadata: {
    latency: number;
    costEstimate: number;
    totalTokens: number;
    cached: boolean;
    model: string;
  };
  timestamp: number;
  /** Input used for this run; when present, share page can offer "Reproduce" */
  input?: Record<string, any>;
}

/** Encode input only for ?repro= query param (smaller than full share payload) */
export function encodeReproInput(input: Record<string, any>): string {
  try {
    const jsonString = JSON.stringify(input);
    const base64 = btoa(unescape(encodeURIComponent(jsonString)));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  } catch {
    return '';
  }
}

/** Decode input from ?repro= query param */
export function decodeReproInput(encoded: string): Record<string, any> | null {
  try {
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const padding = 4 - (base64.length % 4);
    if (padding !== 4) base64 += '='.repeat(padding);
    const jsonString = decodeURIComponent(escape(atob(base64)));
    return JSON.parse(jsonString);
  } catch {
    return null;
  }
}

// Encode data to base64url for sharing
export function encodeShareData(data: ShareableData): string {
  try {
    const jsonString = JSON.stringify(data);
    // Use base64url encoding (URL-safe)
    const base64 = btoa(unescape(encodeURIComponent(jsonString)));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  } catch (error) {
    console.error('Failed to encode share data:', error);
    return '';
  }
}

// Decode shared data from URL
export function decodeShareData(encoded: string): ShareableData | null {
  try {
    // Restore base64 padding
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const padding = 4 - (base64.length % 4);
    if (padding !== 4) {
      base64 += '='.repeat(padding);
    }

    const jsonString = decodeURIComponent(escape(atob(base64)));
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Failed to decode share data:', error);
    return null;
  }
}

// Generate shareable URL
export function generateShareUrl(data: ShareableData): string {
  if (typeof window === 'undefined') return '';

  const encoded = encodeShareData(data);
  if (!encoded) return '';

  const url = new URL(window.location.origin + '/share');
  url.searchParams.set('d', encoded);
  return url.toString();
}

// Copy share link to clipboard
export async function copyShareLink(data: ShareableData): Promise<boolean> {
  try {
    const url = generateShareUrl(data);
    if (!url) return false;

    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    return false;
  }
}

// Validate share data
export function isValidShareData(data: any): data is ShareableData {
  return (
    data &&
    typeof data.experimentSlug === 'string' &&
    typeof data.experimentName === 'string' &&
    data.result &&
    typeof data.result.success === 'boolean' &&
    data.metadata &&
    typeof data.metadata.latency === 'number' &&
    typeof data.metadata.costEstimate === 'number'
  );
}
