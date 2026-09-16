const fs = require('fs');

let serverCode = fs.readFileSync('server.ts', 'utf8');

// The GET /api/developer/keys is not returning usage, causing `usage` state to be null and Quota section to not show.
const oldKeysGet = `  app.get("/api/developer/keys", (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'Missing userId' });
    
    const allKeys = getDeveloperKeys();
    const userKeys = [];
    for (const [key, owner] of Object.entries(allKeys)) {
      if (owner === userId) userKeys.push(key);
    }
    res.json({ success: true, keys: userKeys });
  });`;

// In this mockup, we'll return a mock usage object if the user has keys.
const newKeysGet = `  app.get("/api/developer/keys", (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'Missing userId' });
    
    const allKeys = getDeveloperKeys();
    const userKeys = [];
    for (const [key, owner] of Object.entries(allKeys)) {
      if (owner === userId) userKeys.push({ id: key, key, createdAt: new Date().toISOString() });
    }
    
    // Provide a mocked usage for demonstration.
    // In a real app, you would fetch this from the quotaGuard/Firestore.
    const usage = userKeys.length > 0 ? {
      requests: 0,
      limit: 100,
      plan: 'Free Tier'
    } : null;

    res.json({ success: true, keys: userKeys, usage });
  });`;

if (serverCode.includes(oldKeysGet)) {
  serverCode = serverCode.replace(oldKeysGet, newKeysGet);
  fs.writeFileSync('server.ts', serverCode);
  console.log("Patched GET /api/developer/keys to include usage");
} else {
  // Try regex approach if exact match fails due to minor differences
  const regex = /app\.get\("\/api\/developer\/keys", \(req, res\) => \{[\s\S]*?res\.json\(\{ success: true, keys: userKeys \}\);\s*\}\);/;
  if (regex.test(serverCode)) {
      serverCode = serverCode.replace(regex, newKeysGet);
      fs.writeFileSync('server.ts', serverCode);
      console.log("Patched GET /api/developer/keys to include usage using regex");
  } else {
      console.log("Could not find the target code in server.ts");
  }
}
