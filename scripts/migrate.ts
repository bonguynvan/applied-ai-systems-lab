import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('DATABASE_URL is not defined in .env.local');
    process.exit(1);
}

const sql = `
-- Feedback
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY,
  experiment_slug TEXT NOT NULL,
  execution_id TEXT NOT NULL,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics executions
CREATE TABLE IF NOT EXISTS analytics_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_slug TEXT NOT NULL,
  latency FLOAT NOT NULL,
  cost FLOAT NOT NULL,
  tokens INT NOT NULL,
  cached BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feature toggles
CREATE TABLE IF NOT EXISTS feature_toggles (
  id UUID PRIMARY KEY,
  experiment_slug TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  rollout_percentage INT NOT NULL DEFAULT 100,
  variants TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  modified_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(experiment_slug, name)
);

-- Prompt iterations
CREATE TABLE IF NOT EXISTS prompt_iterations (
  id UUID PRIMARY KEY,
  experiment_slug TEXT NOT NULL,
  version INT NOT NULL,
  prompt_text TEXT NOT NULL,
  reasoning TEXT NOT NULL,
  latency_change FLOAT,
  quality_change FLOAT,
  cost_change FLOAT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Learnings
CREATE TABLE IF NOT EXISTS learnings (
  id UUID PRIMARY KEY,
  experiment_slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  evidence TEXT[] NOT NULL DEFAULT '{}',
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Experiment states
CREATE TABLE IF NOT EXISTS experiment_states (
  experiment_slug TEXT PRIMARY KEY,
  state TEXT NOT NULL,
  goals TEXT,
  hypothesis TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_feedback_slug ON feedback(experiment_slug);
CREATE INDEX IF NOT EXISTS idx_analytics_slug ON analytics_executions(experiment_slug);
CREATE INDEX IF NOT EXISTS idx_toggles_slug ON feature_toggles(experiment_slug);
CREATE INDEX IF NOT EXISTS idx_iterations_slug ON prompt_iterations(experiment_slug);
CREATE INDEX IF NOT EXISTS idx_learnings_slug ON learnings(experiment_slug);
CREATE INDEX IF NOT EXISTS idx_states_slug ON experiment_states(experiment_slug);
`;

async function migrate() {
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false },
    });

    try {
        await client.connect();
        console.log('Connected to Neon DB');
        await client.query(sql);
        console.log('Schema migration successful');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

migrate();
