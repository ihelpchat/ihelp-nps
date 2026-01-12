-- Cria tabela de campanhas NPS para permitir múltiplos ciclos (ex: NPS Janeiro, NPS Março)
CREATE TABLE IF NOT EXISTS nps_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  start_date date,
  end_date date,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE nps_campaigns IS 'Campanhas/ciclos de NPS (ex: NPS Janeiro 2025)';
COMMENT ON COLUMN nps_campaigns.name IS 'Nome da campanha (ex: NPS Janeiro 2025)';
COMMENT ON COLUMN nps_campaigns.is_active IS 'Controla exibição do widget para a campanha';

-- Gatilho simples para updated_at
CREATE OR REPLACE FUNCTION set_nps_campaigns_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_nps_campaigns_updated_at ON nps_campaigns;
CREATE TRIGGER trg_nps_campaigns_updated_at
BEFORE UPDATE ON nps_campaigns
FOR EACH ROW EXECUTE FUNCTION set_nps_campaigns_updated_at();

-- Índices úteis
CREATE INDEX IF NOT EXISTS idx_nps_campaigns_active ON nps_campaigns(is_active);
CREATE INDEX IF NOT EXISTS idx_nps_campaigns_dates ON nps_campaigns(start_date, end_date);

-- Adiciona campaign_id ao feedback para vincular resposta à campanha
ALTER TABLE nps_feedback
ADD COLUMN IF NOT EXISTS campaign_id uuid REFERENCES nps_campaigns(id);

CREATE INDEX IF NOT EXISTS idx_nps_feedback_campaign ON nps_feedback(campaign_id);
CREATE INDEX IF NOT EXISTS idx_nps_feedback_campaign_created_at ON nps_feedback(campaign_id, created_at);

COMMENT ON COLUMN nps_feedback.campaign_id IS 'Campanha NPS relacionada à resposta';

-- RLS básica para campanhas: leitura autenticada; escrita apenas para autenticados (ajuste conforme necessidade de papel)
ALTER TABLE nps_campaigns ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'nps_campaigns' AND policyname = 'campaigns_select_authenticated'
  ) THEN
    CREATE POLICY campaigns_select_authenticated ON nps_campaigns
      FOR SELECT TO authenticated USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'nps_campaigns' AND policyname = 'campaigns_write_authenticated'
  ) THEN
    CREATE POLICY campaigns_write_authenticated ON nps_campaigns
      FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;
