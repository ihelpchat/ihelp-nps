/*
  # NPS System Schema

  1. New Tables
    - `nps_feedback`
      - `id` (uuid, primary key)
      - `user_id` (text, nullable) - to track anonymous vs authenticated users
      - `score` (integer) - NPS score from 0-10
      - `feedback` (text) - Optional feedback text
      - `created_at` (timestamp)
      - `website` (text) - Website where feedback was collected
      - `session_id` (text) - To prevent multiple submissions from same session
    
  2. Security
    - Enable RLS on `nps_feedback` table
    - Add policies for inserting feedback and reading feedback
*/

CREATE TABLE IF NOT EXISTS nps_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text,
  score integer NOT NULL CHECK (score >= 0 AND score <= 10),
  feedback text,
  created_at timestamptz DEFAULT now(),
  website text NOT NULL,
  session_id text NOT NULL
);

-- Enable RLS
ALTER TABLE nps_feedback ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert feedback
CREATE POLICY "Anyone can insert feedback" ON nps_feedback
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Only authenticated users can read feedback
CREATE POLICY "Only authenticated users can read feedback" ON nps_feedback
  FOR SELECT
  TO authenticated
  USING (true);

-- Create index for website and created_at for faster queries
CREATE INDEX nps_feedback_website_idx ON nps_feedback(website);
CREATE INDEX nps_feedback_created_at_idx ON nps_feedback(created_at);

-- Create unique constraint to prevent multiple submissions from same session
CREATE UNIQUE INDEX nps_feedback_session_website_idx ON nps_feedback(session_id, website);