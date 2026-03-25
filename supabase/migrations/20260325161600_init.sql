-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Profile Table
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE  PRIMARY KEY,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    subscription_status TEXT DEFAULT 'inactive',
    stripe_customer_id TEXT,
    selected_charity_id UUID,
    charity_percentage NUMERIC DEFAULT 10.0 CHECK (charity_percentage >= 10.0 AND charity_percentage <= 100.0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Charities Table
CREATE TABLE charities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add foreign key reference from profiles to charities now that charities exists
ALTER TABLE profiles
    ADD CONSTRAINT fk_charity
    FOREIGN KEY (selected_charity_id) 
    REFERENCES charities(id) ON DELETE SET NULL;

-- Scores Table
CREATE TABLE scores (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 1 AND score <= 45),
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Function to ensure only rolling 5 scores are kept per user
CREATE OR REPLACE FUNCTION maintain_rolling_five_scores()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM scores
    WHERE id IN (
        SELECT id FROM scores
        WHERE user_id = NEW.user_id
        ORDER BY date DESC, created_at DESC
        OFFSET 5
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_maintain_scores
AFTER INSERT ON scores
FOR EACH ROW
EXECUTE FUNCTION maintain_rolling_five_scores();

-- Draws Table
CREATE TABLE draws (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL,
    winning_numbers INTEGER[] NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'published')),
    total_pool NUMERIC DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Winnings Table
CREATE TABLE winnings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    draw_id UUID REFERENCES draws(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    match_type INTEGER NOT NULL CHECK (match_type IN (3, 4, 5)),
    amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'paid')),
    proof_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger to create profile automatically on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, subscription_status)
  VALUES (new.id, 'user', 'inactive');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Row Level Security (RLS) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

ALTER TABLE charities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Charities viewable by everyone." ON charities FOR SELECT USING (true);

ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own scores." ON scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own scores." ON scores FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE draws ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published draws viewable by everyone." ON draws FOR SELECT USING (status = 'published');

ALTER TABLE winnings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own winnings." ON winnings FOR SELECT USING (auth.uid() = user_id);
