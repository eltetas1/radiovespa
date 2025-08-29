DROP TABLE IF EXISTS clics;
DROP TABLE IF EXISTS vespas;

CREATE TABLE vespas (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    telefono TEXT NOT NULL,
    servicios TEXT,
    tamano TEXT,
    zonas TEXT,
    horario TEXT,
    notas TEXT,
    visible BOOLEAN DEFAULT TRUE,
    prioridad INT DEFAULT 1,
    trabajos_verificados INT DEFAULT 0,
    destacado BOOLEAN DEFAULT FALSE
);

CREATE TABLE clics (
    id SERIAL PRIMARY KEY,
    vespa_id INT REFERENCES vespas(id) ON DELETE CASCADE,
    telefono_cliente TEXT NOT NULL,
    fecha TIMESTAMP DEFAULT NOW()
);
