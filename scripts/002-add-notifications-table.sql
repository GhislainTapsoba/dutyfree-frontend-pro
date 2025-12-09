-- =====================================================
-- DUTY FREE MANAGEMENT SYSTEM - NOTIFICATIONS TABLE
-- =====================================================

-- Table des notifications utilisateur
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),

  read BOOLEAN DEFAULT false,

  -- Métadonnées optionnelles
  action_url VARCHAR(500),
  entity_type VARCHAR(50),
  entity_id UUID,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created ON notifications(created_at);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, read) WHERE read = false;

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at automatiquement
CREATE TRIGGER trigger_update_notifications_updated_at
BEFORE UPDATE ON notifications
FOR EACH ROW
EXECUTE FUNCTION update_notifications_updated_at();

-- Commentaires
COMMENT ON TABLE notifications IS 'Table des notifications utilisateur';
COMMENT ON COLUMN notifications.type IS 'Type de notification: info, warning, error, success';
COMMENT ON COLUMN notifications.read IS 'Indique si la notification a été lue';
COMMENT ON COLUMN notifications.action_url IS 'URL optionnelle vers une action liée à la notification';
COMMENT ON COLUMN notifications.entity_type IS 'Type d''entité liée (sale, product, stock, etc.)';
COMMENT ON COLUMN notifications.entity_id IS 'ID de l''entité liée';
