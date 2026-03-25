import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { algorithm } = await req.json(); // 'random' or 'algorithmic'
    
    // Mock calculations for PRD
    const mockTotalSubscribers = 100;
    const contributionPerUser = 7.50; // £7.50 to pool
    let totalPool = mockTotalSubscribers * contributionPerUser;

    // 1. Generate 5 Winning Numbers (1 - 45)
    // Supports Random for MVP, algorithmic logic would weight by frequency.
    const winningNumbers = new Set<number>();
    while(winningNumbers.size < 5) {
      winningNumbers.add(Math.floor(Math.random() * 45) + 1);
    }
    const numbersArray = Array.from(winningNumbers);

    // 2. Create Draw Record (Pending state)
    const { data: draw, error: drawError } = await supabase.from('draws').insert([{
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      winning_numbers: numbersArray,
      status: 'pending',
      total_pool: totalPool
    }]).select().single();

    if (drawError) throw drawError;

    // 3. Process Participants
    const { data: users } = await supabase.from('profiles').select('id, subscription_status').eq('subscription_status', 'active');
    
    let match5Count = 0;
    let match4Count = 0;
    let match3Count = 0;
    let winners: any[] = [];

    if (users) {
      for (const user of users) {
        const { data: userScores } = await supabase
           .from('scores')
           .select('score')
           .eq('user_id', user.id)
           .order('date', { ascending: false })
           .limit(5);
           
        if (userScores && userScores.length === 5) {
           const scoresSet = new Set(userScores.map(s => s.score));
           let matches = 0;
           numbersArray.forEach(n => {
             if (scoresSet.has(n)) matches++;
           });
           
           if (matches === 5) { match5Count++; winners.push({ userId: user.id, match: 5 }); }
           else if (matches === 4) { match4Count++; winners.push({ userId: user.id, match: 4 }); }
           else if (matches === 3) { match3Count++; winners.push({ userId: user.id, match: 3 }); }
        }
      }
    }

    // 4. Distribute Pools
    const pool5 = totalPool * 0.40;
    const pool4 = totalPool * 0.35;
    const pool3 = totalPool * 0.25;

    const winningsToInsert = winners.map(w => {
      let amount = 0;
      if (w.match === 5) amount = pool5 / match5Count;
      if (w.match === 4) amount = pool4 / match4Count;
      if (w.match === 3) amount = pool3 / match3Count;
      return {
        draw_id: draw.id,
        user_id: w.userId,
        match_type: w.match,
        amount: Number(amount.toFixed(2)),
        status: 'pending' // pending winner verification
      };
    });

    if (winningsToInsert.length > 0) {
      await supabase.from('winnings').insert(winningsToInsert);
    }

    return NextResponse.json({ 
      drawId: draw.id,
      winningNumbers: numbersArray,
      totalPool,
      winners: { match5: match5Count, match4: match4Count, match3: match3Count }
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
