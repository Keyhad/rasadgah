'use client';

import { useState, type FormEvent } from 'react';
import { UploadStatus } from './UploadStatus';
import { useKpiUpload } from './useKpiUpload';

/** Starting point for a dashboard that has no report yet. */
export const KPI_TEMPLATE = `{
  "kpis": [
    {
      "id": "active-users",
      "label": "Active users",
      "value": 0,
      "unit": "number"
    }
  ]
}`;

export function JsonEditor({ token, initialJson }: { token: string; initialJson: string }) {
  const { state, upload, fail } = useKpiUpload(token);
  const [text, setText] = useState(initialJson);
  const busy = state.status === 'uploading';

  function parse(): { ok: true; value: unknown } | { ok: false } {
    try {
      return { ok: true, value: JSON.parse(text) };
    } catch (error) {
      fail(`Invalid JSON: ${(error as Error).message}`);
      return { ok: false };
    }
  }

  function format() {
    const parsed = parse();
    if (parsed.ok) setText(JSON.stringify(parsed.value, null, 2));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (parse().ok) await upload(text);
  }

  return (
    <form className="json-editor" onSubmit={onSubmit}>
      <label htmlFor="kpi-json">KPI JSON</label>
      <textarea
        id="kpi-json"
        value={text}
        onChange={(event) => setText(event.target.value)}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        rows={18}
      />
      <div className="json-editor__actions">
        <button type="submit" disabled={busy}>
          {busy ? 'Saving…' : 'Save'}
        </button>
        <button type="button" className="secondary" onClick={format}>
          Format
        </button>
        <button
          type="button"
          className="secondary"
          onClick={() => setText(initialJson)}
          disabled={text === initialJson}
        >
          Reset
        </button>
      </div>
      <UploadStatus state={state} successMessage="Saved." />
    </form>
  );
}
