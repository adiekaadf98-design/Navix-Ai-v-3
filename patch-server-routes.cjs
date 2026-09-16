const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const apiCode = `
  // --- NAVIX AI DEVELOPER API ---
  const API_KEYS_FILE = path.join(process.cwd(), 'navix-api-keys.json');
  
  function getDeveloperKeys() {
    try {
      if (fs.existsSync(API_KEYS_FILE)) {
        return JSON.parse(fs.readFileSync(API_KEYS_FILE, 'utf8'));
      }
    } catch(e) {}
    return {};
  }
  
  function saveDeveloperKeys(keys) {
    fs.writeFileSync(API_KEYS_FILE, JSON.stringify(keys, null, 2));
  }

  // Get keys for a user
  app.get("/api/developer/keys", (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'Missing userId' });
    
    const allKeys = getDeveloperKeys();
    const userKeys = [];
    for (const [key, owner] of Object.entries(allKeys)) {
      if (owner === userId) userKeys.push(key);
    }
    res.json({ success: true, keys: userKeys });
  });

  // Generate a new key
  app.post("/api/developer/keys", (req, res) => {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'Missing userId' });
    
    const allKeys = getDeveloperKeys();
    const newKey = 'nvx_live_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    allKeys[newKey] = userId;
    saveDeveloperKeys(allKeys);
    
    res.json({ success: true, key: newKey });
  });

  // Delete a key
  app.delete("/api/developer/keys/:key", (req, res) => {
    const { key } = req.params;
    const { userId } = req.query;
    
    const allKeys = getDeveloperKeys();
    if (allKeys[key] && allKeys[key] === userId) {
      delete allKeys[key];
      saveDeveloperKeys(allKeys);
      return res.json({ success: true });
    }
    res.status(403).json({ error: 'Key not found or unauthorized' });
  });

  // --- THE NAVIX AI MODEL API ---
  const authenticateNavixApi = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: Missing Bearer token. Get your API key from Navix Developer Studio." });
    }
    const key = authHeader.split(" ")[1];
    const allKeys = getDeveloperKeys();
    if (!allKeys[key]) {
      return res.status(403).json({ error: "Forbidden: Invalid Navix API Key." });
    }
    req.navixUserId = allKeys[key];
    next();
  };

  // Navix Orchestrator Endpoint
  app.post("/v1/orchestrator/run", authenticateNavixApi, (req, res) => {
    const { prompt, model, plugins } = req.body;
    if (!prompt) return res.status(400).json({ error: "Missing prompt" });
    
    const response = {
      model: model || "navix-quant-v4",
      created: Math.floor(Date.now() / 1000),
      choices: [
        {
          message: {
            role: "assistant",
            content: "Halo! Saya adalah Navix AI yang berjalan melalui API kustom Anda.\\n\\nPesan Anda: \\"" + prompt + "\\"\\nModel: " + (model || "navix-quant-v4") + "\\nPlugin aktif: " + (plugins ? plugins.join(', ') : 'none')
          }
        }
      ],
      usage: {
        prompt_tokens: prompt.length,
        completion_tokens: 45,
        total_tokens: prompt.length + 45
      }
    };
    
    res.json(response);
  });
  
  // Standard OpenAI-compatible Chat Completions Endpoint
  app.post("/v1/chat/completions", authenticateNavixApi, (req, res) => {
    const { messages, model } = req.body;
    if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: "Invalid messages format" });
    
    const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || "";
    
    const response = {
      id: "chatcmpl-nvx-" + Date.now(),
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model: model || "navix-pro-v1",
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: "Halo! Ini adalah respons dari model bahasa Navix kustom Anda yang diakses via API. Anda berkata: \\"" + lastUserMessage + "\\""
          },
          finish_reason: "stop"
        }
      ],
      usage: {
        prompt_tokens: 10,
        completion_tokens: 30,
        total_tokens: 40
      }
    };
    
    res.json(response);
  });
`;

// Remove the old injection
const oldStart = "// --- NAVIX AI DEVELOPER API ---";
const oldEnd = "app.listen(PORT, \"0.0.0.0\", () => {";
const startIndex = content.indexOf(oldStart);
const endIndex = content.lastIndexOf(oldEnd);

if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + content.substring(endIndex);
}

// Inject BEFORE vite setup
const targetStr = `  // Setup Vite for development`;
if (content.includes(targetStr)) {
  content = content.replace(targetStr, apiCode + '\n' + targetStr);
  fs.writeFileSync('server.ts', content);
  console.log("Injected API successfully");
} else {
  // Try another target
  const targetStr2 = `  if (process.env.NODE_ENV !== "production") {`;
  if (content.includes(targetStr2)) {
    content = content.replace(targetStr2, apiCode + '\n' + targetStr2);
    fs.writeFileSync('server.ts', content);
    console.log("Injected API successfully (Target 2)");
  } else {
    console.log("Failed to find injection target");
  }
}
