'use client';

import type { FormEvent } from 'react';
import { UploadStatus } from './UploadStatus';
import { useKpiUpload } from './useKpiUpload';

export function UploadForm({ token }: { token: string }) {
  const { state, upload, fail } = useKpiUpload(token);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = event.currentTarget.elements.namedItem('file') as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (!file || file.size === 0) {
      fail('Choose a JSON file to upload.');
      return;
    }
    await upload(await file.text());
  }

  return (
    <form className="upload-form" onSubmit={onSubmit}>
      <label htmlFor="kpi-file">KPI file (JSON)</label>
      <input id="kpi-file" name="file" type="file" accept="application/json,.json" />
      <button type="submit" disabled={state.status === 'uploading'}>
        {state.status === 'uploading' ? 'Uploading…' : 'Upload'}
      </button>
      <UploadStatus state={state} />
    </form>
  );
}
