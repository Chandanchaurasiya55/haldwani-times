/**
 * Parses a concatenated news title to check if it's a live updates post.
 * If yes, splits it into a prefix and a list of individual headlines.
 * 
 * @param {string} title 
 * @returns {{ prefix: string, headlines: string[] } | null}
 */
export const parseLiveTitle = (title) => {
  if (!title) return null;
  
  const lowerTitle = title.toLowerCase();
  
  // Hindi and English markers for Live News/Updates
  const isLive = 
    lowerTitle.includes('live') || 
    lowerTitle.includes('लाइव') || 
    lowerTitle.includes('update') || 
    lowerTitle.includes('अपडेट') ||
    lowerTitle.includes('ब्लॉग') ||
    lowerTitle.includes('blog') ||
    lowerTitle.includes('सुर्खियाँ') ||
    lowerTitle.includes('headlines');
    
  if (!isLive) return null;

  let prefix = '';
  let rest = title;
  
  // Check for separators in order of preference
  const separators = [':', ' - ', ' – ', ' — '];
  let splitIndex = -1;
  let chosenSeparator = '';
  
  for (const sep of separators) {
    const idx = title.indexOf(sep);
    if (idx !== -1 && idx < 120) {
      splitIndex = idx;
      chosenSeparator = sep;
      break;
    }
  }

  if (splitIndex !== -1) {
    prefix = title.substring(0, splitIndex).trim();
    rest = title.substring(splitIndex + chosenSeparator.length).trim();
  } else {
    // If no clear separator, check for common patterns like "लाइव अपडेट," or "live updates,"
    const liveUpdateIndex = title.search(/(लाइव अपडेट|live update|live blog|लाइव ब्लॉग)/i);
    if (liveUpdateIndex !== -1) {
      const commaIndex = title.indexOf(',', liveUpdateIndex);
      if (commaIndex !== -1 && commaIndex < 120) {
        prefix = title.substring(0, commaIndex).trim();
        rest = title.substring(commaIndex + 1).trim();
      }
    }
  }

  // Split rest by comma (,), pipe (|), danda (।), or semicolon (;)
  const parts = rest
    .split(/[,，;||।]\s*/)
    .map(p => p.trim())
    .filter(p => p.length > 5); // Must be a valid headline length

  if (parts.length > 1) {
    return {
      prefix: prefix || 'LIVE Updates',
      headlines: parts
    };
  }
  
  return null;
};
