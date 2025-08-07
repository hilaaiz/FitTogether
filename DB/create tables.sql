CREATE TABLE clients (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    location VARCHAR(200)
);

-- Client passwords table
CREATE TABLE client_passwords (
    client_id VARCHAR(50) PRIMARY KEY,
    password_hash VARCHAR(255) NOT NULL,
    FOREIGN KEY (client_id) REFERENCES clients(id)
);

-- Providers table (workshop facilitators)
CREATE TABLE providers (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    business_name VARCHAR(200),
    bio TEXT,
    location VARCHAR(200),
    average_rating DECIMAL(2,1) DEFAULT 0.0,
    rating_count INT DEFAULT 0
);

-- Provider passwords table
CREATE TABLE provider_passwords (
    provider_id VARCHAR(50) PRIMARY KEY,
    password_hash VARCHAR(255) NOT NULL,
    FOREIGN KEY (provider_id) REFERENCES providers(id)
);

-- Workshops table
CREATE TABLE workshops (
    id VARCHAR(50) PRIMARY KEY,
    provider_id VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    location VARCHAR(200) NOT NULL,
    duration_hours INT NOT NULL,
    max_participants INT NOT NULL,
    registered_participants INT DEFAULT 0,
    workshop_date DATE NOT NULL,
    constraints_text TEXT,
    is_active BOOLEAN DEFAULT true,
    FOREIGN KEY (provider_id) REFERENCES providers(id)
);

-- Bookings table
CREATE TABLE bookings (
    id VARCHAR(50) PRIMARY KEY,
    client_id VARCHAR(50) NOT NULL,
    workshop_id VARCHAR(50) NOT NULL,
    booking_date DATE NOT NULL,
    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (workshop_id) REFERENCES workshops(id)
);