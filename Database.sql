-- =========================================================
-- Base de dados: EVENTOS
-- Modelo gerado a partir do diagrama fornecido
-- Compatível com PostgreSQL
-- =========================================================

-- Limpar se já existirem
DROP TABLE IF EXISTS Resource_event CASCADE;
DROP TABLE IF EXISTS Session_event CASCADE;
DROP TABLE IF EXISTS Session_participant CASCADE;
DROP TABLE IF EXISTS Resources CASCADE;
DROP TABLE IF EXISTS Category CASCADE;
DROP TABLE IF EXISTS Event CASCADE;
DROP TABLE IF EXISTS Session CASCADE;
DROP TABLE IF EXISTS Participant CASCADE;
DROP TABLE IF EXISTS State CASCADE;
DROP TABLE IF EXISTS Types CASCADE;

-- =========================================================
-- TABELAS BASE
-- =========================================================

CREATE TABLE Category (
                          category_id SERIAL PRIMARY KEY,
                          name VARCHAR(100) NOT NULL
);

CREATE TABLE Types (
                       types_id SERIAL PRIMARY KEY,
                       name VARCHAR(100) NOT NULL
);

CREATE TABLE State (
                       state_id SERIAL PRIMARY KEY,
                       name VARCHAR(100) NOT NULL
);

CREATE TABLE Participant (
                             participant_id SERIAL PRIMARY KEY,
                             name VARCHAR(150) NOT NULL,
                             phone VARCHAR(30),
                             email VARCHAR(150),
                             types_id INT,
                             CONSTRAINT fk_participant_types
                                 FOREIGN KEY (types_id) REFERENCES Types (types_id)
                                     ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE Resources (
                           resources_id SERIAL PRIMARY KEY,
                           name VARCHAR(150) NOT NULL,
                           quantity INT,
                           unitary_cost DECIMAL(10,2),
                           category_id INT,
                           CONSTRAINT fk_resources_category
                               FOREIGN KEY (category_id) REFERENCES Category (category_id)
                                   ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE Event (
                       event_id SERIAL PRIMARY KEY,
                       name VARCHAR(150) NOT NULL,
                       description TEXT,
                       local VARCHAR(150),
                       initial_date DATE,
                       finish_date DATE,
                       state_id INT,
                       participant_id INT,
                       image BYTEA,
                       CONSTRAINT fk_event_state
                           FOREIGN KEY (state_id) REFERENCES State (state_id)
                               ON UPDATE CASCADE ON DELETE SET NULL,
                       CONSTRAINT fk_event_participant
                           FOREIGN KEY (participant_id) REFERENCES Participant (participant_id)
                               ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE Session (
                         session_id SERIAL PRIMARY KEY,
                         name VARCHAR(150) NOT NULL,
                         description TEXT,
                         local VARCHAR(150),
                         initial_date DATE,
                         finish_date DATE,
                         state VARCHAR(100),
                         image BYTEA
);

-- =========================================================
-- TABELAS DE RELAÇÃO (N:N)
-- =========================================================

CREATE TABLE Session_event (
                               session_id INT,
                               event_id INT,
                               PRIMARY KEY (session_id, event_id),
                               CONSTRAINT fk_session_event_session
                                   FOREIGN KEY (session_id) REFERENCES Session (session_id)
                                       ON UPDATE CASCADE ON DELETE CASCADE,
                               CONSTRAINT fk_session_event_event
                                   FOREIGN KEY (event_id) REFERENCES Event (event_id)
                                       ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE Session_participant (
                                     session_id INT,
                                     participant_id INT,
                                     PRIMARY KEY (session_id, participant_id),
                                     CONSTRAINT fk_session_participant_session
                                         FOREIGN KEY (session_id) REFERENCES Session (session_id)
                                             ON UPDATE CASCADE ON DELETE CASCADE,
                                     CONSTRAINT fk_session_participant_participant
                                         FOREIGN KEY (participant_id) REFERENCES Participant (participant_id)
                                             ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE Resource_event (
                                session_id INT,
                                event_id INT,
                                PRIMARY KEY (session_id, event_id),
                                CONSTRAINT fk_resource_event_session
                                    FOREIGN KEY (session_id) REFERENCES Session (session_id)
                                        ON UPDATE CASCADE ON DELETE CASCADE,
                                CONSTRAINT fk_resource_event_event
                                    FOREIGN KEY (event_id) REFERENCES Event (event_id)
                                        ON UPDATE CASCADE ON DELETE CASCADE
);
