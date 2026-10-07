import type { UploadState } from './useKpiUpload';

export function UploadStatus({
  state,
  successMessage = 'Upload successful.',
}: {
  state: UploadState;
  successMessage?: string;
}) {
  if (state.status === 'success') return <p role="status">{successMessage}</p>;
  if (state.status !== 'error') return null;
  return (
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
  );
}
