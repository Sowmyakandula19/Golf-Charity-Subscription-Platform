'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Score {
  id: string;
  score: number;
  date: string;
}

export default function ScoresPage() {
  const [scores, setScores] = useState<Score[]>([]);
  const [scoreInput, setScoreInput] = useState<number | ''>('');
  const [dateInput, setDateInput] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchScores();
  }, []);

  async function fetchScores() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('scores')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) console.error('Error fetching scores:', error);
    else setScores(data || []);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (scoreInput === '' || scoreInput < 1 || scoreInput > 45) {
      setError('Score must be between 1 and 45.');
      return;
    }
    setError(null);
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error: insertError } = await supabase
      .from('scores')
      .insert([{ user_id: user.id, score: Number(scoreInput), date: dateInput }]);

    if (insertError) setError(insertError.message);
    else {
      setScoreInput('');
      setDateInput('');
      fetchScores();
    }
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: '600px' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: 'var(--text)' }}>My Scores</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Log your latest Stableford scores. We automatically keep track of your 5 most recent rounds.
      </p>

      <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Log a New Score</h2>
        {error && <div style={{ color: 'var(--error)', marginBottom: '1rem' }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Score (1 - 45)</label>
            <input 
              type="number" 
              min="1" max="45"
              value={scoreInput} 
              onChange={e => setScoreInput(Number(e.target.value))}
              required
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text)' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Date</label>
            <input 
              type="date"
              value={dateInput} 
              onChange={e => setDateInput(e.target.value)}
              required
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text)' }}
            />
          </div>
          <button type="submit" disabled={loading} style={{ padding: '0.75rem 2rem', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
            {loading ? '...' : 'Add Score'}
          </button>
        </form>
      </div>

      <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Recent Scores</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {scores.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No scores logged yet.</p>
        ) : (
          scores.map((s, idx) => (
            <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 1.5rem', background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div>
                <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{s.score} Points</span>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Stableford</div>
              </div>
              <div style={{ color: 'var(--text-muted)' }}>{new Date(s.date).toLocaleDateString()}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
