'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Charity {
  id: string;
  name: string;
}

export default function SubscriptionPage() {
  const [profile, setProfile] = useState<any>(null);
  const [charities, setCharities] = useState<Charity[]>([]);
  const [selectedCharity, setSelectedCharity] = useState<string>('');
  const [percentage, setPercentage] = useState<number>(10);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: pData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (pData) {
      setProfile(pData);
      setSelectedCharity(pData.selected_charity_id || '');
      setPercentage(pData.charity_percentage || 10);
    }

    const { data: cData } = await supabase.from('charities').select('id, name');
    if (cData) setCharities(cData);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (percentage < 10) {
      setMessage('Minimum charity contribution is 10%');
      return;
    }
    setLoading(true);
    setMessage('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        selected_charity_id: selectedCharity || null,
        charity_percentage: percentage
      })
      .eq('id', user.id);

    if (error) setMessage('Error saving preferences.');
    else setMessage('Preferences updated successfully!');
    setLoading(false);
  }

  async function handleSubscribe() {
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: 'price_mock_monthly' })
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (e) {
      console.error(e);
    }
  }

  if (!profile) return <div style={{ color: 'var(--text-muted)' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: '600px' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: 'var(--text)' }}>Subscription & Charity</h1>

      <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Subscription Status</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: profile.subscription_status === 'active' ? 'var(--success)' : 'var(--warning)' }}>
              {profile.subscription_status.toUpperCase()}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>£14.99 / month</div>
          </div>
          {profile.subscription_status !== 'active' && (
            <button onClick={handleSubscribe} style={{ padding: '0.5rem 1rem', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
              Subscribe Now
            </button>
          )}
        </div>
      </div>

      <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Charity Preferences</h2>
        {message && <div style={{ marginBottom: '1rem', color: message.includes('Error') ? 'var(--error)' : 'var(--success)' }}>{message}</div>}
        
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Select Supported Charity</label>
            <select 
              value={selectedCharity} 
              onChange={e => setSelectedCharity(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text)' }}
            >
              <option value="">-- Choose a Charity --</option>
              {charities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Contribution Percentage (Min 10%)</label>
            <input 
              type="number" 
              min="10" max="100"
              value={percentage} 
              onChange={e => setPercentage(Number(e.target.value))}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text)' }}
            />
          </div>

          <button type="submit" disabled={loading} style={{ padding: '0.75rem', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
            {loading ? 'Saving...' : 'Save Preferences'}
          </button>
        </form>
      </div>
    </div>
  );
}
