import db from '../config/db.js';

function cleanString(str) {
  if (!str) return '';
  return str
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1') // Extract CDATA content
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/<[^>]*>/g, '') // Strip HTML tags
    .trim();
}

console.log('Starting database cleanup for raw HTML tags in article content...');

db.query('SELECT id, content FROM articles', (err, rows) => {
  if (err) {
    console.error('Failed to select articles:', err.message);
    process.exit(1);
  }

  console.log(`Found ${rows.length} articles to check.`);
  let cleanedCount = 0;
  let index = 0;

  const updateNext = () => {
    if (index < rows.length) {
      const row = rows[index];
      const cleaned = cleanString(row.content);

      if (cleaned !== row.content) {
        db.query('UPDATE articles SET content = ? WHERE id = ?', [cleaned, row.id], (upErr) => {
          if (upErr) {
            console.error(`Error updating article ${row.id}:`, upErr.message);
          } else {
            cleanedCount++;
          }
          index++;
          updateNext();
        });
      } else {
        index++;
        updateNext();
      }
    } else {
      console.log(`Cleanup complete! Cleaned HTML from ${cleanedCount} articles.`);
      process.exit(0);
    }
  };

  updateNext();
});
