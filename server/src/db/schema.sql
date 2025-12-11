-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    institution VARCHAR(255),
    role VARCHAR(50) DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tournaments table
CREATE TABLE tournaments (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    location VARCHAR(255),
    format VARCHAR(100),
    category VARCHAR(100),
    language VARCHAR(50),
    cost DECIMAL(10,2),
    registration_deadline DATE,
    max_participants INTEGER,
    organizer_id INTEGER REFERENCES users(id),
    is_featured BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'upcoming',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Registrations table
CREATE TABLE registrations (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER REFERENCES tournaments(id),
    user_id INTEGER REFERENCES users(id),
    team_name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tournament_id, user_id)
);

-- Resources table
CREATE TABLE resources (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_url VARCHAR(255) NOT NULL,
    tournament_id INTEGER REFERENCES tournaments(id),
    uploader_id INTEGER REFERENCES users(id),
    price DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Resource purchases table
CREATE TABLE resource_purchases (
    id SERIAL PRIMARY KEY,
    resource_id INTEGER REFERENCES resources(id),
    buyer_id INTEGER REFERENCES users(id),
    purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    amount_paid DECIMAL(10,2) NOT NULL
); 