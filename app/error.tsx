'use client';

export default function RootError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: 300, padding: 40,
    }}>
      <div style={{ textAlign: 'center', maxWidth: 420 }}>
        <i className="ti ti-alert-triangle" style={{ fontSize: 36, color: 'var(--red)', marginBottom: 12 }}></i>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>Something went wrong</h2>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20, lineHeight: 1.5 }}>
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <button className="btn btn-primary" onClick={reset}>
          <i className="ti ti-refresh"></i> Try again
        </button>
      </div>
    </div>
  );
}
