import { CopyField } from './CopyField';

export function TokenPanel({
  writeToken,
  readToken,
  expiresAt,
}: {
  writeToken: string;
  readToken: string;
  expiresAt: string;
}) {
  return (
    <section className="panel" aria-labelledby="token-heading">
      <h2 id="token-heading">Your tokens</h2>
      <p>Save both tokens now. They cannot be recovered.</p>
      <CopyField label="Write token" value={writeToken} testId="write-token" />
      <p className="hint">Keep it secret. It uploads KPIs and opens the editor.</p>
      <CopyField label="Read token" value={readToken} testId="read-token" />
      <p className="hint">Share it. It shows your KPIs read-only.</p>
      <p>
        Both expire <strong>{expiresAt}</strong>. Every upload with the write token extends them by one
        week.
      </p>
      <p className="links">
        <a href={`/?token=${writeToken}`}>Open editor</a>
        <a href={`/?token=${readToken}`}>Open shared view</a>
      </p>
    </section>
  );
}
