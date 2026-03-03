-- Sess�es de exemplo ligadas a eventos existentes
-- Ajuste event_id se necess�rio
INSERT INTO session (session_id, name, description, local, initial_date, finish_date, state) VALUES
  (1,'Sessao Manha','Bloco de 1h30','Porto','2025-11-12 09:00:00','2025-11-12 10:30:00','Planeado'),
  (2,'Sessao Tarde','Bloco de 1h30','Porto','2025-11-12 14:00:00','2025-11-12 15:30:00','Planeado'),
  (3,'Sessao Manha','Bloco de 1h30','Lisboa','2025-11-19 09:00:00','2025-11-19 10:30:00','Planeado'),
  (4,'Sessao Tarde','Bloco de 1h30','Lisboa','2025-11-19 14:00:00','2025-11-19 15:30:00','Planeado');
