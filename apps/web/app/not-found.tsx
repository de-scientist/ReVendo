import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="page-shell">
      <p className="eyebrow">404</p>
      <h1>
        This page <span>found a new home.</span>
      </h1>
      <p className="intro">The page you asked for does not exist or was moved.</p>
      <Link className="btn-primary" href="/">
        Back to ReVendo
      </Link>
    </main>
  );
}
