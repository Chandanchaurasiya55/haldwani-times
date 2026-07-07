CREATE TABLE IF NOT EXISTS reporters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Seed Default Reporter Account (id 1, password is 'reporter123' hashed with SHA-256)
INSERT IGNORE INTO reporters (id, username, email, password, status)
VALUES (
  1, 
  'editorial_team', 
  'editorial@haldwanitimes.com', 
  '20e971d604e954ef8f3438a3d1323f46f3661138287d3a08892f3af5ea57849e', 
  'active'
);
