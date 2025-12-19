-- Adiciona coluna extra_data para armazenar dados dinâmicos das perguntas pós-NPS
-- Usando JSONB para flexibilidade futura sem necessidade de alterar schema

ALTER TABLE nps_feedback 
ADD COLUMN IF NOT EXISTS extra_data JSONB DEFAULT '{}';

-- Comentário na coluna
COMMENT ON COLUMN nps_feedback.extra_data IS 'Dados extras dinâmicos (perguntas pós-NPS, etc.)';

-- Adicionar política para permitir UPDATE do extra_data
CREATE POLICY "Anyone can update extra_data" ON nps_feedback
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);
