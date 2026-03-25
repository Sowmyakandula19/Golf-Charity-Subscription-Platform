'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function WinningsPage() {
  const [winnings, setWinnings] = useState<any[]>([]);
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchWinnings();
  }, []);

  async function fetchWinnings() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('winnings')
      .select('*, draws(month, year)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) setWinnings(data);
  }

  async function handleUpload(winningId: string, file: File) {
    setLoadingMap(prev => ({ ...prev, [winningId]: true }));
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${winningId}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from('proofs').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('proofs').getPublicUrl(filePath);

      await supabase.from('winnings').update({ proof_url: publicUrl }).eq('id', winningId);
      
      fetchWinnings();
    } catch (e: any) {
      alert(e.message || 'Upload failed');
    } finally {
      setLoadingMap(prev => ({ ...prev, [winningId]: false }));
    }
  }

  return (
    <div style={{ maxWidth: '800px' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: 'var(--text)' }}>My Winnings</h1>
      
      {winnings.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>You haven't won any draws yet. Keep playing!</p>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {winnings.map(w => (
            <div key={w.id} style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>£{w.amount}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    {w.match_type}-Number Match · {w.draws?.month}/{w.draws?.year}
                  </p>
                </div>
                <div style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  fontSize: '0.875rem',
                  fontWeight: 'bold',
                  background: w.status === 'paid' ? 'var(--success)' : (w.status === 'verified' ? 'var(--primary)' : 'var(--warning)'),
                  color: w.status === 'pending' ? '#000' : '#fff'
                }}>
                  {w.status.toUpperCase()}
                </div>
              </div>

              {w.status === 'pending' && !w.proof_url && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                  <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Action Required: Upload a screenshot of your official golf handicap / score entry to verify.</p>
                  <label style={{ display: 'inline-block', padding: '0.5rem 1rem', background: 'var(--secondary)', color: '#fff', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    {loadingMap[w.id] ? 'Uploading...' : 'Upload Proof'}
                    <input 
                      type="file" 
                      accept="image/*" 
                      style={{ display: 'none' }}
                      onChange={e => e.target.files && handleUpload(w.id, e.target.files[0])}
                      disabled={loadingMap[w.id]}
                    />
                  </label>
                </div>
              )}

              {w.proof_url && w.status === 'pending' && (
                <div style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  Proof uploaded. Pending admin verification.
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
