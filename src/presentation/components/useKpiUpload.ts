import { useRouter } from 'next/navigation';
import { useState } from 'react';

export type UploadState =
  | { status: 'idle' | 'uploading' | 'success' }
  | { status: 'error'; message: string; details: readonly string[] };

/** Sends a KPI JSON body with the write token and refreshes the editor on success. */
export function useKpiUpload(token: string) {
  const router = useRouter();
  const [state, setState] = useState<UploadState>({ status: 'idle' });

  function fail(message: string, details: readonly string[] = []) {
    setState({ status: 'error', message, details });
  }

  async function upload(body: string) {
    setState({ status: 'uploading' });
    try {
      const response = await fetch('/api/kpis', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body,
      });
      if (!response.ok) {
        const problem = (await response.json().catch(() => ({}))) as {
          error?: string;
          details?: string[];
        };
        fail(problem.error ?? `Upload failed (HTTP ${response.status}).`, problem.details);
        return;
      }
      setState({ status: 'success' });
      router.push(`/?token=${encodeURIComponent(token)}`);
      router.refresh();
    } catch {
      fail('Network error. Please try again.');
    }
  }

  return { state, upload, fail };
}
