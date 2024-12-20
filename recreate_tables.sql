-- Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- First drop all dependent tables in correct order
DROP TABLE IF EXISTS memories_1536 CASCADE;
DROP TABLE IF EXISTS participants CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;

-- Now recreate all tables in correct order
CREATE TABLE accounts (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    "avatarUrl" TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    "userState" JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rooms (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL DEFAULT 'Unnamed Room',
    type TEXT DEFAULT 'direct',
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE participants (
    id UUID PRIMARY KEY,
    "userId" UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    "roomId" UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    "joinedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_message_read TIMESTAMPTZ,
    "userState" JSONB DEFAULT '{}'::jsonb,
    role TEXT DEFAULT 'member',
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("userId", "roomId")
);

CREATE TABLE memories_1536 (
    id UUID PRIMARY KEY,
    type TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    content JSONB NOT NULL,
    embedding vector(1536),
    "userId" UUID REFERENCES accounts(id) ON DELETE CASCADE,
    "roomId" UUID REFERENCES rooms(id) ON DELETE CASCADE,
    is_unique BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_participants_userid ON participants("userId");
CREATE INDEX IF NOT EXISTS idx_participants_roomid ON participants("roomId");
CREATE INDEX IF NOT EXISTS idx_memories_roomid ON memories_1536("roomId");
CREATE INDEX IF NOT EXISTS idx_memories_userid ON memories_1536("userId");

-- Insert seed data for all required accounts
INSERT INTO accounts (id, name, email, "avatarUrl", details, "userState") 
VALUES 
    ('00000000-0000-0000-0000-000000000000', 'Default Agent', 'default@agent.com', '', '{}'::jsonb, '{}'::jsonb),
    ('fe61a743-9330-0585-bb76-eeeed4430eac', 'UOS', 'uos@agent.com', '', '{}'::jsonb, '{}'::jsonb),
    ('59190e69-0299-0634-9f9c-4cd19aa3de3a', 'User', 'user@example.com', '', '{}'::jsonb, '{}'::jsonb),
    ('b71e7e81-3036-0659-bdbd-2ee297ea2f56', 'kidhanzo.', 'kidhanzo@example.com', '', '{}'::jsonb, '{}'::jsonb),
    ('430f2970-9b98-031e-9e05-b14c91cfae83', 'KIDHANZO', 'kidhanzo2@example.com', '', '{}'::jsonb, '{}'::jsonb);

-- Insert default room
INSERT INTO rooms (id, name, type, details)
VALUES ('00000000-0000-0000-0000-000000000000', 'Default Room', 'direct', '{}'::jsonb);

-- Link participants to the default room
INSERT INTO participants (id, "userId", "roomId", role, status, "userState")
VALUES 
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 'member', 'active', '{}'::jsonb),
    ('00000000-0000-0000-0000-000000000002', 'fe61a743-9330-0585-bb76-eeeed4430eac', '00000000-0000-0000-0000-000000000000', 'member', 'active', '{}'::jsonb),
    ('00000000-0000-0000-0000-000000000003', '59190e69-0299-0634-9f9c-4cd19aa3de3a', '00000000-0000-0000-0000-000000000000', 'member', 'active', '{}'::jsonb),
    ('00000000-0000-0000-0000-000000000004', 'b71e7e81-3036-0659-bdbd-2ee297ea2f56', '00000000-0000-0000-0000-000000000000', 'member', 'active', '{}'::jsonb),
    ('00000000-0000-0000-0000-000000000005', '430f2970-9b98-031e-9e05-b14c91cfae83', '00000000-0000-0000-0000-000000000000', 'member', 'active', '{}'::jsonb);
  