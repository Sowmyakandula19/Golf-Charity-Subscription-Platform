'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// Simplified Admin Dashboard for demo
export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [usersCount, setUsersCount] = useState(0);
  const [activeDraw, setActiveDraw] = useState<any>(null);
  const [pendingWinnings, setPendingWinnings] = useState<any[]>([]);

  useEffect(() => {
    checkAdmin();
    fetchStats();
  }, []);

  async function checkAdmin() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    // In a real app, use RLS or a secure server route. Here we check role on profile.
    const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (data?.role === 'admin') setIsAdmin(true);
  }

  async function fetchStats() {
    const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    setUsersCount(count || 0);

    const { data: pending } = await supabase.from('winnings').select('*, profiles(id)').eq('status', 'pending').not('proof_url', 'is', null);
    if (pending) setPendingWinnings(pending);

    const { data: dData } = await supabase.from('draws').select('*').order('created_at', { ascending: false }).limit(1).single();
    if (dData) setActiveDraw(dData);
  }

  async function verifyWinner(winningId: string) {
    await supabase.from('winnings').update({ status: 'verified' }).eq('id', winningId);
    fetchStats();
  }

  async function runDraw() {
    await fetch('/api/draws/execute', { method: 'POST', body: JSON.stringify({ algorithm: 'random' }) });
    fetchStats();
  }

  if (!isAdmin) return <div style={{ padding: '2rem' }}>Access Denied. Admins only.</div>;

  return (
    <div style={{ padding: '3rem 4rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', color: 'var(--text)' }}>Admin Control Panel</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
        <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <h3 style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textTransform: 'uppercase' }}>Total Users</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{usersCount}</p>
        </div>
        <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <h3 style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textTransform: 'uppercase' }}>Current Draw Pool</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>£{activeDraw?.total_pool || 0}</p>
        </div>
        <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textTransform: 'uppercase' }}>Execute Draw</h3>
            <p style={{ fontSize: '1rem' }}>Run monthly check</p>
          </div>
          <button onClick={runDraw} style={{ padding: '0.75rem 1.5rem', background: 'var(--error)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
            Run Now
          </button>
        </div>
      </div>

      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Pending Winner Verifications</h2>
      <div style={{ background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
        {pendingWinnings.length === 0 ? (
          <div style={{ padding: '2rem', color: 'var(--text-muted)', textAlign: 'center' }}>No verifications pending.</div>
        ) : (
          pendingWinnings.map(w => (
            <div key={w.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5rem', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Amount: £{w.amount}</p>
                <a href={w.proof_url} target="_blank" rel="noreferrer" style={{ color: 'var(--secondary)', textDecoration: 'underline', fontSize: '0.875rem' }}>View Proof Screenshot</a>
              </div>
              <button onClick={() => verifyWinner(w.id)} style={{ padding: '0.5rem 1rem', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                Approve & Mark Verified
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
