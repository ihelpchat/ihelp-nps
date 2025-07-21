-- Criar tabela para registrar quando o widget NPS é fechado pelo usuário
CREATE TABLE IF NOT EXISTS nps_widget_closed (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  closed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  business_id TEXT,
  email TEXT,
  url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar índices para melhorar a performance das consultas
CREATE INDEX IF NOT EXISTS idx_nps_widget_closed_user_id ON nps_widget_closed(user_id);
CREATE INDEX IF NOT EXISTS idx_nps_widget_closed_email ON nps_widget_closed(email);
CREATE INDEX IF NOT EXISTS idx_nps_widget_closed_business_id ON nps_widget_closed(business_id);

-- Comentários na tabela e colunas
COMMENT ON TABLE nps_widget_closed IS 'Registra quando um usuário fecha o widget NPS';
COMMENT ON COLUMN nps_widget_closed.user_id IS 'ID do usuário que fechou o widget';
COMMENT ON COLUMN nps_widget_closed.closed_at IS 'Data e hora em que o widget foi fechado';
COMMENT ON COLUMN nps_widget_closed.business_id IS 'ID da empresa relacionada ao usuário';
COMMENT ON COLUMN nps_widget_closed.email IS 'Email do usuário que fechou o widget';
COMMENT ON COLUMN nps_widget_closed.url IS 'URL da página onde o widget foi fechado';
