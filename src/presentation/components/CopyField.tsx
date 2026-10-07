'use client';

import { useState } from 'react';

interface CopyFieldProps {
  label: string;
  value: string;
  /** When set, `value` is a relative URL: an "Open" link is shown and the absolute URL is copied. */
  isLink?: boolean;
  testId?: string;
}

export function CopyField({ label, value, isLink = false, testId }: CopyFieldProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const text = isLink ? new URL(value, window.location.href).href : value;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="copy-field">
      <span className="copy-field__label">{label}</span>
      <div className="token">
        <code data-testid={testId}>{value}</code>
        <button type="button" onClick={copy} aria-label={`${copied ? 'Copied' : 'Copy'} ${label}`}>
          {copied ? 'Copied' : 'Copy'}
        </button>
        {isLink && <a href={value}>Open</a>}
      </div>
    </div>
  );
}
