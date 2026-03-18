-- Auto-generated from infocultura.sqlalchemy_live_models
-- Regenerate with: python -m infocultura.generate_sqlalchemy_live_ddl

CREATE TABLE clubs (
	id_clubs INTEGER NOT NULL AUTO_INCREMENT, 
	name VARCHAR(100) NOT NULL, 
	description TEXT, 
	mission TEXT, 
	is_active BOOL NOT NULL DEFAULT 1, 
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP, 
	enable_registrations BOOL, 
	PRIMARY KEY (id_clubs)
);

CREATE TABLE registrations (
	id_registrations INTEGER NOT NULL AUTO_INCREMENT, 
	name VARCHAR(100) NOT NULL, 
	email VARCHAR(150) NOT NULL, 
	phone VARCHAR(20), 
	message TEXT, 
	status VARCHAR(50) NOT NULL DEFAULT 'pending', 
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP, 
	PRIMARY KEY (id_registrations)
);

CREATE TABLE roles (
	id INTEGER NOT NULL AUTO_INCREMENT, 
	name VARCHAR(50) NOT NULL, 
	description TEXT, 
	PRIMARY KEY (id), 
	CONSTRAINT name UNIQUE (name)
);

CREATE TABLE users (
	id INTEGER NOT NULL AUTO_INCREMENT, 
	name VARCHAR(150) NOT NULL, 
	email VARCHAR(150) NOT NULL, 
	password_hash VARCHAR(255) NOT NULL, 
	role_id INTEGER NOT NULL, 
	is_active BOOL DEFAULT 1, 
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP, 
	id_clubs INTEGER, 
	PRIMARY KEY (id), 
	CONSTRAINT email UNIQUE (email), 
	CONSTRAINT fk_user_role FOREIGN KEY(role_id) REFERENCES roles (id), 
	CONSTRAINT fk_users_clubs FOREIGN KEY(id_clubs) REFERENCES clubs (id_clubs) ON DELETE SET NULL ON UPDATE CASCADE
);
