CREATE TABLE IF NOT EXISTS ads (
  slot_id VARCHAR(50) PRIMARY KEY,
  image_url TEXT,
  target_url TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT IGNORE INTO ads (slot_id, image_url, target_url) VALUES 
('AD 1', '', ''),
('AD 2', '', ''),
('AD 3', '', ''),
('AD 4', '', ''),
('AD 5', '', ''),
('AD 6', '', ''),
('AD 7', '', '');
