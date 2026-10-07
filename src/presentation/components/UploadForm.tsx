'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

type UploadState =
  | { status: 'idle' | 'uploading' | 'success' }
  | { status: 'error'; message: string; details: readonly string[] };

export function UploadForm({ token }: { token: string }) {
  const router = useRouter();
  const [state, setState] = useState<UploadState>({ status: 'idle' });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = event.currentTarget.elements.namedItem('file') as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (!file || file.size === 0) {
      setState({ status: 'error', message: 'Choose a JSON file to upload.', details: [] });
      return;
    }

    setState({ status: 'uploading' });
    try {
      const response = await fetch('/api/kpis', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: await file.text(),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as {
          error?: string;
          details?: string[];
        };
        setState({
          status: 'error',
          message: body.error ?? `Upload failed (HTTP ${response.status}).`,
          details: body.details ?? [],
        });
        return;
      }
      setState({ status: 'success' });
      router.push(`/?token=${encodeURIComponent(token)}`);
      router.refresh();
    } catch {
      setState({ status: 'error', message: 'Network error. Please try again.', details: [] });
    }
  }

  return (
    <form className="upload-form" onSubmit={onSubmit}>
      <label htmlFor="kpi-file">KPI file (JSON)</label>
      <input id="kpi-file" name="file" type="file" accept="application/json,.json" />
      <button type="submit" disabled={state.status === 'uploading'}>
        {state.status === 'uploading' ? 'Uploading…' : 'Upload'}
      </button>
      {state.status === 'success' && <p role="status">Upload successful.</p>}
      {state.status === 'error' && (
        <div role="alert" className="error">
          <p>{state.message}</p>
          {state.details.length > 0 && (
            <ul>
              {state.details.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </form>
  );
}
