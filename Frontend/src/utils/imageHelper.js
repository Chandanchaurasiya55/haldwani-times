const categoryPlaceholders = {
  uttarakhand: [
    'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80', // Mountains
    'https://images.unsplash.com/photo-1626621427793-2751336c648f?auto=format&fit=crop&w=800&q=80', // Temple/hills
    'https://images.unsplash.com/photo-1593181629936-11c609b8db9b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1561361058-c24cecae35ca?auto=format&fit=crop&w=800&q=80'
  ],
  india: [
    'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80', // Taj Mahal
    'https://images.unsplash.com/photo-1532375810709-75b1da00537c?auto=format&fit=crop&w=800&q=80', // Varanasi
    'https://images.unsplash.com/photo-1496372412473-e8548ffd82bc?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80'
  ],
  politics: [
    'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=800&q=80', // Voting / Podium
    'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=800&q=80', // Law / Government
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80'
  ],
  business: [
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80', // Chart
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80', // Skyscrapers / Office
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80'
  ],
  education: [
    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80', // University / Grad
    'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=800&q=80', // Student / Books
    'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=800&q=80'
  ],
  celebrity: [
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80', // Concert
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80', // Show / Entertainment
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80'
  ],
  world: [
    'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=800&q=80', // Globe / Planet
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80', // Digital World
    'https://images.unsplash.com/photo-1526253038957-bce54e05968e?auto=format&fit=crop&w=800&q=80'
  ],
  food: [
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80', // Food Table
    'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?auto=format&fit=crop&w=800&q=80'
  ],
  default: [
    'https://images.unsplash.com/photo-1495020689067-958852a6565d?auto=format&fit=crop&w=800&q=80', // Newspaper
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80', // News mic
    'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80' // Journalism
  ]
};

export function getFallbackImage(title, categoryName) {
  const cleanTitle = (title || '').toLowerCase();
  const cat = (categoryName || '').toLowerCase().trim();
  let key = 'default';

  if (cat.includes('uttarakhand') || cat.includes('local') || cleanTitle.includes('haldwani') || cleanTitle.includes('uttarakhand')) {
    key = 'uttarakhand';
  } else if (cat.includes('india') || cat.includes('national')) {
    key = 'india';
  } else if (cat.includes('politics')) {
    key = 'politics';
  } else if (cat.includes('business') || cat.includes('economy')) {
    key = 'business';
  } else if (cat.includes('education') || cat.includes('school') || cat.includes('exam')) {
    key = 'education';
  } else if (cat.includes('celebrity') || cat.includes('entertainment') || cat.includes('movie')) {
    key = 'celebrity';
  } else if (cat.includes('world') || cat.includes('international')) {
    key = 'world';
  } else if (cat.includes('food') || cat.includes('recipe')) {
    key = 'food';
  }

  const list = categoryPlaceholders[key] || categoryPlaceholders['default'];
  
  // Create hash of the title to deterministically select one of the placeholder images
  let hash = 0;
  const str = title || '';
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % list.length;
  
  return list[idx];
}
