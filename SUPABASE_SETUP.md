# Supabase Setup Guide

## Step 1: Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in:
   - **Name**: thevent
   - **Database Password**: (save this securely)
   - **Region**: Choose closest to your users
4. Wait 2-3 minutes for project to be created

## Step 2: Get API Credentials

1. Go to Project Settings → API
2. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (the long key under "Project API keys")
3. Create `supabaseConfig.js` from `supabaseConfig.example.js` and paste your values

## Step 3: Set Up Database Schema

Run the SQL below in the **SQL Editor** (https://app.supabase.com/project/YOUR_PROJECT/sql):

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  emoji TEXT DEFAULT '😊',
  profile_pic TEXT,
  bio TEXT,
  expo_push_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Posts table
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  category TEXT,
  likes_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Replies table
CREATE TABLE replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Likes table (for tracking who liked what)
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  post_text TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_replies_post_id ON replies(post_id);
CREATE INDEX idx_replies_created_at ON replies(created_at DESC);
CREATE INDEX idx_likes_post_id ON likes(post_id);
CREATE INDEX idx_likes_user_id ON likes(user_id);
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id, created_at DESC);

-- Function to update likes count
CREATE OR REPLACE FUNCTION update_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update replies count
CREATE OR REPLACE FUNCTION update_replies_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET replies_count = replies_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET replies_count = replies_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER likes_count_trigger
AFTER INSERT OR DELETE ON likes
FOR EACH ROW EXECUTE FUNCTION update_likes_count();

CREATE TRIGGER replies_count_trigger
AFTER INSERT OR DELETE ON replies
FOR EACH ROW EXECUTE FUNCTION update_replies_count();
```

## Step 4: Set Up Row Level Security (RLS)

Run this SQL to enable security policies:

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = auth_id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = auth_id);

-- Posts policies
CREATE POLICY "Anyone can read posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create posts" ON posts FOR INSERT WITH CHECK (auth.uid() IN (SELECT auth_id FROM users WHERE id = user_id));
CREATE POLICY "Users can update own posts" ON posts FOR UPDATE USING (auth.uid() IN (SELECT auth_id FROM users WHERE id = user_id));
CREATE POLICY "Users can delete own posts" ON posts FOR DELETE USING (auth.uid() IN (SELECT auth_id FROM users WHERE id = user_id));

-- Replies policies
CREATE POLICY "Anyone can read replies" ON replies FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create replies" ON replies FOR INSERT WITH CHECK (auth.uid() IN (SELECT auth_id FROM users WHERE id = user_id));
CREATE POLICY "Users can delete own replies" ON replies FOR DELETE USING (auth.uid() IN (SELECT auth_id FROM users WHERE id = user_id));

-- Likes policies
CREATE POLICY "Anyone can read likes" ON likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like posts" ON likes FOR INSERT WITH CHECK (auth.uid() IN (SELECT auth_id FROM users WHERE id = user_id));
CREATE POLICY "Users can unlike posts" ON likes FOR DELETE USING (auth.uid() IN (SELECT auth_id FROM users WHERE id = user_id));

-- Notifications policies
CREATE POLICY "Users can read own notifications" ON notifications FOR SELECT USING (auth.uid() IN (SELECT auth_id FROM users WHERE id = recipient_id));
CREATE POLICY "Users can create notifications" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() IN (SELECT auth_id FROM users WHERE id = recipient_id));
```

## Step 5: Configure Authentication

1. Go to **Authentication → Providers**
2. Enable **Email** provider
3. Disable email confirmation (Settings → Auth → Email Auth → Confirm email = OFF) for easier testing
4. Later enable it for production

## Step 6: Test Your Setup

After completing the migration, test:
- [ ] User registration
- [ ] User login
- [ ] Post creation
- [ ] Like functionality
- [ ] Reply functionality
- [ ] Notifications
- [ ] Profile updates

## Notes

- **Supabase Free Tier**: 500MB database, 1GB file storage, 2GB bandwidth
- **Self-hosting**: Use Docker for completely free unlimited usage
- **API Keys**: The anon key is safe for client-side use (RLS protects your data)
- **Real-time**: Supabase supports real-time subscriptions like Firebase
