CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Seed Default Admin Account (password is 'admin123' hashed with SHA-256)
INSERT IGNORE INTO admins (id, username, email, password)
VALUES (
  1, 
  'admin', 
  'admin@haldwanitimes.com', 
  '240eb51851b970875f187a8100c77fe199b0d9187b5a10a1354e7d3dd260f36c'
);
