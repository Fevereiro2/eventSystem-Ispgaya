-- =========================================================
-- Base de dados: EVENTOS (SQLite)
-- =========================================================

-- Limpar se já existirem (sem CASCADE no SQLite)
DROP TABLE IF EXISTS Resource_event;
DROP TABLE IF EXISTS Session_participant;
DROP TABLE IF EXISTS Session_event;
DROP TABLE IF EXISTS Resources;
DROP TABLE IF EXISTS Category;
DROP TABLE IF EXISTS Event;
DROP TABLE IF EXISTS Session;
DROP TABLE IF EXISTS Participant;
DROP TABLE IF EXISTS State;
DROP TABLE IF EXISTS Types;

-- Configurar para permitir a alteração das tabelas com chaves estrangeiras
PRAGMA foreign_keys = ON;

-- =========================================================
-- TABELAS BASE
-- =========================================================

CREATE TABLE Category (
    category_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
);

CREATE TABLE Types (
    types_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
);

CREATE TABLE State (
    state_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
);

CREATE TABLE Participant (
    participant_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    types_id INTEGER,
    CONSTRAINT fk_participant_types
        FOREIGN KEY (types_id) REFERENCES Types (types_id)
            ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE Resources (
    resources_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    quantity INTEGER,
    unitary_cost REAL, -- Alterado de DECIMAL(10,2) para REAL
    category_id INTEGER,
    CONSTRAINT fk_resources_category
        FOREIGN KEY (category_id) REFERENCES Category (category_id)
            ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE Event (
    event_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    local TEXT,
    initial_date TEXT, -- Datas geralmente armazenadas como TEXT/ISO 8601 no SQLite
    finish_date TEXT,
    state_id INTEGER,
    participant_id INTEGER,
    image BLOB, -- Alterado de BYTEA para BLOB
    CONSTRAINT fk_event_state
        FOREIGN KEY (state_id) REFERENCES State (state_id)
            ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_event_participant
        FOREIGN KEY (participant_id) REFERENCES Participant (participant_id)
            ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE Session (
    session_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    local TEXT,
    initial_date TEXT,
    finish_date TEXT,
    state TEXT, -- Assumindo que o estado aqui era uma string (VARCHAR)
    image BLOB -- Alterado de BYTEA para BLOB
);

-- =========================================================
-- TABELAS DE RELAÇÃO (N:N)
-- =========================================================

CREATE TABLE Session_event (
    session_id INTEGER,
    event_id INTEGER,
    PRIMARY KEY (session_id, event_id),
    CONSTRAINT fk_session_event_session
        FOREIGN KEY (session_id) REFERENCES Session (session_id)
            ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_session_event_event
        FOREIGN KEY (event_id) REFERENCES Event (event_id)
            ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE Session_participant (
    session_id INTEGER,
    participant_id INTEGER,
    PRIMARY KEY (session_id, participant_id),
    CONSTRAINT fk_session_participant_session
        FOREIGN KEY (session_id) REFERENCES Session (session_id)
            ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_session_participant_participant
        FOREIGN KEY (participant_id) REFERENCES Participant (participant_id)
            ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE Resource_event (
    session_id INTEGER,
    event_id INTEGER,
    PRIMARY KEY (session_id, event_id),
    CONSTRAINT fk_resource_event_session
        FOREIGN KEY (session_id) REFERENCES Session (session_id)
            ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_resource_event_event
        FOREIGN KEY (event_id) REFERENCES Event (event_id)
            ON UPDATE CASCADE ON DELETE CASCADE
);