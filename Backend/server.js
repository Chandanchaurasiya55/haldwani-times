import app from './src/app.js';
import config from './src/config/config.js';
import db from './src/config/db.js';

import { startNewsSync } from './src/services/newsSync.js';

const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log(`Server is running in ${config.env} mode on port ${PORT}`);
  
  // Dynamic schema migrations for existing databases
  db.query("SHOW COLUMNS FROM articles LIKE 'source_name'", (err, rows) => {
    if (!err && rows.length === 0) {
      db.query("ALTER TABLE articles ADD COLUMN source_name VARCHAR(255) DEFAULT NULL", (err2) => {
        if (err2) console.error("Migration error adding source_name:", err2.message);
        else console.log("Database migrated: added source_name column.");
      });
    }
  });

  db.query("SHOW COLUMNS FROM articles LIKE 'source_url'", (err, rows) => {
    if (!err && rows.length === 0) {
      db.query("ALTER TABLE articles ADD COLUMN source_url TEXT DEFAULT NULL", (err2) => {
        if (err2) console.error("Migration error adding source_url:", err2.message);
        else console.log("Database migrated: added source_url column.");
      });
    }
  });

  // Start real-time background news synchronizer
  startNewsSync();
});

// Handle graceful shutdowns and unhandled rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
  server.close(() => process.exit(1));
});
