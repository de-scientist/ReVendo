'use client';

import { useEffect } from 'react';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('ReVendo web error boundary:', error);
  }, [error]);

  return (
    <main className="page-shell" role="alert">
      <h1>Something went wrong.</h1>
      <p className="intro">Please try again. If the problem continues, contact support.</p>
      <button type="button" className="btn-primary" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
