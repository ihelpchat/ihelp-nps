-- Adiciona coluna tags para armazenar as tags associadas ao feedback
ALTER TABLE nps_feedback 
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Comentário na coluna
COMMENT ON COLUMN nps_feedback.tags IS 'Array de tags associadas ao feedback';
