import { ReactNode } from 'react';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      {/* Sidebar Navigation */}
      <aside style={{
        width: '280px',
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        padding: '2rem 1.5rem',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <h2 style={{ fontSize: '1.5rem', color: 'var(--text)', marginBottom: '2rem' }}>Impact<br/>Dashboard</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Link href="/dashboard" style={{ padding: '0.75rem 1rem', borderRadius: '8px', color: 'var(--text)', background: 'var(--primary)', fontWeight: '500' }}>
            Overview
          </Link>
          <Link href="/dashboard/scores" style={{ padding: '0.75rem 1rem', borderRadius: '8px', color: 'var(--text-muted)' }}>
            My Scores
          </Link>
          <Link href="/dashboard/subscription" style={{ padding: '0.75rem 1rem', borderRadius: '8px', color: 'var(--text-muted)' }}>
            Subscription & Charity
          </Link>
          <Link href="/dashboard/winnings" style={{ padding: '0.75rem 1rem', borderRadius: '8px', color: 'var(--text-muted)' }}>
            My Winnings
          </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '3rem 4rem' }}>
        {children}
      </main>
    </div>
  );
}
