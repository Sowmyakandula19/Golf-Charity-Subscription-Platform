import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ padding: '4rem 2rem', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--primary)' }}>Golf Charity Impact Platform</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', marginBottom: '2rem' }}>
        Track your golf performance, join monthly reward draws, and support your favorite charities.
      </p>
      <div>
        <Link href="/login" style={{
          display: 'inline-block',
          padding: '1rem 2rem',
          backgroundColor: 'var(--primary)',
          color: '#fff',
          borderRadius: '8px',
          fontWeight: 'bold',
          fontSize: '1.125rem',
          transition: 'transform 0.2s',
        }}>
          Get Started
        </Link>
      </div>
    </div>
  );
}
