'use client';

import { useState } from 'react';

export function TokenPanel({ token, expiresAt }: { token: string; expiresAt: string }) {
  const [copied, setCopied] = useState(false);
  const dashboardUrl = `/?token=${encodeURIComponent(token)}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="panel" aria-labelledby="token-heading">
      <h2 id="token-heading">Your access token</h2>
      <p>
        Save this token. It is the only way to access your dashboard and it cannot be recovered.
      </p>
      <div className="token">
        <code data-testid="token">{token}</code>
        <button type="button" onClick={copy}>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <p>
        Expires <strong>{expiresAt}</strong> unless you upload KPIs, which extends it by one week.
      </p>
      <p>
        <a href={dashboardUrl}>Open my dashboard</a>
      </p>
    </section>
  );
}
