-- Exemplos de recursos para arrancar a app
-- (Opcional) adapte ou apague se nÇœo quiser seed de dados
INSERT INTO resources (name, quantity, unitary_cost, category_id) VALUES
('Projetor Epson', 3, '1500.00', (SELECT category_id FROM category WHERE name = 'Projetor')),
('Portatil Apoio', 5, '800.00', (SELECT category_id FROM category WHERE name = 'Computador')),
('Router WiFi', 2, '120.00', (SELECT category_id FROM category WHERE name = 'Hub/Router')),
('Colunas PA', 4, '250.00', (SELECT category_id FROM category WHERE name = 'Sistema de Som')),
('Microfone Sem Fios', 6, '90.00', (SELECT category_id FROM category WHERE name = 'Microfone')),
('ExtensÇäo HDMI', 10, '15.00', (SELECT category_id FROM category WHERE name = 'Cabos/Adaptadores'));
