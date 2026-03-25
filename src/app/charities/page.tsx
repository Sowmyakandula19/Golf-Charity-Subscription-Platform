import { supabase } from '@/lib/supabase';

export const revalidate = 60; // ISR cache every minute if needed

export default async function CharitiesPage() {
  const { data: charities } = await supabase.from('charities').select('*').order('name');

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '4rem 2rem' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--primary)', textAlign: 'center' }}>Supported Charities</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', textAlign: 'center', marginBottom: '3rem' }}>
        A portion of every subscription goes directly to the causes you care about.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
        {charities?.map((charity: any) => (
          <div key={charity.id} style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ 
              height: '160px', 
              background: charity.image_url ? `url(${charity.image_url}) center/cover` : 'var(--border)' 
            }} />
            <div style={{ padding: '1.5rem', flex: 1 }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>{charity.name}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                {charity.description || 'No description provided yet.'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
